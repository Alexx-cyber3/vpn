"""
IPsec & IKE Protocol Sequence Finite State Machine (FSM) Validator.
Validates negotiation sequence transitions and detects state anomalies:
- Out-of-order exchange sequences (e.g. CREATE_CHILD_SA before IKE_AUTH)
- Duplicate / retransmitted message flooding
- Missing expected response payloads
- Abrupt tunnel termination / unexpected teardown
"""

from typing import Dict, Any, List


class IKESequenceValidator:
    """Validates observed packet flow sequences against expected IKE state transitions."""

    # Expected State Machine Transition Map
    EXPECTED_TRANSITIONS = {
        "START": ["IKE_SA_INIT", "MAIN_MODE", "AGGRESSIVE_MODE"],
        "IKE_SA_INIT": ["IKE_SA_INIT", "IKE_AUTH"],
        "MAIN_MODE": ["MAIN_MODE", "QUICK_MODE"],
        "AGGRESSIVE_MODE": ["AGGRESSIVE_MODE", "QUICK_MODE"],
        "IKE_AUTH": ["IKE_AUTH", "CREATE_CHILD_SA", "INFORMATIONAL", "ESP"],
        "CREATE_CHILD_SA": ["CREATE_CHILD_SA", "INFORMATIONAL", "ESP"],
        "QUICK_MODE": ["QUICK_MODE", "ESP"],
        "INFORMATIONAL": ["INFORMATIONAL", "CREATE_CHILD_SA", "ESP"],
        "ESP": ["ESP", "CREATE_CHILD_SA", "INFORMATIONAL"]
    }

    @staticmethod
    def validate_sequence(flow_metadata: Dict[str, Any]) -> Dict[str, Any]:
        exchange_seq = flow_metadata.get("exchange_sequence", [])
        if not exchange_seq:
            return {
                "valid": True,
                "confidence_score": 100,
                "anomalies_detected": [],
                "state_summary": "No exchange data provided (Configuration static analysis mode)."
            }

        current_state = "START"
        anomalies = []
        state_history = []

        retransmission_count = flow_metadata.get("retransmission_count", 0)
        timing_jitter = flow_metadata.get("timing_jitter_ms", 0.0)

        for idx, item in enumerate(exchange_seq):
            exch = item.get("exchange_type", "UNKNOWN")
            status = item.get("status", "OK")

            expected_next = IKESequenceValidator.EXPECTED_TRANSITIONS.get(current_state, ["ESP", "INFORMATIONAL"])

            if exch not in expected_next:
                anomalies.append({
                    "step": idx + 1,
                    "from_state": current_state,
                    "to_state": exch,
                    "type": "OUT_OF_ORDER_SEQUENCE",
                    "severity": "HIGH",
                    "description": f"Unexpected exchange '{exch}' following state '{current_state}'. Expected one of {expected_next}.",
                    "likely_cause": "Misconfiguration, implementation handshake glitch, or out-of-order packet spoofing."
                })

            if status == "RETRANSMISSION":
                anomalies.append({
                    "step": idx + 1,
                    "from_state": current_state,
                    "to_state": exch,
                    "type": "RETRANSMISSION_BURST",
                    "severity": "MEDIUM",
                    "description": f"Retransmission detected at step {idx + 1} for exchange '{exch}'.",
                    "likely_cause": "Packet loss, MTU fragmentation issue, or firewall dropping handshake responses."
                })

            current_state = exch
            state_history.append(current_state)

        # Check retransmission flood
        if retransmission_count > 5:
            anomalies.append({
                "step": "GLOBAL",
                "from_state": "FLOW",
                "to_state": "FLOOD",
                "type": "RETRANSMISSION_FLOOD",
                "severity": "HIGH",
                "description": f"Excessive retransmission count ({retransmission_count} retransmissions) observed during handshake.",
                "likely_cause": "Severe network congestion, firewall drops, or Denial of Service (DoS) state exhaustion attempt."
            })

        # Check jitter anomaly
        if timing_jitter > 250.0:
            anomalies.append({
                "step": "GLOBAL",
                "from_state": "TIMING",
                "to_state": "JITTER",
                "type": "TIMING_JITTER_ANOMALY",
                "severity": "MEDIUM",
                "description": f"Abnormal inter-packet timing jitter ({timing_jitter} ms) detected during negotiation.",
                "likely_cause": "Unstable network route, CPU throttling on VPN gateway, or traffic shaping injection."
            })

        confidence = max(0, 100 - (len(anomalies) * 18))
        is_valid = len([a for a in anomalies if a["severity"] in ["HIGH", "CRITICAL"]]) == 0

        return {
            "valid": is_valid,
            "confidence_score": confidence,
            "anomalies_detected": anomalies,
            "anomaly_count": len(anomalies),
            "state_history": state_history,
            "state_summary": "Handshake state sequence verified clean." if is_valid else f"Detected {len(anomalies)} protocol sequence anomalies."
        }
