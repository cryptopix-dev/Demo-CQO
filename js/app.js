import { QuantumSystem, AXIS } from './cqo.js';

// --- State Management ---
const systemA = new QuantumSystem('A');
const systemB = new QuantumSystem('B');

// Initial setup to match vector concept
// A = Coherent (1, 0, 0)
// B = Entanglement-Ready (0, 1, 0)
systemA.chi.vector = [0.8, 0.6, 0.0];
systemA.chi.normalize();

systemB.chi.vector = [0.1, 0.9, 0.4];
systemB.chi.normalize();

let isEntangled = false;
let animationId;

// --- DOM Elements ---
const canvasA = document.getElementById('canvas-a');
const canvasB = document.getElementById('canvas-b');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');
const consoleEl = document.getElementById('console-log');
const entangleBtn = document.getElementById('entangle-btn');

// --- Visualization Engine (Pseudo-3D) ---
function drawSystem(ctx, system, time) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.35;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Wireframe Sphere 
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    drawEllipse(ctx, cx, cy, radius, radius * 0.4 * Math.sin(time * 0.001), 0);
    drawEllipse(ctx, cx, cy, radius * 0.4 * Math.cos(time * 0.0012), radius, Math.PI / 2);

    // 2. Draw Vector State
    // c0 -> Y, c1 -> X, c2 -> Z
    const [c0, c1, c2] = system.chi.vector;

    const x3d = c1 * radius;
    const y3d = -c0 * radius;
    const z3d = c2 * radius;

    const rotSpeed = 0.0005;
    const rotAngle = time * rotSpeed;

    const xRot = x3d * Math.cos(rotAngle) - z3d * Math.sin(rotAngle);
    const zRot = x3d * Math.sin(rotAngle) + z3d * Math.cos(rotAngle);
    const yRot = y3d;

    const scale = 1 + (zRot / radius) * 0.2;
    const x2d = cx + xRot;
    const y2d = cy + yRot;

    // Line
    const grad = ctx.createLinearGradient(cx, cy, x2d, y2d);
    grad.addColorStop(0, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, '#fff');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2d, y2d);
    ctx.stroke();

    // Orb
    ctx.beginPath();
    ctx.arc(x2d, y2d, 8 * scale, 0, Math.PI * 2);

    // Color mixing based on vector magnitude
    // c0=Blue/Cyan, c1=Magenta, c2=Lime
    // Color mixing based on vector magnitude using new CSS theme colors
    // c0=Cyan (34, 211, 238), c1=Rose (244, 63, 94), c2=Yellow (250, 204, 21)

    // Base colors
    const colors = {
        c0: { r: 34, g: 211, b: 238 },
        c1: { r: 244, g: 63, b: 94 },
        c2: { r: 250, g: 204, b: 21 }
    };

    const mag0 = Math.abs(c0);
    const mag1 = Math.abs(c1);
    const mag2 = Math.abs(c2);
    const total = mag0 + mag1 + mag2 || 1; // Avoid divide by zero

    // Weighted average
    const r = Math.floor((colors.c0.r * mag0 + colors.c1.r * mag1 + colors.c2.r * mag2) / total);
    const g = Math.floor((colors.c0.g * mag0 + colors.c1.g * mag1 + colors.c2.g * mag2) / total);
    const b = Math.floor((colors.c0.b * mag0 + colors.c1.b * mag1 + colors.c2.b * mag2) / total);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawEllipse(ctx, cx, cy, rx, ry, rotation) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rotation, 0, 2 * Math.PI);
    ctx.stroke();
}

