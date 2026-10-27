"""
IPsec Security Score & Risk Engine.
Calculates standardized IPsec Security Score (0-100) and Letter Grades (A+ to F)
using a weighted 6-category evaluation matrix.
"""

from typing import Dict, Any, List, Tuple


class IPsecRiskEngine:
    """Calculates final scores, sub-scores, and letter grades for IPsec VPN assessments."""

    @staticmethod
    def calculate_overall_score(
        posture: Dict[str, Any],
        rules: List[Dict[str, Any]],
        ai_prediction: Dict[str, Any],
        sequence_validation: Dict[str, Any]
    ) -> Dict[str, Any]:

        # 1. Cryptographic Strength (Weight: 25%)
        cryp_rules = [r for r in rules if r.get("category") == "Cryptographic Strength"]
        cryp_score = 100
        for r in cryp_rules:
            if r.get("status") == "FAIL": cryp_score -= 40
            elif r.get("status") == "WARNING": cryp_score -= 15
        cryp_score = max(0, min(100, cryp_score))

        # 2. Protocol Compliance (Weight: 20%)
        prot_rules = [r for r in rules if r.get("category") == "Protocol Compliance"]
        prot_score = 100
        for r in prot_rules:
            if r.get("status") == "FAIL": prot_score -= 50
            elif r.get("status") == "WARNING": prot_score -= 20
        prot_score = max(0, min(100, prot_score))

        # 3. Key Management & PFS (Weight: 20%)
        keym_rules = [r for r in rules if r.get("category") == "Key Management"]
        keym_score = 100
        for r in keym_rules:
            if r.get("status") == "FAIL": keym_score -= 35
            elif r.get("status") == "WARNING": keym_score -= 15
        keym_score = max(0, min(100, keym_score))

        # 4. Configuration Security (Weight: 15%)
        conf_rules = [r for r in rules if r.get("category") == "Configuration Security"]
        conf_score = 100
        for r in conf_rules:
            if r.get("status") == "FAIL": conf_score -= 35
            elif r.get("status") == "WARNING": conf_score -= 15
        conf_score = max(0, min(100, conf_score))

        # 5. Protocol Behavior (Weight: 10%)
        beh_score = 100
        if not sequence_validation.get("valid", True):
            beh_score -= 30
        beh_score -= (sequence_validation.get("anomaly_count", 0) * 15)
        beh_score = max(0, min(100, beh_score))

        # 6. Anomaly Detection (Weight: 10%)
        anom_score = 100
        if ai_prediction.get("is_behavioral_anomaly", False):
            anom_score -= 40
        iso_dec = ai_prediction.get("isolation_forest_decision_score", 0.0)
        if iso_dec < 0:
            anom_score -= int(abs(iso_dec) * 50)
        anom_score = max(0, min(100, anom_score))

        # Weighted Overall Score
        overall_score = round(
            (cryp_score * 0.25) +
            (prot_score * 0.20) +
            (keym_score * 0.20) +
            (conf_score * 0.15) +
            (beh_score  * 0.10) +
            (anom_score * 0.10)
        )

        grade, rating_text = IPsecRiskEngine._get_grade(overall_score)

        return {
            "overall_score": overall_score,
            "grade": grade,
            "rating_text": rating_text,
            "category_scores": {
                "cryptographic_strength": {"score": cryp_score, "weight": "25%"},
                "protocol_compliance": {"score": prot_score, "weight": "20%"},
                "key_management": {"score": keym_score, "weight": "20%"},
                "configuration_security": {"score": conf_score, "weight": "15%"},
                "protocol_behavior": {"score": beh_score, "weight": "10%"},
                "anomaly_detection": {"score": anom_score, "weight": "10%"}
            },
            "risk_counts": {
                "critical": len([r for r in rules if r.get("severity") == "CRITICAL"]),
                "high": len([r for r in rules if r.get("severity") == "HIGH"]),
                "medium": len([r for r in rules if r.get("severity") == "MEDIUM"]),
                "low": len([r for r in rules if r.get("severity") == "LOW"])
            }
        }

    @staticmethod
    def _get_grade(score: int) -> Tuple[str, str]:
        if score >= 95: return "A+", "EXCELLENT"
        elif score >= 90: return "A", "OPTIMAL"
        elif score >= 85: return "A-", "GOOD"
        elif score >= 78: return "B+", "SATISFACTORY"
        elif score >= 70: return "B", "ACCEPTABLE"
        elif score >= 60: return "C", "MODERATE RISK"
        elif score >= 50: return "D", "HIGH RISK"
        else: return "F", "CRITICAL VULNERABILITY"
