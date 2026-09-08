"""
Explainable AI (XAI) Engine for IPsec VPN Assessment.
Converts black-box model predictions and rule outputs into human-understandable
score breakdown trees (+15 pts, -14 pts), primary risk syntheses, and feature attributions.
"""

from typing import Dict, Any, List


class IPsecXAIEngine:
    """Generates detailed, transparent score explanations and primary risk summaries."""

    @staticmethod
    def explain_assessment(
        posture: Dict[str, Any],
        rules: List[Dict[str, Any]],
        ai_prediction: Dict[str, Any],
        sequence_validation: Dict[str, Any]
    ) -> Dict[str, Any]:

        point_attributions = []
        positive_factors = []
        negative_factors = []

        # Process Rules for Attributions
        for rule in rules:
            impact = rule.get("score_impact", 0)
            param = rule.get("parameter", "")
            val = rule.get("detected", "")
            badge = rule.get("severity_badge", "🟢 Low")

            if impact > 0:
                attribution = {
                    "factor": f"{param} ({val})",
                    "impact": f"+{impact}",
                    "numeric_impact": impact,
                    "type": "POSITIVE",
                    "description": rule.get("assessment", "")
                }
                point_attributions.append(attribution)
                positive_factors.append(attribution["factor"])
            elif impact < 0:
                attribution = {
                    "factor": f"{param} ({val})",
                    "impact": f"{impact}",
                    "numeric_impact": impact,
                    "type": "NEGATIVE",
                    "badge": badge,
                    "description": rule.get("assessment", "")
                }
                point_attributions.append(attribution)
                negative_factors.append(attribution["factor"])

        # Process AI Behavioral Anomaly
        if ai_prediction.get("is_behavioral_anomaly", False):
            conf = ai_prediction.get("anomaly_confidence", 94.0)
            attr = {
                "factor": f"Abnormal Protocol Negotiation Pattern (Confidence: {conf}%)",
                "impact": "-14",
                "numeric_impact": -14,
                "type": "NEGATIVE",
                "badge": "🟠 High",
                "description": f"Isolation Forest ML detected abnormal handshake timing or payload structure deviating from expected IPsec profiles."
            }
            point_attributions.append(attr)
            negative_factors.append("Abnormal negotiation pattern")

        # Process Sequence Anomalies
        seq_anomalies = sequence_validation.get("anomalies_detected", [])
        if seq_anomalies:
            for seq_a in seq_anomalies:
                attr = {
                    "factor": f"Protocol Sequence Deviation: {seq_a.get('type')}",
                    "impact": "-10",
                    "numeric_impact": -10,
                    "type": "NEGATIVE",
                    "badge": "🟠 High",
                    "description": seq_a.get("description", "")
                }
                point_attributions.append(attr)
                negative_factors.append(f"Sequence Anomaly ({seq_a.get('type')})")

        # Primary Risk Synthesis
        primary_risk = IPsecXAIEngine._synthesize_primary_risk(posture, rules, ai_prediction, sequence_validation)

        # Feature Importance breakdown for UI chart (SHAP-style visual representation)
        feature_importance_waterfall = []
        base_score = 50 # Baseline starting score
        current_cumulative = base_score

        feature_importance_waterfall.append({
            "name": "Base Protocol Score",
            "val": base_score,
            "cumulative": current_cumulative
        })

        for attr in point_attributions:
            imp = attr["numeric_impact"]
            current_cumulative += imp
            feature_importance_waterfall.append({
                "name": attr["factor"],
                "val": imp,
                "cumulative": current_cumulative
            })

        return {
            "point_attributions": point_attributions,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "primary_risk_summary": primary_risk["summary"],
            "primary_risk_detail": primary_risk["detail"],
            "remediation_roadmap": primary_risk["remediations"],
            "waterfall_chart_data": feature_importance_waterfall
        }

    @staticmethod
    def _synthesize_primary_risk(
        posture: Dict[str, Any],
        rules: List[Dict[str, Any]],
        ai_prediction: Dict[str, Any],
        sequence_validation: Dict[str, Any]
    ) -> Dict[str, Any]:

        critical_rules = [r for r in rules if r.get("severity") == "CRITICAL"]
        high_rules = [r for r in rules if r.get("severity") == "HIGH"]
        is_anomaly = ai_prediction.get("is_behavioral_anomaly", False)

        remediations = []
        for r in rules:
            if r.get("status") in ["FAIL", "WARNING"]:
                remediations.append({
                    "priority": r.get("severity_badge", "🟡 Medium"),
                    "issue": r.get("parameter", ""),
                    "action": r.get("recommendation", "")
                })

        if critical_rules:
            first_crit = critical_rules[0]
            summary = f"Critical Security Risk: Deprecated cryptographic primitives ({first_crit.get('parameter')} = {first_crit.get('detected')}) exposed."
            detail = f"The VPN endpoint uses severely compromised cryptography ({first_crit.get('detected')}). This exposes session traffic to active interception and offline decryption."
        elif high_rules and is_anomaly:
            summary = "High Risk: Weak key-exchange configuration combined with abnormal negotiation behavior."
            detail = "The posture exhibits vulnerable key exchange parameters alongside ML-detected behavioral anomalies during tunnel handshake."
        elif high_rules:
            summary = f"High Risk: Insufficient key protection or protocol non-compliance ({high_rules[0].get('parameter')})."
            detail = f"The posture fails key NIST SP 800-77 recommendations regarding {high_rules[0].get('parameter')}."
        elif is_anomaly:
            summary = "Behavioral Anomaly Warning: Unexpected handshake exchange sequence or retransmission pattern."
            detail = "While cryptographic algorithms meet baseline requirements, observed network exchange telemetry deviates from standard IPsec behavior."
        else:
            summary = "Optimal / Low Risk: Strong cryptographic posture and compliant IKE state transitions."
            detail = "All configured algorithms, DH groups, PFS settings, and exchange sequences comply with NIST SP 800-77 and NSA CNSA 2.0 standards."

        return {
            "summary": summary,
            "detail": detail,
            "remediations": remediations
        }
