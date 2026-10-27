"""
Cryptographic Security Rule Engine for IPsec / IKE.
Maps configuration & metadata parameters against security benchmarks:
- NIST SP 800-77 Rev 1 (Guide to IPsec VPNs)
- NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)
- ANSSI IPsec Recommendations
- CIS Security Benchmarks
"""

from typing import Dict, Any, List


class IPsecRuleEngine:
    """Evaluates cryptographic parameters and maps findings to security severities."""

    # Weak & Deprecated Algorithms
    DEPRECATED_CIPHERS = {"DES-CBC", "3DES-CBC", "RC4", "BLOWFISH", "NULL"}
    WEAK_CIPHERS = {"AES-128-CBC"} # Acceptable, but GCM preferred
    OPTIMAL_CIPHERS = {"AES-256-GCM", "CHACHA20-POLY1305", "AES-128-GCM", "AES-256-CBC"}

    DEPRECATED_HASHES = {"MD5", "SHA1", "NONE"}
    WEAK_HASHES = {"SHA224"}
    OPTIMAL_HASHES = {"SHA256", "SHA384", "SHA512", "NONE (AEAD)"}

    WEAK_DH_GROUPS = {
        "Group 1 (768-bit MODP)", "Group 2 (1024-bit MODP)", "Group 5 (1536-bit MODP)",
        "Group 1", "Group 2", "Group 5"
    }
    ACCEPTABLE_DH_GROUPS = {
        "Group 14 (2048-bit MODP)", "Group 15 (3072-bit MODP)", "Group 14", "Group 15"
    }
    OPTIMAL_DH_GROUPS = {
        "Group 19 (ECP-256)", "Group 20 (ECP-384)", "Group 21 (ECP-521)", "Group 31 (Curve25519)",
        "Group 16 (4096-bit MODP)", "Group 19", "Group 20", "Group 21", "Group 31", "Group 16"
    }

    @staticmethod
    def evaluate_posture(posture: Dict[str, Any]) -> List[Dict[str, Any]]:
        rules = []

        # 1. Protocol Version Rule
        ike_ver = posture.get("ike_version", "IKEv2")
        if ike_ver == "IKEv1":
            rules.append({
                "id": "RULE-PROT-01",
                "category": "Protocol Compliance",
                "parameter": "Protocol Version",
                "detected": "IKEv1",
                "status": "FAIL",
                "severity": "HIGH",
                "severity_badge": "🟠 High",
                "score_impact": -15,
                "assessment": "IKEv1 is deprecated (RFC 8247) and vulnerable to offline dictionary attacks and MITM flaws.",
                "recommendation": "Migrate immediately to IKEv2 (RFC 7296)."
            })
        else:
            rules.append({
                "id": "RULE-PROT-01",
                "category": "Protocol Compliance",
                "parameter": "Protocol Version",
                "detected": "IKEv2",
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 15,
                "assessment": "IKEv2 detected. Provides improved mobility, NAT traversal, and resilient handshake security.",
                "recommendation": "Maintain IKEv2 deployment."
            })

        # 2. Phase 1 Encryption Rule
        p1_enc = posture.get("phase1_encryption", "AES-256-GCM")
        if any(d in p1_enc.upper() for d in ["3DES", "DES", "RC4", "NULL"]):
            rules.append({
                "id": "RULE-CRYP-01",
                "category": "Cryptographic Strength",
                "parameter": "IKE SA Encryption",
                "detected": p1_enc,
                "status": "FAIL",
                "severity": "CRITICAL",
                "severity_badge": "🔴 Critical",
                "score_impact": -25,
                "assessment": f"Deprecated cipher {p1_enc} is vulnerable to Sweet32 collision attacks and brute-force key retrieval.",
                "recommendation": "Upgrade cipher to AES-256-GCM or AES-256-CBC."
            })
        elif "AES-128" in p1_enc.upper():
            rules.append({
                "id": "RULE-CRYP-01",
                "category": "Cryptographic Strength",
                "parameter": "IKE SA Encryption",
                "detected": p1_enc,
                "status": "WARNING",
                "severity": "MEDIUM",
                "severity_badge": "🟡 Medium",
                "score_impact": 5,
                "assessment": "AES-128 is acceptable, but AES-256 or AEAD modes (AES-GCM) are recommended for long-term security.",
                "recommendation": "Upgrade to AES-256-GCM for NIST & NSA CNSA 2.0 compliance."
            })
        else:
            rules.append({
                "id": "RULE-CRYP-01",
                "category": "Cryptographic Strength",
                "parameter": "IKE SA Encryption",
                "detected": p1_enc,
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 15,
                "assessment": f"Strong cipher {p1_enc} detected, providing robust confidentiality.",
                "recommendation": "Maintain current cipher proposal."
            })

        # 3. Integrity / Hash Algorithm Rule
        p1_int = posture.get("phase1_integrity", "SHA256")
        if any(h in p1_int.upper() for h in ["MD5", "SHA1"]):
            rules.append({
                "id": "RULE-CRYP-02",
                "category": "Cryptographic Strength",
                "parameter": "Integrity / Hash Algorithm",
                "detected": p1_int,
                "status": "FAIL",
                "severity": "HIGH",
                "severity_badge": "🟠 High",
                "score_impact": -15,
                "assessment": f"Hash algorithm {p1_int} suffers from severe cryptographic collision vulnerabilities (SHAttered attack).",
                "recommendation": "Replace with SHA-256, SHA-384, or SHA-512."
            })
        else:
            rules.append({
                "id": "RULE-CRYP-02",
                "category": "Cryptographic Strength",
                "parameter": "Integrity / Hash Algorithm",
                "detected": p1_int,
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 10,
                "assessment": f"Secure hash algorithm {p1_int} satisfies modern integrity standards.",
                "recommendation": "Maintain current hash configuration."
            })

        # 4. Diffie-Hellman Group Strength Rule
        dh = posture.get("dh_group", "Group 19 (ECP-256)")
        dh_upper = dh.upper()
        if any(w in dh for w in ["Group 1 (", "Group 2 (", "Group 5 ("]) or dh.strip() in ["Group 1", "Group 2", "Group 5"]:
            rules.append({
                "id": "RULE-KEYM-01",
                "category": "Key Management",
                "parameter": "Diffie-Hellman Group",
                "detected": dh,
                "status": "FAIL",
                "severity": "HIGH",
                "severity_badge": "🟠 High",
                "score_impact": -18,
                "assessment": f"Weak key exchange group {dh} (<2048-bit MODP) is vulnerable to state-sponsored number field sieve decryption.",
                "recommendation": "Upgrade DH Group to Group 14 (MODP-2048), Group 19 (ECP-256), or Group 31 (Curve25519)."
            })
        elif any(a in dh for a in ["Group 14 (", "Group 15 ("]) or dh.strip() in ["Group 14", "Group 15"]:
            rules.append({
                "id": "RULE-KEYM-01",
                "category": "Key Management",
                "parameter": "Diffie-Hellman Group",
                "detected": dh,
                "status": "WARNING",
                "severity": "MEDIUM",
                "severity_badge": "🟡 Medium",
                "score_impact": 8,
                "assessment": f"Diffie-Hellman {dh} meets minimum standards (2048-bit MODP), but Elliptic Curve groups provide higher security per bit.",
                "recommendation": "Transition to Group 19 (ECP-256) or Group 31 (Curve25519)."
            })
        else:
            rules.append({
                "id": "RULE-KEYM-01",
                "category": "Key Management",
                "parameter": "Diffie-Hellman Group",
                "detected": dh,
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 15,
                "assessment": f"High-strength Key Exchange group {dh} provides strong resistance against quantum and classical factorization attacks.",
                "recommendation": "Maintain current DH group."
            })

        # 5. Perfect Forward Secrecy (PFS) Rule
        pfs = posture.get("pfs_enabled", True)
        if not pfs:
            rules.append({
                "id": "RULE-KEYM-02",
                "category": "Key Management",
                "parameter": "Perfect Forward Secrecy (PFS)",
                "detected": "Disabled",
                "status": "FAIL",
                "severity": "HIGH",
                "severity_badge": "🟠 High",
                "score_impact": -14,
                "assessment": "PFS is disabled for Child SAs. If the long-term master key is compromised, all past recorded session traffic can be decrypted retroactively.",
                "recommendation": "Enable PFS in Phase 2 proposals using DH Group 14, 19, or 31."
            })
        else:
            rules.append({
                "id": "RULE-KEYM-02",
                "category": "Key Management",
                "parameter": "Perfect Forward Secrecy (PFS)",
                "detected": "Enabled",
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 12,
                "assessment": "PFS enabled. Ephemeral key exchanges ensure past traffic remains secret even if long-term credentials are lost.",
                "recommendation": "Keep PFS enabled on all Child SA tunnels."
            })

        # 6. Authentication Method Rule
        auth = posture.get("auth_method", "Pre-Shared Key (PSK)")
        if "PSK" in auth or "PRE-SHARED" in auth.upper():
            rules.append({
                "id": "RULE-CONF-01",
                "category": "Configuration Security",
                "parameter": "Authentication Method",
                "detected": auth,
                "status": "WARNING",
                "severity": "MEDIUM",
                "severity_badge": "🟡 Medium",
                "score_impact": -5,
                "assessment": "Pre-Shared Keys (PSK) can be compromised via dictionary attacks or weak password reuse across remote users.",
                "recommendation": "Enforce Digital Certificate (RSA-384 / ECDSA) or EAP-TLS multi-factor authentication."
            })
        else:
            rules.append({
                "id": "RULE-CONF-01",
                "category": "Configuration Security",
                "parameter": "Authentication Method",
                "detected": auth,
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 10,
                "assessment": "Strong asymmetric public key cryptography / digital certificate authentication detected.",
                "recommendation": "Maintain PKI certificate deployment with strict revocation checks (OCSP/CRL)."
            })

        # 7. SA Lifetime Rule
        lifetime = int(posture.get("sa_lifetime_sec", 3600))
        if lifetime > 28800: # > 8 hours
            rules.append({
                "id": "RULE-CONF-02",
                "category": "Configuration Security",
                "parameter": "SA Lifetime",
                "detected": f"{lifetime} seconds ({round(lifetime/3600, 1)} hrs)",
                "status": "WARNING",
                "severity": "MEDIUM",
                "severity_badge": "🟡 Medium",
                "score_impact": -8,
                "assessment": f"Excessive SA lifetime ({lifetime}s) increases exposure window to cryptanalytic attacks and key wearout.",
                "recommendation": "Reduce SA lifetime to 3600-14400 seconds (1 to 4 hours) per NIST SP 800-77 guidance."
            })
        else:
            rules.append({
                "id": "RULE-CONF-02",
                "category": "Configuration Security",
                "parameter": "SA Lifetime",
                "detected": f"{lifetime} seconds ({round(lifetime/3600, 1)} hrs)",
                "status": "PASS",
                "severity": "LOW",
                "severity_badge": "🟢 Low",
                "score_impact": 8,
                "assessment": f"Optimal SA lifetime ({lifetime}s) enforces frequent key re-negotiation.",
                "recommendation": "Maintain current rekeying interval."
            })

        return rules
