"""
Pytest Test Suite for Backend Modules of IPsec VPN Framework.
"""

import pytest
from backend.analyzer.ipsec_parser import IPsecConfigParser
from backend.analyzer.pcap_flow_analyzer import PCAPFlowAnalyzer
from backend.security_engine.rule_engine import IPsecRuleEngine
from backend.security_engine.sequence_validator import IKESequenceValidator
from backend.ai_engine.ml_models import IPsecAIEngine
from backend.ai_engine.explainable_ai import IPsecXAIEngine
from backend.scoring_engine.risk_calculator import IPsecRiskEngine
from backend.privacy_baseline.drift_manager import DriftManager


def test_ipsec_parser_swanctl():
    config = """
    connections {
        vpn1 {
            version = 2
            proposals = aes256gcm16-prfsha256-ecp256
            rekey_time = 1h
        }
    }
    """
    posture = IPsecConfigParser.parse_config(config)
    assert posture["ike_version"] == "IKEv2"
    assert posture["phase1_encryption"] == "AES-256-GCM"
    assert posture["dh_group"] == "Group 19 (ECP-256)"


def test_ipsec_parser_legacy_cisco():
    config = "crypto ikev1 policy 10\n encryption 3des\n hash md5\n group 2"
    posture = IPsecConfigParser.parse_config(config)
    assert posture["ike_version"] == "IKEv1"
    assert posture["phase1_encryption"] == "3DES-CBC"
    assert posture["phase1_integrity"] == "MD5"
    assert "Group 2" in posture["dh_group"]


def test_rule_engine_deprecated_detection():
    posture = {
        "ike_version": "IKEv1",
        "phase1_encryption": "3DES-CBC",
        "phase1_integrity": "MD5",
        "dh_group": "Group 2 (1024-bit MODP)",
        "pfs_enabled": False,
        "sa_lifetime_sec": 86400,
        "auth_method": "Pre-Shared Key (PSK)"
    }
    rules = IPsecRuleEngine.evaluate_posture(posture)
    severities = [r["severity"] for r in rules]
    assert "CRITICAL" in severities
    assert "HIGH" in severities


def test_sequence_validator():
    flow = PCAPFlowAnalyzer._generate_sample_flow("sequence_anomaly")
    val = IKESequenceValidator.validate_sequence(flow)
    assert val["anomaly_count"] > 0
    assert not val["valid"]


def test_ai_engine_and_scoring():
    posture = IPsecConfigParser._default_posture()
    flow = PCAPFlowAnalyzer._generate_sample_flow("none")
    rules = IPsecRuleEngine.evaluate_posture(posture)
    seq = IKESequenceValidator.validate_sequence(flow)

    ai_eng = IPsecAIEngine()
    ai_pred = ai_eng.predict_security_posture(posture, flow)

    scoring = IPsecRiskEngine.calculate_overall_score(posture, rules, ai_pred, seq)
    assert scoring["overall_score"] >= 80
    assert scoring["grade"] in ["A+", "A", "A-", "B+"]

    xai = IPsecXAIEngine.explain_assessment(posture, rules, ai_pred, seq)
    assert len(xai["point_attributions"]) > 0


def test_drift_manager():
    dm = DriftManager()
    current = {
        "scoring": {"overall_score": 76},
        "posture": {
            "ike_version": "IKEv2",
            "phase1_encryption": "AES-128-CBC",
            "dh_group": "Group 14 (2048-bit MODP)",
            "pfs_enabled": False,
            "sa_lifetime_sec": 28800,
            "auth_method": "Pre-Shared Key (PSK)"
        }
    }
    drift = dm.calculate_drift("VPN-01", current)
    assert drift["drift_detected"]
    assert drift["score_delta"] < 0


def test_host_detector():
    from backend.analyzer.host_detector import HostVPNScanner
    res = HostVPNScanner.detect_host_vpn()
    assert "os" in res
    assert "hostname" in res
    assert "raw_config" in res
    assert len(res["raw_config"]) > 0


def test_log_analyzer():
    from backend.analyzer.log_analyzer import VPNLogAnalyzer
    sample_log = """
    Sep 26 10:14:03 gateway charon: 02[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
    Sep 26 10:14:05 gateway charon: 03[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
    Sep 26 10:14:07 gateway charon: 04[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
    Sep 26 10:15:20 gateway charon: 06[IKE] NO_PROPOSAL_CHOSEN notify received from 203.0.113.88
    """
    res = VPNLogAnalyzer.analyze_logs(sample_log)
    assert res["total_lines_parsed"] > 0
    assert len(res["threats_detected"]) > 0
    assert len(res["plain_english_recommendations"]) > 0
    assert len(res["timeline_chart_data"]) > 0
