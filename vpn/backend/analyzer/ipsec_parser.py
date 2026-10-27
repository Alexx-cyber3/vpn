"""
IPsec & IKE Configuration Parser Module.
Parses multi-vendor IPsec configuration formats:
- strongSwan swanctl.conf / ipsec.conf
- Cisco ASA / IOS Crypto Map / IPsec Profiles
- pfSense / OPNsense IPsec XML/Config
- Fortinet FortiGate IPsec Phase1/Phase2 configs
- Generic JSON / Key-Value Security Profiles
"""

import re
import json
from typing import Dict, Any, List, Optional


class IPsecConfigParser:
    """Parses IPsec configuration strings and converts them into standardized security postures."""

    @staticmethod
    def parse_config(raw_config: str, config_type: str = "auto") -> Dict[str, Any]:
        raw_config_clean = raw_config.strip()
        if not raw_config_clean:
            return IPsecConfigParser._default_posture("Empty Configuration")

        if config_type == "auto":
            if "connections {" in raw_config_clean or "proposals =" in raw_config_clean:
                config_type = "swanctl"
            elif "config setup" in raw_config_clean or "conn " in raw_config_clean:
                config_type = "ipsec.conf"
            elif "crypto ipsec" in raw_config_clean or "crypto ikev2" in raw_config_clean or "crypto map" in raw_config_clean:
                config_type = "cisco"
            elif "config vpn ipsec" in raw_config_clean or "phase1-interface" in raw_config_clean:
                config_type = "fortinet"
            elif raw_config_clean.startswith("{") or raw_config_clean.startswith("["):
                config_type = "json"
            else:
                config_type = "generic"

        if config_type == "swanctl":
            return IPsecConfigParser._parse_swanctl(raw_config_clean)
        elif config_type == "ipsec.conf":
            return IPsecConfigParser._parse_ipsec_conf(raw_config_clean)
        elif config_type == "cisco":
            return IPsecConfigParser._parse_cisco(raw_config_clean)
        elif config_type == "fortinet":
            return IPsecConfigParser._parse_fortinet(raw_config_clean)
        elif config_type == "json":
            return IPsecConfigParser._parse_json(raw_config_clean)
        else:
            return IPsecConfigParser._parse_generic(raw_config_clean)

    @staticmethod
    def _default_posture(name: str = "Default Profile") -> Dict[str, Any]:
        return {
            "name": name,
            "ike_version": "IKEv2",
            "phase1_encryption": "AES-256-GCM",
            "phase1_integrity": "SHA256",
            "phase1_prf": "PRF-HMAC-SHA256",
            "dh_group": "Group 19 (ECP-256)",
            "auth_method": "Digital Signature (ECDSA / RSA-384)",
            "pfs_enabled": True,
            "pfs_dh_group": "Group 19 (ECP-256)",
            "phase2_encryption": "AES-256-GCM",
            "phase2_integrity": "None (AEAD)",
            "sa_lifetime_sec": 3600,
            "sa_lifetime_bytes": 0,
            "rekey_margin_sec": 540,
            "esn_enabled": True,
            "dpd_action": "clear",
            "dpd_delay": 30,
            "raw_parsed_proposals": ["aes256gcm16-prfsha256-ecp256"],
            "vendor_type": "Generic"
        }

    @staticmethod
    def _parse_swanctl(text: str) -> Dict[str, Any]:
        posture = IPsecConfigParser._default_posture("swanctl.conf Config")
        posture["vendor_type"] = "strongSwan (swanctl)"

        # Check IKE version
        if "version = 1" in text:
            posture["ike_version"] = "IKEv1"
        elif "version = 2" in text or "version = 0" in text:
            posture["ike_version"] = "IKEv2"

        # Proposals regex e.g., proposals = aes256gcm16-prfsha256-ecp256, aes128-sha1-modp1024
        proposals_match = re.search(r'proposals\s*=\s*([^\n;]+)', text, re.IGNORECASE)
        if proposals_match:
            props = [p.strip() for p in proposals_match.group(1).split(',')]
            posture["raw_parsed_proposals"] = props
            IPsecConfigParser._extract_proposal_tokens(props[0], posture)

        # Check auth
        if "pubkey" in text or "cert" in text:
            posture["auth_method"] = "Digital Certificates (PKI)"
        elif "psk" in text or "secret" in text:
            posture["auth_method"] = "Pre-Shared Key (PSK)"

        # Check SA lifetime
        rekey_match = re.search(r'rekey_time\s*=\s*(\d+)([smh]?)', text, re.IGNORECASE)
        if rekey_match:
            val = int(rekey_match.group(1))
            unit = rekey_match.group(2).lower()
            if unit == 'm': val *= 60
            elif unit == 'h': val *= 3600
            posture["sa_lifetime_sec"] = val

        return posture

    @staticmethod
    def _parse_ipsec_conf(text: str) -> Dict[str, Any]:
        posture = IPsecConfigParser._default_posture("ipsec.conf Config")
        posture["vendor_type"] = "strongSwan / Libreswan (ipsec.conf)"

        if "keyexchange=ikev1" in text.replace(" ", ""):
            posture["ike_version"] = "IKEv1"
        else:
            posture["ike_version"] = "IKEv2"

        # ike = aes256gcm16-prfsha256-modp2048!
        ike_match = re.search(r'ike\s*=\s*([^\n;]+)', text, re.IGNORECASE)
        if ike_match:
            prop = ike_match.group(1).strip().strip('!')
            posture["raw_parsed_proposals"] = [prop]
            IPsecConfigParser._extract_proposal_tokens(prop, posture)

        # esp = aes256gcm16-modp2048!
        esp_match = re.search(r'esp\s*=\s*([^\n;]+)', text, re.IGNORECASE)
        if esp_match:
            esp_prop = esp_match.group(1).strip().strip('!')
            if "modp" in esp_prop or "ecp" in esp_prop:
                posture["pfs_enabled"] = True
            else:
                posture["pfs_enabled"] = False

        if "authby=secret" in text.replace(" ", "") or "authby=psk" in text.replace(" ", ""):
            posture["auth_method"] = "Pre-Shared Key (PSK)"
        elif "authby=rsasig" in text.replace(" ", "") or "authby=pubkey" in text.replace(" ", ""):
            posture["auth_method"] = "RSA / ECDSA Certificate"

        ikelifetime = re.search(r'ikelifetime\s*=\s*(\d+)([smh]?)', text, re.IGNORECASE)
        if ikelifetime:
            val = int(ikelifetime.group(1))
            unit = ikelifetime.group(2).lower()
            if unit == 'm': val *= 60
            elif unit == 'h': val *= 3600
            posture["sa_lifetime_sec"] = val

        return posture

    @staticmethod
    def _parse_cisco(text: str) -> Dict[str, Any]:
        posture = IPsecConfigParser._default_posture("Cisco ASA/IOS IPsec Profile")
        posture["vendor_type"] = "Cisco ASA / IOS"

        if "crypto ikev1" in text or "ikev1" in text:
            posture["ike_version"] = "IKEv1"
        else:
            posture["ike_version"] = "IKEv2"

        # Encryption
        if "encryption 3des" in text or "transform-set 3des" in text:
            posture["phase1_encryption"] = "3DES-CBC"
            posture["phase2_encryption"] = "3DES-CBC"
        elif "encryption aes-256" in text or "aes-256" in text:
            posture["phase1_encryption"] = "AES-256-CBC"
            posture["phase2_encryption"] = "AES-256-CBC"
        elif "encryption aes-gcm" in text or "aes-gcm-256" in text:
            posture["phase1_encryption"] = "AES-256-GCM"
            posture["phase2_encryption"] = "AES-256-GCM"
        elif "encryption des" in text:
            posture["phase1_encryption"] = "DES-CBC"
            posture["phase2_encryption"] = "DES-CBC"

        # Integrity
        if "hash md5" in text or "integrity md5" in text:
            posture["phase1_integrity"] = "MD5"
        elif "hash sha" in text or "integrity sha" in text or "hash sha1" in text:
            posture["phase1_integrity"] = "SHA1"
        elif "hash sha256" in text or "integrity sha256" in text:
            posture["phase1_integrity"] = "SHA256"

        # Group
        group_match = re.search(r'group\s+(\d+)', text, re.IGNORECASE)
        if group_match:
            g_num = group_match.group(1)
            posture["dh_group"] = IPsecConfigParser._map_dh_num(g_num)

        # PFS
        if "pfs" in text.lower():
            posture["pfs_enabled"] = True
            pfs_group = re.search(r'pfs\s+group(\d+)', text, re.IGNORECASE)
            if pfs_group:
                posture["pfs_dh_group"] = IPsecConfigParser._map_dh_num(pfs_group.group(1))
        else:
            posture["pfs_enabled"] = False

        if "authentication pre-share" in text or "preshared-key" in text:
            posture["auth_method"] = "Pre-Shared Key (PSK)"

        lifetime_match = re.search(r'lifetime\s+(\d+)', text, re.IGNORECASE)
        if lifetime_match:
            posture["sa_lifetime_sec"] = int(lifetime_match.group(1))

        return posture

    @staticmethod
    def _parse_fortinet(text: str) -> Dict[str, Any]:
        posture = IPsecConfigParser._default_posture("Fortinet FortiGate IPsec")
        posture["vendor_type"] = "Fortinet FortiGate"

        if "set ike-version 1" in text:
            posture["ike_version"] = "IKEv1"
        else:
            posture["ike_version"] = "IKEv2"

        if "3des" in text:
            posture["phase1_encryption"] = "3DES-CBC"
        elif "aes256gcm" in text or "aes256-gcm" in text:
            posture["phase1_encryption"] = "AES-256-GCM"
        elif "aes256" in text:
            posture["phase1_encryption"] = "AES-256-CBC"
        elif "des" in text:
            posture["phase1_encryption"] = "DES-CBC"

        if "md5" in text:
            posture["phase1_integrity"] = "MD5"
        elif "sha1" in text:
            posture["phase1_integrity"] = "SHA1"
        elif "sha256" in text:
            posture["phase1_integrity"] = "SHA256"

        dh_match = re.search(r'set dhgrp\s+([0-9\s]+)', text, re.IGNORECASE)
        if dh_match:
            first_grp = dh_match.group(1).strip().split()[0]
            posture["dh_group"] = IPsecConfigParser._map_dh_num(first_grp)

        if "set pfs enable" in text:
            posture["pfs_enabled"] = True
        elif "set pfs disable" in text:
            posture["pfs_enabled"] = False

        if "set psksecret" in text:
            posture["auth_method"] = "Pre-Shared Key (PSK)"

        return posture

    @staticmethod
    def _parse_json(text: str) -> Dict[str, Any]:
        try:
            data = json.loads(text)
            posture = IPsecConfigParser._default_posture(data.get("name", "JSON Security Profile"))
            for key in posture.keys():
                if key in data:
                    posture[key] = data[key]
            return posture
        except Exception:
            return IPsecConfigParser._parse_generic(text)

    @staticmethod
    def _parse_generic(text: str) -> Dict[str, Any]:
        posture = IPsecConfigParser._default_posture("Generic Config Text")
        posture["vendor_type"] = "Generic Text Analysis"

        text_lower = text.lower()
        if "ikev1" in text_lower or "main mode" in text_lower or "aggressive mode" in text_lower:
            posture["ike_version"] = "IKEv1"
        elif "ikev2" in text_lower:
            posture["ike_version"] = "IKEv2"

        # Encryption search
        if "3des" in text_lower:
            posture["phase1_encryption"] = "3DES-CBC"
            posture["phase2_encryption"] = "3DES-CBC"
        elif "des" in text_lower and "3des" not in text_lower:
            posture["phase1_encryption"] = "DES-CBC"
            posture["phase2_encryption"] = "DES-CBC"
        elif "aes-256-gcm" in text_lower or "aes256gcm" in text_lower:
            posture["phase1_encryption"] = "AES-256-GCM"
            posture["phase2_encryption"] = "AES-256-GCM"
        elif "aes-128-cbc" in text_lower or "aes128" in text_lower:
            posture["phase1_encryption"] = "AES-128-CBC"
            posture["phase2_encryption"] = "AES-128-CBC"

        # Integrity search
        if "md5" in text_lower:
            posture["phase1_integrity"] = "MD5"
        elif "sha1" in text_lower or "sha-1" in text_lower:
            posture["phase1_integrity"] = "SHA1"
        elif "sha256" in text_lower or "sha-256" in text_lower:
            posture["phase1_integrity"] = "SHA256"
        elif "sha512" in text_lower or "sha-512" in text_lower:
            posture["phase1_integrity"] = "SHA512"

        # DH Group search
        dh_match = re.search(r'(dh|group|modp|ecp)\s*[-_]?\s*(\d+)', text_lower)
        if dh_match:
            posture["dh_group"] = IPsecConfigParser._map_dh_num(dh_match.group(2))

        # PFS search
        if "pfs disabled" in text_lower or "pfs=no" in text_lower or "pfs off" in text_lower:
            posture["pfs_enabled"] = False
        elif "pfs enabled" in text_lower or "pfs=yes" in text_lower or "pfs on" in text_lower:
            posture["pfs_enabled"] = True

        # SA Lifetime
        life_match = re.search(r'lifetime\s*[:=]?\s*(\d+)', text_lower)
        if life_match:
            posture["sa_lifetime_sec"] = int(life_match.group(1))

        # Auth
        if "psk" in text_lower or "preshared" in text_lower or "secret" in text_lower:
            posture["auth_method"] = "Pre-Shared Key (PSK)"
        elif "rsa" in text_lower or "cert" in text_lower or "pki" in text_lower or "ecdsa" in text_lower:
            posture["auth_method"] = "Digital Certificate (PKI)"

        return posture

    @staticmethod
    def _extract_proposal_tokens(prop: str, posture: Dict[str, Any]):
        prop_l = prop.lower()
        if "3des" in prop_l:
            posture["phase1_encryption"] = "3DES-CBC"
        elif "des" in prop_l:
            posture["phase1_encryption"] = "DES-CBC"
        elif "aes256gcm" in prop_l or "aes-256-gcm" in prop_l:
            posture["phase1_encryption"] = "AES-256-GCM"
        elif "aes128gcm" in prop_l:
            posture["phase1_encryption"] = "AES-128-GCM"
        elif "aes256" in prop_l:
            posture["phase1_encryption"] = "AES-256-CBC"
        elif "aes128" in prop_l:
            posture["phase1_encryption"] = "AES-128-CBC"

        if "md5" in prop_l:
            posture["phase1_integrity"] = "MD5"
        elif "sha384" in prop_l:
            posture["phase1_integrity"] = "SHA384"
        elif "sha512" in prop_l:
            posture["phase1_integrity"] = "SHA512"
        elif "sha256" in prop_l:
            posture["phase1_integrity"] = "SHA256"
        elif "sha1" in prop_l or "sha" in prop_l:
            posture["phase1_integrity"] = "SHA1"

        if "modp768" in prop_l: posture["dh_group"] = "Group 1 (768-bit MODP)"
        elif "modp1024" in prop_l: posture["dh_group"] = "Group 2 (1024-bit MODP)"
        elif "modp1536" in prop_l: posture["dh_group"] = "Group 5 (1536-bit MODP)"
        elif "modp2048" in prop_l: posture["dh_group"] = "Group 14 (2048-bit MODP)"
        elif "modp3072" in prop_l: posture["dh_group"] = "Group 15 (3072-bit MODP)"
        elif "modp4096" in prop_l: posture["dh_group"] = "Group 16 (4096-bit MODP)"
        elif "ecp256" in prop_l: posture["dh_group"] = "Group 19 (ECP-256)"
        elif "ecp384" in prop_l: posture["dh_group"] = "Group 20 (ECP-384)"
        elif "ecp521" in prop_l: posture["dh_group"] = "Group 21 (ECP-521)"
        elif "curve25519" in prop_l: posture["dh_group"] = "Group 31 (Curve25519)"

    @staticmethod
    def _map_dh_num(num_str: str) -> str:
        mapping = {
            "1": "Group 1 (768-bit MODP)",
            "2": "Group 2 (1024-bit MODP)",
            "5": "Group 5 (1536-bit MODP)",
            "14": "Group 14 (2048-bit MODP)",
            "15": "Group 15 (3072-bit MODP)",
            "16": "Group 16 (4096-bit MODP)",
            "19": "Group 19 (ECP-256)",
            "20": "Group 20 (ECP-384)",
            "21": "Group 21 (ECP-521)",
            "31": "Group 31 (Curve25519)"
        }
        return mapping.get(str(num_str), f"Group {num_str}")
