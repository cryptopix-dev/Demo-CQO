const { ChromaticState, BASIS } = require('./cqo-core');

class Alice {
    constructor() {
        this.bits = [];
        this.bases = [];
    }

    // Phase 1: Preparation
    prepareQubits(count) {
        this.bits = [];
        this.bases = [];
        const qubits = [];

        for (let i = 0; i < count; i++) {
            // 1. Generate random bit (0 or 1)
            const bit = Math.random() < 0.5 ? 0 : 1;

            // 2. Generate random basis (+ or x)
            const basis = Math.random() < 0.5 ? BASIS.RECTILINEAR : BASIS.DIAGONAL;

            // 3. Create Physical State (Ontological Vector)
            const qubit = ChromaticState.prepare(bit, basis);

            // Store private info
            this.bits.push(bit);
            this.bases.push(basis);
            qubits.push(qubit);
        }

        return qubits;
    }
}

class Eve {
    constructor() {
        this.interceptedCount = 0;
    }

    // Phase 2: Interception (Man-In-The-Middle)
    intercept(qubits, intensity = 0.0) {
        if (intensity <= 0) return qubits;

        // Eve interacts with every qubit passing through the channel
        qubits.forEach(q => {
            q.interact(intensity);
        });

        this.interceptedCount += qubits.length;
        return qubits;
    }
}

class Bob {
    constructor() {
        this.bases = [];
        this.measuredBits = [];
    }

    // Phase 3: Measurement
    measureQubits(qubits) {
        this.bases = [];
        this.measuredBits = [];

        qubits.forEach(q => {
            // 1. Choose random basis
            const basis = Math.random() < 0.5 ? BASIS.RECTILINEAR : BASIS.DIAGONAL;

            // 2. Perform Measurement (Collapse)
            const result = q.measure(basis);

            this.bases.push(basis);
            this.measuredBits.push(result);
        });

        return this.measuredBits;
    }
}

// Phase 4: Sifting (Public Discussion)
function siftKeys(aliceBases, bobBases, aliceBits, bobBits) {
    const aliceSifted = [];
    const bobSifted = [];

    for (let i = 0; i < aliceBases.length; i++) {
        if (aliceBases[i] === bobBases[i]) {
            aliceSifted.push(aliceBits[i]);
            bobSifted.push(bobBits[i]);
        }
    }

    return { aliceSifted, bobSifted };
}

// Phase 5: Error Estimation
function calculateQBER(keyA, keyB) {
    if (keyA.length === 0) return 0;

    let errors = 0;
    for (let i = 0; i < keyA.length; i++) {
        if (keyA[i] !== keyB[i]) {
            errors++;
        }
    }
    return errors / keyA.length;
}

// Utility: Convert bit array to Hex String
function bitsToHex(bits) {
    let hex = '';
    // Process in chunks of 4 bits
    for (let i = 0; i < bits.length; i += 4) {
        const chunk = bits.slice(i, i + 4);
        if (chunk.length < 4) break; // Ignore trailing bits
        const val = parseInt(chunk.join(''), 2);
        hex += val.toString(16);
    }
    return hex.toUpperCase();
}

module.exports = { Alice, Eve, Bob, siftKeys, calculateQBER, bitsToHex };
