# 📁 IPsec VPN Test Sample Configurations

This directory contains real sample IPsec configuration files for testing file uploads and CLI automated scanning:

## 📄 Included Configuration Files

1. **`strongswan_zero_trust.conf`** (Grade A+ / Optimal Profile)
   - Vendor: strongSwan (`swanctl.conf`)
   - Features: IKEv2, `AES-256-GCM`, `SHA256`, `ECP-256 (Group 19)`, Digital Certificates (PKI), PFS Enabled, 1-hour SA lifetime.

2. **`cisco_legacy_vulnerable.conf`** (Grade D / High Risk Profile)
   - Vendor: Cisco ASA / IOS Crypto Map
   - Features: IKEv1, `3DES-CBC`, `MD5`, `Group 2 (1024-bit MODP)`, Pre-Shared Key (PSK), PFS Disabled, 24-hour SA lifetime.

3. **`fortinet_misconfigured.conf`** (Grade C / Moderate Risk Profile)
   - Vendor: Fortinet FortiGate Phase 1 / Phase 2
   - Features: IKEv2, `AES-128-CBC`, `SHA1`, `Group 14`, PSK Auth, PFS Disabled.

---

## 🧪 How to Test

### 1. Web Dashboard Upload
1. Open the dashboard at `http://localhost:8000`.
2. Click **"📁 Upload Config File (.conf, .cfg, .json)"**.
3. Select any `.conf` file from this `samples/` folder.
4. The dashboard will parse the file and run the full AI security audit live!

### 2. Command-Line (CLI) Audit
```bash
# Scan strongSwan Zero-Trust configuration
python -m backend.cli scan --config samples/strongswan_zero_trust.conf --format summary

# Scan Cisco Legacy Vulnerable configuration
python -m backend.cli scan --config samples/cisco_legacy_vulnerable.conf --format summary
```
