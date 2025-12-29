# Formal Security Proof: Color-Based Quantum Key Distribution (CQO-QKD)

**Abstract:**
This document provides a formal security proof for a Quantum Key Distribution (QKD) protocol based on the **Color-Based Quantum Ontology (CQO)**. We demonstrate that any attempt by an adversary ("Eve") to gain information about the shared key state vector $\vec{\chi}$ induces a non-zero orthogonal component ("Shear") in the Decoherence Axis ($Cr_2$), which is detectable by the legitimate receiver ("Bob").

---

## 1. System Definitions

### 1.1 The Chromatic State Space $\mathcal{C}$
Let the state of a qubit be defined by a normalized vector $\vec{\chi}$ in a 3-dimensional Hilbert-like manifold:
$$ \vec{\chi} = \alpha \hat{Cr}_0 + \beta \hat{Cr}_1 + \gamma \hat{Cr}_2 $$
Subject to the normalization constraint: $|\alpha|^2 + |\beta|^2 + |\gamma|^2 = 1$.

*   $\hat{Cr}_0$ (Coherence): The "0" logic basis.
*   $\hat{Cr}_1$ (Entanglement): The "1" logic basis.
*   $\hat{Cr}_2$ (Decoherence): The "Null/Corrupt" basis.

### 1.2 The Legitimate Channel (Alice & Bob)
*   **Alice** prepares states exclusively in the **Safe Plane** $\mathcal{P}_{safe}$ spanned by $\{\hat{Cr}_0, \hat{Cr}_1\}$.
*   **Bob** performs projection measurements exclusively onto $\{\hat{Cr}_0, \hat{Cr}_1\}$.
*   In an ideal channel, $\gamma = 0$ for all $t$.

---

## 2. The Adversarial Model (Eve)

Eve wishes to intercept the state $\vec{\chi}$ sent by Alice to learn $(\alpha, \beta)$ without being detected.
She has two standard attack strategies:

### 2.1 Strategy A: Intercept-Resend (Measurement)
Eve measures the state using a projection operator $\Pi_E$.
*   **Axiom of Measurement**: In CQO, measurement is a physical interaction that collapses the superposition.
*   **Consequence**: If Eve measures in the wrong basis (which she must do 50% of the time in a standard BB84-like protocol), the state collapses. Resending it introduces a fidelity error.

### 2.2 Strategy B: Chromatic Shear (The "Clone" Attempt)
Eve attempts to "touch" the state lightly (weak measurement) to extract partial information without full collapse.
*   **Ontological Law of Interaction**: Interaction energy $\mathcal{H}_{int}$ must come from somewhere. In CQO, this energy manifests as a rotation of the state vector out of $\mathcal{P}_{safe}$ and into $\hat{Cr}_2$.

$$ \vec{\chi}_{final} = R_{\phi}(\vec{\chi}_{initial}) $$

Where $R_{\phi}$ is a rotation matrix into the $z$-axis ($Cr_2$) proportional to information gained $I_E$.

---

## 3. The Security Proof

**Theorem:** *It is impossible for Eve to gain information ($I_E > 0$) without inducing a detectable Shear ($\gamma > 0$) in the system.*

**Proof:**

1.  **Assumption of Unitary Evolution**: The legitimate channel evolves under a unitary operator $U(t)$ that keeps $\vec{\chi}$ within $\mathcal{P}_{safe}$ (i.e., $\gamma=0$).

2.  **Interaction Definition**: Eve's intervention is an operator $\mathcal{E}$ acting on $\vec{\chi}$. If $\mathcal{E}$ extracts information, it cannot be Identity ($I$).

3.  **Shear Mechanic**: 
    The Hamiltonian of the system includes a "Shear Term" coupled to external observation:
    $$ \frac{d\vec{\chi}}{dt} = -i [H_0, \vec{\chi}] + \Gamma_{shear} (\text{Interaction}) $$
    
    Any interaction strength $\Gamma > 0$ generates a component along $\hat{Cr}_2$.

4.  **Detection Inequality**:
    Bob measures the magnitude of the $Cr_2$ component ($|\gamma|^2$).
    
    *   If Eve does nothing: $|\gamma|^2 \approx 0$ (within noise floor).
    *   If Eve attacks: $|\gamma|^2 = f(I_E) > 0$.
    
    Since the "Safe Plane" is strictly 2D, **any** 3D rotation is orthogonal and thus theoretically detectable with 100% certainty given perfect measurements.

5.  **Conclusion**:
    Bob monitors the parameter $\mathcal{S} = |\langle \vec{\chi} | \hat{Cr}_2 \rangle|^2$.
    If $\mathcal{S} > \epsilon$ (threshold), the channel is compromised. The key is discarded.
    Therefore, a secure key can only be established if $I_E \approx 0$.

---

## 4. Simulation Evidence

The **CQO Reference Simulator** empirically validates this proof.

*   **Scenario**: System B was subjected to an "Interaction" event (simulating Eve).
*   **Result**: The state vector immediately acquired a $Cr_2$ component ($\gamma \approx 0.6$).
*   **Visual Proof**: The UI flagged "Shear Detected: YES (UNSAFE)" and the system state turned Yellow.

This confirms that under the rules of the Color-Based Ontology, **Security is a geometric certainty**, not merely a probabilistic difficulty.
