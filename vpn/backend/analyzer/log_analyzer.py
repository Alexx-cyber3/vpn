"""
VPN Log Analyzer & AI Threat Detector Module.
Parses raw VPN/IPsec log files (strongSwan charon, Cisco ASA, Fortinet, OpenVPN, Libreswan, Syslog),
detects AI behavioral anomalies (Brute-Force, Auth Failures, Tunnel Flapping, Proposal Mismatches),
and generates a Visual Log Timeline and Plain-English Fix Recommendations.
"""

import re
import json
import time
from typing import Dict, Any, List, Optional


class VPNLogAnalyzer:
    """Parses VPN logs, detects security threats, and generates diagnostic recommendations."""

    @staticmethod
    def analyze_logs(log_text: str) -> Dict[str, Any]:
        """Runs full parsing, threat detection, and timeline generation on log text."""
        lines = log_text.strip().splitlines()
        parsed_entries = []
        auth_failures = []
        proposal_errors = []
        dpd_timeouts = []
        peer_ips = set()
        ip_failure_counts = {}

        severity_counts = {"CRITICAL": 0, "ERROR": 0, "WARNING": 0, "INFO": 0}

        # Regex patterns for common VPN daemons
        ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        
        for idx, line in enumerate(lines):
            line_str = line.strip()
            if not line_str:
                continue

            # Determine severity
            severity = "INFO"
            line_upper = line_str.upper()

            if any(k in line_upper for k in ["CRITICAL", "FATAL", "BRUTE", "ATTACK", "SECURITY ALERT", "DENIED"]):
                severity = "CRITICAL"
            elif any(k in line_upper for k in ["ERROR", "FAILED", "FAILURE", "NO_PROPOSAL_CHOSEN", "AUTH_FAILED", "REJECTED", "MISMATCH"]):
                severity = "ERROR"
            elif any(k in line_upper for k in ["WARN", "WARNING", "TIMEOUT", "RETRANSMISSION", "FLAPPING", "EXPIRED"]):
                severity = "WARNING"

            severity_counts[severity] += 1

            # Extract IP addresses
            ips = ip_pattern.findall(line_str)
            peer_ip = ips[0] if ips else None
            if peer_ip and peer_ip not in ["127.0.0.1", "0.0.0.0"]:
                peer_ips.add(peer_ip)

            # Categorize specific events
            if any(k in line_upper for k in ["AUTHENTICATION FAILED", "AUTH_FAILED", "PASSWORD FAILED", "INVALID KEY", "EAP FAILED", "VERIFY ERROR"]):
                auth_failures.append({"line": idx + 1, "ip": peer_ip, "text": line_str})
                if peer_ip:
                    ip_failure_counts[peer_ip] = ip_failure_counts.get(peer_ip, 0) + 1

            if any(k in line_upper for k in ["NO_PROPOSAL_CHOSEN", "NO PROPOSAL", "PROPOSAL MISMATCH", "UNSUPPORTED ALGORITHM"]):
                proposal_errors.append({"line": idx + 1, "ip": peer_ip, "text": line_str})

            if any(k in line_upper for k in ["DPD TIMEOUT", "DEAD PEER", "KEEP-ALIVE TIMEOUT", "RECONNECTED"]):
                dpd_timeouts.append({"line": idx + 1, "ip": peer_ip, "text": line_str})

            # Detect daemon source
            daemon = "Generic Syslog"
            if "charon" in line_str.lower() or "[IKE]" in line_str or "[ENC]" in line_str:
                daemon = "strongSwan (charon)"
            elif "%ASA-" in line_str or "crypto_ike" in line_str.lower():
                daemon = "Cisco ASA / IOS"
            elif "openvpn" in line_str.lower() or "TLS Error" in line_str:
                daemon = "OpenVPN"
            elif "fgfm" in line_str.lower() or "ike" in line_str.lower() and "forti" in line_str.lower():
                daemon = "Fortinet FortiGate"

            parsed_entries.append({
                "line_num": idx + 1,
                "severity": severity,
                "daemon": daemon,
                "peer_ip": peer_ip or "N/A",
                "message": line_str
            })

        # --- AI Threat & Brute-Force Detection ---
        threats_detected = []
        brute_force_ips = []

        for ip, count in ip_failure_counts.items():
            if count >= 3:
                brute_force_ips.append({"ip": ip, "attempts": count})
                threats_detected.append({
                    "type": "BRUTE_FORCE_ATTACK",
                    "severity": "CRITICAL",
                    "title": f"Brute-Force Auth Attack Detected from IP {ip}",
                    "description": f"Observed {count} high-frequency authentication failures targeting VPN endpoint from host {ip}.",
                    "confidence": min(99, 70 + (count * 5))
                })

        if proposal_errors:
            threats_detected.append({
                "type": "PROPOSAL_MISMATCH",
                "severity": "ERROR",
                "title": f"IKE Cipher Proposal Mismatch ({len(proposal_errors)} events)",
                "description": "Remote peer requested cryptographic algorithms or DH groups not supported by local policy.",
                "confidence": 95
            })

        if len(dpd_timeouts) >= 2:
            threats_detected.append({
                "type": "TUNNEL_FLAPPING",
                "severity": "WARNING",
                "title": f"Tunnel Flapping / Dead Peer Detection (DPD) Timeouts",
                "description": f"Detected {len(dpd_timeouts)} DPD disconnect/reconnect loops indicating unstable network routing or MTU fragmentation.",
                "confidence": 88
            })

        # --- Plain-English Fix Recommendations ---
        recommendations = VPNLogAnalyzer._generate_recommendations(
            brute_force_ips, proposal_errors, dpd_timeouts, severity_counts
        )

        # --- Visual Log Timeline Array ---
        timeline_chart_data = VPNLogAnalyzer._generate_timeline(parsed_entries)

        return {
            "total_lines_parsed": len(parsed_entries),
            "severity_counts": severity_counts,
            "detected_peer_ips": list(peer_ips),
            "threats_detected": threats_detected,
            "brute_force_ips": brute_force_ips,
            "plain_english_recommendations": recommendations,
            "timeline_chart_data": timeline_chart_data,
            "parsed_log_entries": parsed_entries[:150]  # Cap for UI performance
        }

    @staticmethod
    def _generate_recommendations(
        brute_force_ips: List[Dict[str, Any]],
        proposal_errors: List[Dict[str, Any]],
        dpd_timeouts: List[Dict[str, Any]],
        severity_counts: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        recs = []

        if brute_force_ips:
            ip_list = ", ".join([b["ip"] for b in brute_force_ips])
            recs.append({
                "priority": "🔴 CRITICAL",
                "issue": "Active Password Brute-Force Attack",
                "root_cause": f"Host IP(s) [{ip_list}] are repeatedly guessing credentials against the VPN gateway.",
                "action": f"Block IP addresses ({ip_list}) using firewall rules or fail2ban (`iptables -A INPUT -s {brute_force_ips[0]['ip']} -j DROP`), and enable Multi-Factor Authentication (MFA/EAP-TLS)."
            })

        if proposal_errors:
            recs.append({
                "priority": "🟠 HIGH",
                "issue": "IKE Proposal / Cipher Selection Mismatch",
                "root_cause": "The remote peer sent an IKE/ESP proposal containing algorithms not configured in the local proposal list (NO_PROPOSAL_CHOSEN).",
                "action": "Align IKE Phase 1 / Phase 2 proposals on both endpoints. Add matching cipher proposals (e.g. `aes256gcm16-prfsha256-ecp256`) to swanctl.conf / crypto map."
            })

        if dpd_timeouts:
            recs.append({
                "priority": "🟡 MEDIUM",
                "issue": "Tunnel Flapping & DPD Timeout Disconnects",
                "root_cause": "Keep-alive DPD packets are failing to receive timely ACKs from remote peer due to packet drops or MTU issues.",
                "action": "Increase DPD delay interval (`dpd_delay = 30s`), configure `dpd_action = clear`, and set TCP MSS clamping (`iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtud`)."
            })

        if not recs:
            recs.append({
                "priority": "🟢 LOW",
                "issue": "Log Clean / Routine Operational Events",
                "root_cause": "No critical security threats or authentication attacks detected in parsed log entries.",
                "action": "Maintain routine log auditing and set up centralized syslog monitoring."
            })

        return recs

    @staticmethod
    def _generate_timeline(parsed_entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Groups log entries into timeline chunks for UI chart visualization."""
        if not parsed_entries:
            return []

        chunk_size = max(1, len(parsed_entries) // 10)
        timeline = []

        for i in range(0, len(parsed_entries), chunk_size):
            chunk = parsed_entries[i:i + chunk_size]
            crit = sum(1 for c in chunk if c["severity"] == "CRITICAL")
            err = sum(1 for c in chunk if c["severity"] == "ERROR")
            warn = sum(1 for c in chunk if c["severity"] == "WARNING")
            info = sum(1 for c in chunk if c["severity"] == "INFO")

            start_line = chunk[0]["line_num"]
            end_line = chunk[-1]["line_num"]

            timeline.append({
                "segment": f"Lines {start_line}-{end_line}",
                "Critical": crit,
                "Error": err,
                "Warning": warn,
                "Info": info,
                "total": len(chunk)
            })

        return timeline
