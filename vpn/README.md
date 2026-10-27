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
## 🛡️ Problem the Tool Addresses

Organizations deploying IPsec VPNs often lack visibility into the security posture of their tunnel configurations. Manual review of vendor-specific config files is time‑consuming, error‑prone, and frequently overlooks subtle cryptographic weaknesses, outdated protocol parameters, and behavioral anomalies that could allow exploitation. Existing tools either:

- Inspect packet payloads (violating privacy and requiring decryption),
- Provide only superficial checklist scans,
- Or rely on cloud‑based analysis that centralizes sensitive network metadata.

**This framework fills the gap** by delivering a fully local, AI‑enhanced assessment that:
- Parses multi‑vendor configs without sending data off‑device.
- Assigns a quantifiable security score (0‑100) with letter grades.
- Highlights exact weak parameters and provides remediation guidance.
- Detects behavioral anomalies in real‑time negotiation metadata.
- Generates compliant reports for both technical teams and executive stakeholders.

---
## 🛠️ Technologies, Programming Languages and Libraries

| Layer | Technology / Library | Purpose |
|-------|----------------------|---------|
| **Language** | Python 3.11+ | Core backend services, ML engines, CLI |
| **Language** | JavaScript / TypeScript | Frontend UI, interactivity |
| **Web Framework** | FastAPI | REST API, async request handling, automatic OpenAPI docs |
| **Web Framework** | React 18 | User interface, dashboard components |
| **Styling** | Tailwind CSS 3 | Glassmorphism & cyber‑dark theming, responsive layout |
| **Build Tool** | Vite | Fast HMR and production builds for React |
| **ML / AI** | scikit-learn (RandomForestClassifier, IsolationForest) | AI-based posture classification and anomaly detection |
| **ML / AI** | numpy, pandas | Feature vector construction and data manipulation |
| **Parsing** | re, json, typing | Multi‑vendor config lexing and structural parsing |
| **API** | Pydantic | Request validation and data modeling |
| **Server** | uvicorn | ASGI HTTP server for FastAPI |
| **CLI** | argparse | Command‑line subcommand parsing |
| **Security Benchmarks** | NIST SP 800-77 Rev 1, NSA CNSA 2.0, ANSSI, CIS Benchmarks | Rule‑engine mapping and severity scoring |
| **Reporting** | HTML/JSON/PDF generation (custom) | Dual‑tier report generation |

---
## 📚 How the Tool Works (Workflow)

The assessment pipeline is triggered via API, CLI, or the web dashboard. The core workflow consists of the following stages:

### 1. Configuration Ingestion
- User supplies an IPsec config file (strongSwan, Cisco, Fortinet, etc.) or pastes raw text.
- The `IPsecConfigParser` auto‑detects the vendor format and normalizes the data into a unified internal posture dictionary.

### 2. Rule‑Engine Cryptographic Assessment
- A rule engine evaluates the parsed posture against a catalog of benchmarks (NIST, NSA CNSA, ANSSI, CIS).
- Each rule awards or deducts points and assigns a severity badge (Critical / High / Medium / Low).
- Example: Using 3DES‑CBC → ‑12 points; enabling PFS → +8 points.

### 3. AI / Machine‑Learning Posture Classification
- **Random Forest Classifier** maps the feature vector to one of four profile categories (Optimal, Sub‑Optimal, Risky, Critical).
- **Isolation Forest** scans the flow‑metadata time‑series for anomalous jitter, packet‑rate spikes, or frequency deviations, returning an anomaly confidence score.

### 4. Protocol Sequence Validation (FSM)
- A finite‑state‑machine validator checks that the observed IKE exchange sequence matches the expected flow:
  `IKE_SA_INIT` → `IKE_AUTH` → `CREATE_CHILD_SA` → `ESP Traffic`.
- Detects out‑of‑order packets, retransmission floods, and abrupt tunnel teardowns.

### 5. Scoring & Grade Calculation
- Six weighted categories produce an overall **0‑100 score** and corresponding letter grade (A+ / A / B / C / D / F).
- Weights: Cryptographic Strength (25%), Protocol Compliance (20%), Key Management & PFS (20%), Configuration Security (15%), Protocol Behavior (10%), Anomaly Detection (10%).

