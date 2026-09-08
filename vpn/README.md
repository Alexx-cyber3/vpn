# AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework

A privacy-preserving, locally deployed security framework that analyzes IPsec VPN protocols, configurations, and encrypted-traffic metadata using AI + rule-based cryptographic assessment to identify weak configurations, protocol anomalies, security risks, and compliance issues.

---

## 🌟 Key Features

1. **IPsec Protocol Analyzer**:
   - Multi-vendor configuration parser (strongSwan `swanctl.conf` / `ipsec.conf`, Cisco ASA/IOS, pfSense/OPNsense, Fortinet, OpenVPN/IPsec).
   - Evaluates IKE Phase 1 / IKE_SA_INIT proposals, IKE_AUTH exchanges, ESP flow metadata, transform payloads, DH groups, PFS, SA lifetime, and rekeying settings.

2. **AI-Based Protocol Behavior Analysis**:
   - **Random Forest Classifier**: Learns normal IPsec posture patterns and classifies posture into Optimal, Sub-Optimal, Risky, and Critical profiles.
   - **Isolation Forest**: Detects non-linear behavioral anomalies in negotiation timing jitter, packet count ratios, payload frequency, and sequence rates with confidence scores (e.g. 94% anomaly confidence).

3. **Cryptographic Security Assessment Engine**:
   - Rule engine mapped against **NIST SP 800-77 Rev 1**, **NSA CNSA 2.0**, **ANSSI**, and **CIS Security Benchmarks**.
   - Severity categorization: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low.

4. **Explainable AI (XAI)**:
   - Transparent point attribution tree (+15 pts for AES-256-GCM, -12 pts for weak DH group, -14 pts for negotiation anomaly).
   - Plain-English primary risk synthesis and priority remediation roadmap.
   - SHAP-style cumulative score waterfall visualization.

5. **Protocol Sequence Validation (FSM)**:
   - Finite State Machine validator checking sequence flows (`IKE_SA_INIT` ➔ `IKE_AUTH` ➔ `CREATE_CHILD_SA` ➔ `ESP Traffic`).
   - Identifies out-of-order exchanges, retransmission floods, abrupt tunnel terminations, and timing jitter anomalies.

6. **IPsec Security Score & Letter Grades**:
   - Standardized 0–100 score model with letter grades (A+, A, B, C, D, F) across 6 weighted categories:
     - Cryptographic Strength (25%)
     - Protocol Compliance (20%)
     - Key Management & PFS (20%)
     - Configuration Security (15%)
     - Protocol Behavior (10%)
     - Anomaly Detection (10%)

7. **Privacy-Preserving Local-First Architecture**:
   - 100% local processing—zero packet payload inspection.
   - Includes a Federated Learning & Differential Privacy simulator exporting model weight gradients without centralizing raw VPN traffic logs.

8. **IPsec Security Baseline & Configuration Drift Engine**:
   - Stores baseline posture snapshots (`VPN-01`).
   - Runs drift comparison against historical snapshots (e.g. Score 92 ➔ Score 76), detailing exact parameter degradation over time.

9. **Dual-Tier Report Generator**:
   - Executive Management Reports & Technical Assessment Reports.
   - Downloadable as interactive HTML, raw JSON, or printable PDF.

---

## 🚀 Quick Start (Single Command)

To launch the backend server and open the web dashboard in your browser with **one single command**, run:

```bash
python start.py
```
*(Or simply `./run.bat` on Windows)*

This command automatically:
1. Starts the Python FastAPI backend server on `http://localhost:8000`.
2. Serves the full React interactive web application.
3. Automatically opens `http://localhost:8000` in your web browser.

### 3. Run Command-Line Interface (CLI)
```bash
# Run demonstration scan
python -m backend.cli demo

# Scan custom IPsec config file
python -m backend.cli scan --config path/to/config.conf --format summary
```

### 4. Run Automated Test Suite
```bash
python -m pytest backend/tests
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── analyzer/
│   │   ├── ipsec_parser.py          # Multi-vendor config parser
│   │   └── pcap_flow_analyzer.py    # Encrypted traffic & packet flow dissector
│   ├── security_engine/
│   │   ├── rule_engine.py           # NIST/NSA cryptographic rules
│   │   └── sequence_validator.py    # Protocol state machine (FSM) validator
│   ├── ai_engine/
│   │   ├── ml_models.py             # Random Forest + Isolation Forest models
│   │   └── explainable_ai.py        # XAI score attributions & risk synthesis
│   ├── scoring_engine/
│   │   └── risk_calculator.py       # 6-category weighted score & grade engine
│   ├── privacy_baseline/
│   │   └── drift_manager.py         # Baseline snapshots & drift detector
│   ├── reports/
│   │   └── report_generator.py      # Technical & Executive report generator
│   ├── tests/
│   │   └── test_backend.py          # Pytest backend test suite
│   ├── cli.py                       # Command line interface
│   ├── main.py                      # FastAPI REST server
│   └── samples.py                   # Preset scenario definitions
├── frontend/
│   ├── src/
│   │   ├── components/              # React UI components
│   │   ├── App.jsx                  # Dashboard application
│   │   └── index.css                # Glassmorphism & cyber dark theme CSS
│   ├── package.json
│   └── vite.config.js
└── README.md
```
