"""
Command Line Interface (CLI) for IPsec VPN Protocol Analyzer & Security Assessment Framework.
Allows running automated security scans in CI/CD pipelines or local command shells.
"""

import sys
import json
import argparse
from backend.analyzer.ipsec_parser import IPsecConfigParser
from backend.analyzer.pcap_flow_analyzer import PCAPFlowAnalyzer
from backend.security_engine.rule_engine import IPsecRuleEngine
from backend.security_engine.sequence_validator import IKESequenceValidator
from backend.ai_engine.ml_models import IPsecAIEngine
from backend.ai_engine.explainable_ai import IPsecXAIEngine
from backend.scoring_engine.risk_calculator import IPsecRiskEngine


def main():
    parser = argparse.ArgumentParser(description="IPsec VPN Security Assessment Framework CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # Scan command
    scan_parser = subparsers.add_parser("scan", help="Run IPsec security scan on a configuration file")
    scan_parser.add_argument("--config", type=str, help="Path to raw IPsec configuration file")
    scan_parser.add_argument("--format", type=str, default="json", choices=["json", "summary"], help="Output format")

    # Demo command
    demo_parser = subparsers.add_parser("demo", help="Run sample assessment demonstration")

    args = parser.parse_args()

    if args.command == "demo" or not args.command:
        config_text = """connections {
    cloud-gateway {
        version = 2
        proposals = aes256gcm16-prfsha256-ecp256
        rekey_time = 1h
    }
}"""
        print("\n=======================================================")
        print("  IPsec VPN Protocol Analyzer & Security Assessment  ")
        print("=======================================================\n")
        print("Running demonstration scan on sample swanctl posture...")
    elif args.command == "scan":
        if not args.config:
            print("Error: Please specify --config file path.")
            sys.exit(1)
        with open(args.config, "r", encoding="utf-8") as f:
            config_text = f.read()

    # Execute Audit Pipeline
    posture = IPsecConfigParser.parse_config(config_text)
    flow = PCAPFlowAnalyzer._generate_sample_flow("none")
    rules = IPsecRuleEngine.evaluate_posture(posture)
    seq = IKESequenceValidator.validate_sequence(flow)

    ai_engine = IPsecAIEngine()
    ai_pred = ai_engine.predict_security_posture(posture, flow)

    scoring = IPsecRiskEngine.calculate_overall_score(posture, rules, ai_pred, seq)
    xai = IPsecXAIEngine.explain_assessment(posture, rules, ai_pred, seq)

    result = {
        "scoring": scoring,
        "posture": posture,
        "rules": rules,
        "ai_analysis": ai_pred,
        "xai": xai
    }

    if getattr(args, "format", "json") == "summary":
        print(f"\nOverall Score: {scoring['overall_score']}/100 — Grade: {scoring['grade']}")
        print(f"Rating: {scoring['rating_text']}")
        print(f"Primary Risk: {xai['primary_risk_summary']}\n")
        print("Key Findings:")
        for r in rules:
            print(f"  [{r['status']}] {r['parameter']} ({r['detected']}): {r['assessment']}")
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