### 6. Explainable AI (XAI) Attribution
- Transparent point‑attribution tree is generated, showing which parameters contributed positively or negatively to the final score.
- A plain‑English **primary risk synthesis** is produced, along with a **priority remediation roadmap**.

### 7. Baseline Drift Comparison (Optional)
- If a baseline snapshot exists (stored under `privacy_baseline/`), the system computes a drift delta relative to the current assessment, highlighting parameter degradation over time.

### 8. Report Generation
- Dual‑tier reports:
  - **Executive Summary**: High‑level grade, key risks, recommended actions.
  - **Technical Report**: Full rule‑by‑rule breakdown, XAI attributions, score waterfall, raw JSON data.
- Output formats: interactive HTML, raw JSON, or printable PDF.

### 9. Privacy‑First by Design
- No packet payloads are ever inspected or transmitted.
- All analysis operates on metadata only.
- A **Federated Learning & Differential Privacy simulator** can export aggregated model weight gradients for remote collaborative improvement without sharing raw data.

---
## 🚀 Step‑by‑Step Instructions

### 1. Prerequisites

- **Python 3.11+** installed.
- **Node.js 18+** (for the React frontend).
- Git (optional, for cloning).

### 2. Clone / Navigate to the Project

```bash
git clone https://github.com/your-org/ipsec-vpn-analyzer.git
cd ipsec-vpn-analyzer
```

### 3. Backend Installation

```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt   # (if present) or manually:
pip install fastapi uvicorn python-multipart pydantic scikit-learn numpy pandas

# Verify the backend starts:
python -c "from backend.main import app; print('Backend imports OK')"
```

### 4. Frontend Installation

```bash
cd frontend
npm install   # installs React, Tailwind, Vite, and all dependencies

# Build the frontend for production
npm run build   # generates ./frontend/dist

# Return to root
cd ..
```

### 5. Running the Tool

#### Option A – Single‑command launcher (recommended)

```bash
python start.py
```

This will:
1. Start the FastAPI backend at `http://localhost:8000`.
2. Serve the React dashboard.
3. Automatically open `http://localhost:8000` in your default browser after ~1.5 seconds.

#### Option B – Manual separate starts

```bash
# Terminal 1 – Backend
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 – Frontend (after npm run build)
cd ../frontend
npx vite
```

### 6. Using the Web Dashboard

1. Open `http://localhost:8000` in your browser.
2. Click **“📁 Upload Config File (.conf, .cfg, .json)”**.
3. Select a sample config from the `samples/` folder or upload your own.
4. The dashboard will:
   - Parse the config.
   - Run the full AI‑rule pipeline.
   - Display the security score, letter grade, and XAI attribution tree.
   - Show protocol‑sequence FSM validation results.
   - Offer **Download Report** buttons (HTML / JSON / PDF).

### 7. Using the CLI

```bash
# Demonstration scan (uses built‑in optimal config)
python -m backend.cli demo

# Scan a custom config file
python -m backend.cli scan --config samples/strongswan_zero_trust.conf --format summary

# JSON output
python -m backend.cli scan --config samples/cisco_legacy_vulnerable.conf --format json
```

### 8. Running the Test Suite

```bash
python -m pytest backend/tests
```

---
## 📦 Sample Inputs & Outputs

### Sample 1 – StrongSwan Zero‑Trust Config (Optimal)

**Input** (`samples/strongswan_zero_trust.conf`):
```
connections {
    cloud-gateway {
        version = 2
        proposals = aes256gcm16-prfsha256-ecp256
        rekey_time = 1h
        local {
            auth = pubkey
            certs = gatewayCert.pem
        }
        remote {
            auth = pubkey
        }
        children {
            net {
                local_ts = 10.0.0.0/16
                remote_ts = 192.168.1.0/24
                esp_proposals = aes256gcm16-ecp256
                rekey_time = 1h
                dpd_action = clear
            }
        }
    }
}
```

**CLI Output** (`summary` format):
```
=======================================================
  IPsec VPN Protocol Analyzer & Security Assessment  

Running demonstration scan on sample swanctl posture...

Overall Score: 96/100 — Grade: A+
Rating: Optimal Profile
Primary Risk: None detected – all cryptographic parameters meet CNSA 2.0 requirements.

Key Findings:
  [🟢 Low] aes256gcm16 (encryption) – Assessment: Strong encryption algorithm, compliant with NIST SP 800-77.
  [🟢 Low] ecp256 (DH group) – Assessment: NIST‑P256 curve, approved for CNSA 2.0.
  [🟢 Low] rekey_time = 1h – Assessment: Reasonable SA lifetime.
```