function updateBars(id, system) {
    const [c0, c1, c2] = system.chi.vector;

    // Use safe navigation or checks (though ids are likely stable)
    const bar0 = document.getElementById(`bar-${id}-0`);
    const bar1 = document.getElementById(`bar-${id}-1`);
    const bar2 = document.getElementById(`bar-${id}-2`);

    if (bar0) bar0.style.width = `${Math.abs(c0) * 100}%`;
    if (bar1) bar1.style.width = `${Math.abs(c1) * 100}%`;
    if (bar2) bar2.style.width = `${Math.abs(c2) * 100}%`;

    const badge = document.getElementById(`status-${id}`);
    if (badge) {
        if (Math.abs(c2) > 0.3) {
            badge.textContent = "SHEARED";
            badge.style.color = "var(--state-dec)";
            badge.style.borderColor = "var(--state-dec)";
        } else if (isEntangled) {
            badge.textContent = "ENTANGLED";
            badge.style.color = "var(--state-ent)";
            badge.style.borderColor = "var(--state-ent)";
        } else {
            badge.textContent = "COHERENT";
            badge.style.color = "var(--state-coh)";
            badge.style.borderColor = "var(--state-coh)";
        }
    }
}

function updateScientificData() {
    // Robust check for elements before updating
    // System A Telemetry
    const valA = document.getElementById('val-a-0');
    if (valA) {
        // [0.12, 0.45, 0.00]
        valA.textContent = `[${systemA.chi.c0.toFixed(2)}, ${systemA.chi.c1.toFixed(2)}, ${systemA.chi.c2.toFixed(2)}]`;
    }

    // System B Telemetry
    const valB = document.getElementById('val-b-0');
    if (valB) {
        valB.textContent = `[${systemB.chi.c0.toFixed(2)}, ${systemB.chi.c1.toFixed(2)}, ${systemB.chi.c2.toFixed(2)}]`;
    }

    // Correlation Telemetry
    const corrEl = document.getElementById('corr-val');
    const corr = systemA.checkCorrelation();
    if (corrEl) corrEl.textContent = corr.toFixed(4);

    // Shear Alert
    const shearA = Math.abs(systemA.chi.c2);
    const shearB = Math.abs(systemB.chi.c2);
    const shearEl = document.getElementById('shear-alert');

    if (shearEl) {
        if (shearA > 0.1 || shearB > 0.1) {
            shearEl.textContent = "CRITICAL (SHEAR DETECTED)";
            shearEl.style.color = "#ef4444"; // Manual red fallback
            shearEl.style.fontWeight = "bold";
        } else if (isEntangled) {
            shearEl.textContent = "SAFE (LOCKED)";
            shearEl.style.color = "#22d3ee";
        } else {
            shearEl.textContent = "SAFE (LOCAL)";
            shearEl.style.color = "#22d3ee";
        }
    }
}

// --- Interaction Logic ---

window.measure = (sysId) => {
    const sys = sysId === 'A' ? systemA : systemB;
    const outcome = sys.chi.measure();
    log(`Measurement Event on ${sysId}: Vector Collapsed to Basis ${outcome}`);

    if (isEntangled) {
        const other = sysId === 'A' ? systemB : systemA;
        // Perfect correlation enforcement
        if (outcome === AXIS.COHERENCE) other.chi.vector = [1, 0, 0];
        if (outcome === AXIS.ENTANGLEMENT) other.chi.vector = [0, 1, 0];
        if (outcome === AXIS.DECOHERENCE) other.chi.vector = [0, 0, 1];

        isEntangled = false;
        entangleBtn.classList.remove('active');
        const linkState = document.getElementById('link-state');
        if (linkState) {
            linkState.textContent = 'DISCONNECTED';
            linkState.style.color = '#a1a1aa';
        }
        log(`Non-local Correlation: System ${other.id} state inferred instantly.`);
    }
};

window.disturb = (sysId) => {
    const sys = sysId === 'A' ? systemA : systemB;
    const shear = sys.chi.interact(0.4); // Significant interaction
    log(`INTERFERENCE: Chromatic Shear of ${shear.toFixed(3)} detected on ${sysId}.`);

    if (isEntangled) {
        log(`Security Alert: Entangled pair integrity compromised.`);
    }
}

