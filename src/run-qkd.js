const readline = require('readline');
const { Alice, Eve, Bob, siftKeys, calculateQBER, bitsToHex } = require('./qkd-protocol');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.clear();
    console.log("=============================================================");
    console.log("   CHROMATIC QUANTUM ONTOLOGY - QKD PROTOCOL ENGINE v1.0");
    console.log("=============================================================");
    console.log("Hardware-Agnostic Geometric Security Simulation\n");

    try {
        // --- Configuration ---
        // Check command line arguments first: node run-qkd.js [qubits] [eve=y/n] [intensity]
        const args = process.argv.slice(2);

        let qubitCount;
        if (args[0]) {
            qubitCount = parseInt(args[0]) || 1000;
            console.log(`Config [Args]: Qubits = ${qubitCount}`);
        } else {
            const qubitCountStr = await askQuestion("Number of Qubits to Transmit (default 1000): ");
            qubitCount = parseInt(qubitCountStr) || 1000;
        }

        let evePresent;
        if (args[1]) {
            evePresent = args[1].toLowerCase().startsWith('y');
            console.log(`Config [Args]: Eve Present = ${evePresent}`);
        } else {
            const evePresentStr = await askQuestion("Enable Eavesdropper (Eve)? (y/n, default n): ");
            evePresent = evePresentStr.toLowerCase().startsWith('y');
        }

        let shearIntensity = 0.0;
        if (evePresent) {
            if (args[2]) {
                shearIntensity = parseFloat(args[2]) || 0.4;
                console.log(`Config [Args]: Shear Intensity = ${shearIntensity}`);
            } else {
                const intensityStr = await askQuestion("Eve Interception Intensity (0.0 - 1.0, default 0.4): ");
                shearIntensity = parseFloat(intensityStr) || 0.4;
            }
        }

        console.log("\n[ SYSTEM INITIALIZED ]");
        console.log(`Transmitting ${qubitCount} qubits...`);

        // --- Phase 1: Alice Preparation ---
        const alice = new Alice();
        console.log("Alice: Preparing Quantum States...");
        const qubits = alice.prepareQubits(qubitCount);

        // --- Phase 2: Transmission / Eve ---
        if (evePresent) {
            console.log(`Eve: Intercepting Channel (Intensity: ${shearIntensity})...`);
            const eve = new Eve();
            eve.intercept(qubits, shearIntensity);
        } else {
            console.log("Channel: Secure Transmission...");
        }

        // --- Phase 3: Bob Measurement ---
        console.log("Bob: Measuring States...");
        const bob = new Bob();
        bob.measureQubits(qubits);

        // --- Phase 4: Sifting ---
        console.log("System: Sifting Keys over Public Channel...");
        const { aliceSifted, bobSifted } = siftKeys(
            alice.bases,
            bob.bases,
            alice.bits,
            bob.measuredBits
        );

        console.log(`\n--- STATISTICS ---`);
        console.log(`Total Qubits:   ${qubitCount}`);
        console.log(`Sifted Length:  ${aliceSifted.length} (~50% yield expected)`);

        // --- Phase 5: Error Analysis ---
        // We use the first 50% of the sifted key for error estimation (sacrificed)
        // In a real system, we'd use a subset or check parity, but here we just check raw QBER
        const checkLength = Math.floor(aliceSifted.length * 0.5);
        if (checkLength === 0) {
            console.error("Error: Not enough bits to verify security.");
            process.exit(1);
        }

        // Split keys: Check vs Final
        const aliceCheck = aliceSifted.slice(0, checkLength);
        const bobCheck = bobSifted.slice(0, checkLength);

        const aliceFinal = aliceSifted.slice(checkLength);
        const bobFinal = bobSifted.slice(checkLength);

        const qber = calculateQBER(aliceCheck, bobCheck);
        const qberPercent = (qber * 100).toFixed(2);

        console.log(`QBER (Error Rate): ${qberPercent}%`);

        // --- Decision ---
        // Standard threshold ~11% for proof security, ~25% for basic intercept-resend
        // We utilize 15% as a stricter demo threshold to catch lower-intensity attacks
        const THRESHOLD = 0.15;

        console.log("\n--- RESULT ---");

        if (qber > THRESHOLD) {
            console.log("❌ SECURITY ALERT: High Error Rate Detected!");
            console.log("   Eavesdropping suspected.");
            console.log("   Protocol ABORTED. Key discarded.");
            if (evePresent) {
                console.log("   (System correctly detected the simulator's eavesdropper)");
            }
        } else {
            console.log("✅ CHANNEL SECURE");
            console.log("   Key Exchange Successful.");
            console.log(`   Final Key Length: ${aliceFinal.length} bits`);

            // Show Hex Key
            const hexKey = bitsToHex(aliceFinal);
            console.log(`   Shared Secret (Hex): ${hexKey.substring(0, 64)}${hexKey.length > 64 ? '...' : ''}`);
        }

    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        rl.close();
    }
}

main();