**Web Dashboard Output** (excerpt):
- **Security Score**: 96/100 → **Grade A+**
- **Profile**: Optimal
- **XAI Attribution**: +15 pts AES‑256‑GCM, +8 pts PFS (enabled), +2 pts ECP‑256, 0 pt deductions.
- **Risk Synthesis**: “No weaknesses detected. Configuration complies with NSA CNSA 2.0 and NIST SP 800‑77 Rev 1.”
- **Report Download**: HTML | JSON | PDF

### Sample 2 – Cisco Legacy Vulnerable Config (High Risk)

**Input** (`samples/cisco_legacy_vulnerable.conf`):
```
config setup
    strictcrlpolicy=no

conn legacy-hq-tunnel
    keyexchange=ikev1
    authby=secret
    ike=3des-md5-modp1024!
    esp=3des-md5!
    ikelifetime=86400s
    keylife=86400s
    pfs=no
    auto=start
    left=192.168.10.1
    right=203.0.113.5
```

**CLI Output** (`summary` format):
```
=======================================================
  IPsec VPN Protocol Analyzer & Security Assessment  

Running demonstration scan on sample swanctl posture...

Overall Score: 52/100 — Grade: D
Rating: High Risk Profile
Primary Risk: Weak cryptographic suite and outdated IKE version detected.

Key Findings:
  [🔴 Critical] 3des‑cbc (encryption) – Assessment: Deprecated cipher, vulnerable to brute‑force; replace with AES‑256‑GCM.
  [🔴 Critical] md5 (integrity) – Assessment: Cryptographically broken; use SHA‑256 or stronger.
  [🔴 Critical] Group 2 (1024‑bit MODP) – Assessment: Insufficient key size; upgrade to Group 19 (ECP‑256) or higher.
  [🟠 High] pfs=no – Assessment: Perfect Forward Secrecy disabled; enable PFS with ECP‑256.
  [🟡 Medium] IKEv1 – Assessment: Legacy protocol; prefer IKEv2 for improved security.
```

**Web Dashboard Output** (excerpt):
- **Security Score**: 52/100 → **Grade D**
- **Profile**: High Risk
- **XAI Attribution**: –12 pts 3DES‑CBC, –14 pts MD5, –10 pts Group 2, –8 pts no PFS, –6 pts IKEv1.
- **Risk Synthesis**: “Critical weaknesses: deprecated 3DES‑CBC cipher, MD5 integrity, and 1024‑bit DH group. Immediate upgrade recommended to AES‑256‑GCM, SHA‑256, and ECP‑256 with PFS.”
- **Report Download**: HTML | JSON | PDF

---
## 📁 Repository Structure

```
├── backend/
│   ├── analyzer/               # Config parsers, PCAP flow analyzer, log analyzer, host scanner
│   ├── ai_engine/              # ML models (Random Forest, Isolation Forest) + XAI
│   ├── security_engine/        # Rule engine, sequence FSM validator
│   ├── scoring_engine/         # 6‑category weighted risk calculator
│   ├── privacy_baseline/       # Drift manager, baseline snapshots, federated‑learning simulator
│   ├── reports/                # Report generator (HTML / JSON / PDF)
│   ├── cli.py                  # Command‑line interface
│   ├── main.py                 # FastAPI REST server
│   └── samples.py              # Pre‑built sample scenarios
├── frontend/
│   ├── src/
│   │   ├── components/         # React UI components
│   │   ├── App.jsx             # Dashboard application
│   │   └── index.css           # Glassmorphism & cyber dark theme CSS
│   ├── package.json            # Dependencies (React, Tailwind, Vite, Recharts, Framer‑Motion)
│   └── vite.config.js
├── samples/
│   ├── strongswan_zero_trust.conf       (Grade A+ / Optimal)
│   ├── cisco_legacy_vulnerable.conf   (Grade D / High Risk)
│   ├── fortinet_misconfigured.conf    (Grade C / Moderate Risk)
│   └── sample_vpn_attack.log
├── run.bat                     # Windows one‑liner: `python start.py`
└── start.py                    # Single‑command launcher (starts backend + opens browser)
```