entangleBtn.addEventListener('click', () => {
    isEntangled = !isEntangled;
    const linkState = document.getElementById('link-state');

    if (isEntangled) {
        systemA.entangle(systemB);
        entangleBtn.classList.add('active');
        if (linkState) {
            linkState.textContent = 'LINK ESTABLISHED';
            linkState.style.color = '#f472b6';
        }
        log('Systems Entangled. Bell State initialized.');
    } else {
        systemA.entangledPartner = null;
        systemB.entangledPartner = null;
        isEntangled = false;
        entangleBtn.classList.remove('active');
        if (linkState) {
            linkState.textContent = 'DISCONNECTED';
            linkState.style.color = '#a1a1aa';
        }
        log('Entanglement Broken.');
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    systemA.chi.vector = [0.8, 0.6, 0.0]; systemA.chi.normalize();
    systemB.chi.vector = [0.1, 0.9, 0.4]; systemB.chi.normalize();
    isEntangled = false;

    entangleBtn.classList.remove('active');
    const linkState = document.getElementById('link-state');
    if (linkState) {
        linkState.textContent = 'DISCONNECTED';
        linkState.style.color = '#a1a1aa';
    }

    log('System Reset to Initial Parameters.');

    // Clear key status
    const kStatus = document.getElementById('key-status');
    const kStream = document.getElementById('key-stream');
    const qber = document.getElementById('qber-val');
    if (kStatus) { kStatus.textContent = 'IDLE'; kStatus.style.color = '#fff'; }
    if (kStream) { kStream.textContent = '// WAITING FOR TRANSMISSION...'; kStream.className = 'qkd-display'; }
    if (qber) qber.textContent = '0.00%';
});

// --- QKD Logic ---
const runQkdBtn = document.getElementById('run-qkd-btn');
const keyDisplay = document.getElementById('key-stream');
const qberDisplay = document.getElementById('qber-val');
const keyStatus = document.getElementById('key-status');

runQkdBtn.addEventListener('click', () => {
    log('Starting QKD Sequence (128 bits)...');
    keyDisplay.textContent = "Negotiating...";
    keyDisplay.className = 'qkd-display'; // Reset class

    // Simulate Transmission
    // In this ontology, Error Rate is directly proportional to Shear (Cr2)
    // If Shear > Threshold, Key is unsafe.

    const shear = Math.max(Math.abs(systemA.chi.c2), Math.abs(systemB.chi.c2));
    const isCompromised = shear > 0.05; // 5% noise threshold

    setTimeout(() => {
        if (isCompromised) {
            // Compromised Scenario
            const errRate = 0.25 + (shear / 2); // High error rate
            qberDisplay.textContent = (errRate * 100).toFixed(2) + '%';
            keyStatus.textContent = "COMPROMISED (SHEAR DETECTED)";
            keyStatus.style.color = "var(--state-danger)";

            keyDisplay.textContent = "[KEY DISCARDED DUE TO EAVESDROPPING]";
            keyDisplay.classList.add('error'); // Use new CSS class .error on qkd-display
            log(`QKD FAILED: Excess Shear (${shear.toFixed(3)}) detected.`);
        } else {
            // Secure Scenario
            qberDisplay.textContent = "0.00%";
            keyStatus.textContent = "SECURE ESTABLISHED";
            keyStatus.style.color = "var(--state-coh)";

            keyDisplay.textContent = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
            // In new CSS, default color is Cyan (state-coh), so no extra class needed unless specific styling
            log('QKD SUCCESS: Secure Key Distilled.');
        }
    }, 1000);
});

function log(msg) {
    const entry = document.createElement('div');
    // In design: footer -> console-log is just one line. 
    // We can just update textContent or append.
    // The previous CSS had .log-entry. New CSS doesn't show .log-entry styles explicitly but has #console-log
    // Let's just update the text content of #console-log for simplicity in the new footer style
    consoleEl.textContent = `> ${msg}`;
}

// --- Main Loop ---
function loop(time) {
    if (!isEntangled) {
        systemA.chi.evolve(0.02);
        systemB.chi.evolve(0.015);
    } else {
        // In entangled state, phases are locked
        systemA.chi.evolve(0.02);
        systemB.chi.vector = [...systemA.chi.vector]; // Perfect lock
    }

    drawSystem(ctxA, systemA, time);
    drawSystem(ctxB, systemB, time);

    updateBars('a', systemA);
    updateBars('b', systemB);
    updateScientificData();

    requestAnimationFrame(loop);
}

log('CQO Reference Engine Validated.');
requestAnimationFrame(loop);
