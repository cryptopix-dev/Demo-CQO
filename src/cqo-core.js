/**
 * Chromatic Quantum Ontology (CQO) - Core Physics Engine
 * 
 * This module enforces the geometric constraints of the 3-dimensional
 * Chromatic Hilbert Space (C^3) used for the QKD protocol.
 */

const AXIS = {
    COHERENCE: 'Cr0',     // |0>
    ENTANGLEMENT: 'Cr1',  // |1>
    DECOHERENCE: 'Cr2'    // Error/Shear
};

const BASIS = {
    RECTILINEAR: '+',  // Standard { |0>, |1> }
    DIAGONAL: 'x'      // Superposition { |+>, |-> }
};

class ChromaticState {
    constructor(alpha = 1, beta = 0, gamma = 0) {
        this.vector = [alpha, beta, gamma];
        this.normalize();
    }

    normalize() {
        const mag = Math.sqrt(
            this.vector[0] ** 2 + this.vector[1] ** 2 + this.vector[2] ** 2
        );
        if (mag === 0) {
            this.vector = [1, 0, 0];
        } else {
            this.vector[0] /= mag;
            this.vector[1] /= mag;
            this.vector[2] /= mag;
        }
    }

    // Prepare state based on bit (0/1) and basis (+/x)
    static prepare(bit, basis) {
        let state = new ChromaticState();

        if (basis === BASIS.RECTILINEAR) {
            // Basis +: 0 -> [1,0,0], 1 -> [0,1,0]
            if (bit === 0) state.vector = [1, 0, 0];
            else state.vector = [0, 1, 0];
        } else {
            // Basis X: 0 -> [1,1,0]/sqrt(2), 1 -> [1,-1,0]/sqrt(2)
            // Note: In CQO, "Entanglement" axis (Magenta) is effectively the Y axis
            const invSqrt2 = 1 / Math.sqrt(2);
            if (bit === 0) state.vector = [invSqrt2, invSqrt2, 0];
            else state.vector = [invSqrt2, -invSqrt2, 0];
        }

        state.normalize();
        return state;
    }

    // Apply Shear (Decoherence/Eavesdropping) interaction
    interact(shearIntensity) {
        // Rotation into the forbidden Yellow dimension (Cr2)
        const phi = shearIntensity;
        const [c0, c1, c2] = this.vector;

        // Rotate C0 -> C2 (simplified shear model)
        // Ideally should rotate the entire plane, but primary information is in C0/C1
        const nextC0 = c0 * Math.cos(phi) - c2 * Math.sin(phi);
        const nextC2 = c0 * Math.sin(phi) + c2 * Math.cos(phi);

        this.vector[0] = nextC0;
        this.vector[2] = nextC2;
        this.normalize();
    }

    // Measure the state in a specific basis
    measure(basis) {
        // Project onto the basis vectors
        let p0, p1; // Probabilities for 0 and 1

        if (basis === BASIS.RECTILINEAR) {
            // Project onto [1,0,0] and [0,1,0]
            // The Yellow component (Cr2) represents loss/error, effectively reducing probability sum < 1 if we only look at C0/C1
            // But we treat it as noise that distributes randomly or triggers specific error

            // Standard QM Rule: Prob = |<psi|basis>|^2
            p0 = this.vector[0] ** 2;
            p1 = this.vector[1] ** 2;
        } else {
            // Project onto Diagonal basis vectors
            const invSqrt2 = 1 / Math.sqrt(2);
            // |+> = [k, k, 0], |-> = [k, -k, 0]

            // Dot products
            const dotPlus = this.vector[0] * invSqrt2 + this.vector[1] * invSqrt2;
            const dotMinus = this.vector[0] * invSqrt2 - this.vector[1] * invSqrt2;

            p0 = dotPlus ** 2;
            p1 = dotMinus ** 2;
        }

        // Handle the Shear Component (Yellow / Cr2)
        // If there is significant shear, it "leaks" probability.
        // In physical QKD, this might result in a "no detection" or a random click.
        // We model it as "Random Noise": the missing probability distributes evenly (50/50 noise)
        const leakage = this.vector[2] ** 2;

        // Renormalize probabilities including the leakage as noise
        const totalDetectable = p0 + p1;
        if (totalDetectable < 0.0001) {
            // Pure shear state - random outcome
            return Math.random() < 0.5 ? 0 : 1;
        }

        // Add half leakage to each to simulate random noise from decoherence
        const effectiveP0 = p0 + (leakage * 0.5);

        return Math.random() < effectiveP0 ? 0 : 1;
    }
}

module.exports = { ChromaticState, AXIS, BASIS };