---
## ⚠️ Known Limitations

| Limitation | Impact | Planned Mitigation |
|------------|--------|--------------------|
| **No real‑time packet capture support** – The pipeline can operate on synthetic flow metadata only; live pcap analysis requires additional integration. | Users with offline configs cannot benefit from live traffic anomaly detection. | Integrate `scapy` or `dpkt` for live pcap ingestion and extend `PCAPFlowAnalyzer.analyze_pcap_data()`. |
| **Feature vector based on static config only** – ML models ignore temporal network behavior beyond supplied flow metadata. | May miss time‑based attacks that require traffic‑pattern analysis. | Enrich feature extraction with aggregated traffic stats (packet counts, byte rates) from exported NetFlow/sFlow data. |
| **Benchmark coverage is static** – Rule engine maps to NIST/NSA/ANSSI/CIS; emerging standards (e.g., quantum‑resistant proposals) are not yet included. | Future‑proofing against post‑quantum VPN configurations is lacking. | Add modular benchmark plugins that can be loaded from YAML config files; draft preliminary post‑quantum rule set. |
| **Single‑user / local‑only deployment** – No built‑in multi‑tenant isolation or role‑based access control. | Not suitable for shared‑hosting scenarios without external auth proxy. | Add FastAPI OAuth2 dependency and container‑level isolation via Docker‑Compose profiles. |
| **XAI point‑attribution is heuristic** – The +15 / –12 point values are rule‑based, not SHAP‑exact. | Users expecting rigorous Shapley values may find the attribution approximate. | Replace with actual SHAP library computation once feature matrix is stabilized; provide both heuristic and exact modes. |
| **No Docker / containerized out‑of‑the‑box experience** – Requires manual Python/Node setup. | Barrier for users who prefer one‑command container deployment. | Provide official Dockerfile and docker‑compose.yml for full stack (FastAPI + React + uvicorn). |
| **Isolation Forest contamination preset (0.1)** – May not suit environments with very low or very high anomaly rates. | Anomaly scores may be too permissive or too aggressive. | Make contamination a configurable parameter via CLI or API; add auto‑tuning based on historical data. |

---
## 🚧 Possible Future Improvements

- **Docker & Cloud‑Deployable Image** – Package the entire stack (FastAPI, React, uvicorn, ML models) into a single Docker image with a `docker run` one‑liner.
- **Live pcap / Traffic Ingestion** – Integrate Scapy/Dpkt to capture real‑time interface traffic and feed flow metadata into the AI pipeline for behavioral anomaly detection.
- **Post‑Quantum Cryptography Rules** – Add assessment rules for NIST‑PQC candidate transforms (e.g., Kyber, Dilithium) and flag configs using only classical crypto.
- **SHAP‑Exact Explanations** – Replace the heuristic point‑attribution tree with `shap` values computed from the trained Random Forest/Isolation Forest models for mathematically rigorous feature importance.
- **Multi‑Tenant / RBAC** – Introduce FastAPI OAuth2 / JWT authentication, role‑based report access, and tenant‑isolated baseline storage.
- **Federated Learning Orchestrator** – Implement a real federated‑learning loop where edge nodes contribute aggregated gradient updates to a central model, Differential Privacy‑protected.
- **Webhooks & CI/CD Integration** – Add POST‑scan webhooks so the tool can be invoked from GitHub Actions, GitLab CI, or Azure DevOps pipelines for automated VPN config gate‑keeping.
- **Graph‑Visualization of IKE FSM** – Render the protocol state‑machine as an interactive Mermaid or Graphviz diagram within the dashboard, highlighting the observed path and deviations.
- **Compliance Mapping Exports** – Generate ready‑to‑submit compliance artifacts (PDF checklists) for ANSSI, CIS‑Microsoft, and NSA CNSA 2.0 audits.
- **Mobile‑Responsive Dashboard** – Improve Tailwind breakpoints and component layout for seamless use on tablets and small laptops.

---
-----demo video link:
## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
*Generated for the AI‑Powered IPsec VPN Protocol Analyzer & Security Assessment Framework.*
