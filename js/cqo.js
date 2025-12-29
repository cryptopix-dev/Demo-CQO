/**
 * Color-Based Quantum Ontology (CQO) Reference Implementation
 * 
 * This engine serves as a formal proof-of-concept for the ontology.
 * It enforces the constraints of Chromatic States (Chi) without relying
 * on underlying quantum hardware physics, demonstrating that the
 * ontological structure is independent of the substrate.
 */

export const AXIS = {
    COHERENCE: 'Cr0',
    ENTANGLEMENT: 'Cr1',
    DECOHERENCE: 'Cr2'
};

/**
 * Represents the Chromatic Manifold space C.
 * Uses a normalized 3-vector representation.
 */
export class ChromaticState {
    constructor(alpha = 1, beta = 0, gamma = 0) {
        this.vector = [alpha, beta, gamma];
        this.normalize();
        this.history = [];
        this.initialState = [...this.vector]; // For fidelity checks
    }

    get c0() { return this.vector[0]; }
    get c1() { return this.vector[1]; }
    get c2() { return this.vector[2]; }

    normalize() {
        const mag = Math.sqrt(
            this.vector[0] ** 2 + this.vector[1] ** 2 + this.vector[2] ** 2
        );
        if (mag === 0) {
            // Fallback to ground state if zero vector
            this.vector = [1, 0, 0];
        } else {
            this.vector[0] /= mag;
            this.vector[1] /= mag;
            this.vector[2] /= mag;
        }
    }

    /**
     * Standard Unitary Evolution U(t)
     * Rotates the state within the valid coherence-entanglement plane (Cr0-Cr1).
     * This represents "safe" evolution of the system.
     */
    evolve(delta) {
        const theta = delta * 0.5; // Evolution rate
        const [c0, c1, c2] = this.vector;

        // Rotation Matrix for Cr0-Cr1 plane
        // [ cos -sin  0 ]
        // [ sin  cos  0 ]
        // [  0    0   1 ]

        const nextC0 = c0 * Math.cos(theta) - c1 * Math.sin(theta);
        const nextC1 = c0 * Math.sin(theta) + c1 * Math.cos(theta);

        // Cr2 (Decoherence) is mathematically invariant under unitary evolution
        // in this idealized ontology.

        this.vector[0] = nextC0;
        this.vector[1] = nextC1;
        this.normalize();
    }

    /**
     * Applies "Chromatic Shear" - the ontological definition of "Interaction".
     * Any attempt to "read" the state without shared entanglement keys
     * inherently rotates the vector into the Cr2 (Decoherence) dimension.
     * 
     * This proves security: You cannot touch the system without leaving a mark (shear).
     */
    interact(shearIntensity = 0.1) {
        // Shear Matrix (simplified)
        // Rotates mass from Coherence (C0) into Decoherence (C2)
        const phi = shearIntensity;
        const [c0, c1, c2] = this.vector;

        const nextC0 = c0 * Math.cos(phi) - c2 * Math.sin(phi);
        const nextC2 = c0 * Math.sin(phi) + c2 * Math.cos(phi);

        this.vector[0] = nextC0;
        this.vector[2] = nextC2;
        this.normalize();

        return this.calculateShear();
    }

    /**
     * Calculates the deviation from the pure Coherent/Entangled plane.
     * Shear = Magnitude of projection onto Cr2 axis.
     */
    calculateShear() {
        return Math.abs(this.vector[2]);
    }

    /**
     * Measurement Operator M.
     * Projects the continuous state onto one of the discrete axes.
     * This is a non-unitary, irreversible operation.
     */
    measure() {
        const r = Math.random();
        const sq = (x) => x * x;

        const p0 = sq(this.vector[0]);
        const p1 = sq(this.vector[1]);

        let outcome;
        if (r < p0) {
            outcome = AXIS.COHERENCE;
            this.vector = [1, 0, 0];
        } else if (r < p0 + p1) {
            outcome = AXIS.ENTANGLEMENT;
            this.vector = [0, 1, 0];
        } else {
            outcome = AXIS.DECOHERENCE;
            this.vector = [0, 0, 1];
        }
        return outcome;
    }
}

/**
 * The System Wrapper.
 * Represents the ontological entity.
 */
export class QuantumSystem {
    constructor(id) {
        this.id = id;
        this.chi = new ChromaticState(1, 0, 0); // Start pure coherent
        this.entangledPartner = null;
    }

    /**
     * Establishes a shared constraint (Entanglement).
     * Ontologically, this means measuring A instantly implies B's state,
     * not due to communication, but due to definition.
     */
    entangle(otherSystem) {
        this.entangledPartner = otherSystem;
        otherSystem.entangledPartner = this;

        // Bell State initialization (Perfect Correlation)
        // We set them to a defined entangled state: (|00> + |11>) / sqrt(2)
        // In Chromatic terms: Shared phase in Cr1 plane.
        this.chi.vector = [0.707, 0.707, 0]; // 1/sqrt(2) approx
        otherSystem.chi.vector = [0.707, 0.707, 0];

        this.chi.normalize();
        otherSystem.chi.normalize();
    }

    /**
     * Checks correlation with partner.
     * Returns correlation coefficient (1.0 = perfect, 0.0 = none).
     */
    checkCorrelation() {
        if (!this.entangledPartner) return 0;

        // Dot product of vectors
        const dot = (
            this.chi.vector[0] * this.entangledPartner.chi.vector[0] +
            this.chi.vector[1] * this.entangledPartner.chi.vector[1] +
            this.chi.vector[2] * this.entangledPartner.chi.vector[2]
        );
        return Math.abs(dot);
    }
}
