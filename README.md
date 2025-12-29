# Demo-CQO

## Description

Demo-CQO is a project demonstrating the Chromatic Quantum Ontology (CQO), a geometric framework that models Quantum Key Distribution (QKD) security principles using information-theoretic constraints in a 3-dimensional vector space. CQO shows that QKD security can be derived from geometric axioms without requiring physical quantum hardware, providing an educational tool for understanding quantum cryptography.

Key concepts:
- **Shear Theorem**: Information extraction requires rotation into a "decoherence" axis, making eavesdropping detectable.
- **Safe Plane**: Secure states exist in the 2D subspace spanned by coherence and entanglement axes.
- **Security Proof**: Any attempt to gain information induces a detectable "shear" component.

## Contents Overview

- **CQO_Theory_Paper.md**: Formal theory and mathematical proofs of CQO.
- **CQO_QKD_Security_Proof.md**: Detailed security proof for CQO-QKD protocol.
- **CQO_White_Paper.pdf**: Comprehensive white paper on CQO framework.
- **CQO_Final_Report.md**: Final technical report summarizing the project.
- **index.html**: Main HTML file for the web-based demo.
- **style.css**: Stylesheet for the demo interface.
- **js/app.js**: Application logic for the interactive demo.
- **js/cqo.js**: Core CQO engine implementing the geometric axioms.

## Viewing the Demo

To view the interactive demo, open `index.html` in a modern web browser. The demo allows you to simulate QKD protocols, observe state vectors in the chromatic space, and test eavesdropping scenarios.

## Relevant Information from Papers

From the papers:
- CQO defines a 3D "Chromatic Hilbert Space" with axes for Coherence (Cyan), Entanglement (Magenta), and Decoherence (Yellow).
- Security is enforced by the Shear Theorem: extracting information rotates the state vector out of the safe plane, detectable as a non-zero Decoherence component.
- The framework maps to standard QM, with the safe plane equivalent to the Bloch sphere equator.
- Experimental validation shows the simulator correctly detects eavesdropping with QBER thresholds.