"""
Security Assessment Report Generator for IPsec VPN Framework.
Produces dual-tier reports:
1. Technical Assessment Report (Detailed packet sequence, algorithms, XAI attributions, compliance matrix)
2. Executive / Management Report (Grade, score gauge, risk pie, remediation roadmap)
Exports to HTML, JSON, and PDF formats.
"""

from typing import Dict, Any


class IPsecReportGenerator:
    """Generates formatted reports in HTML and JSON format."""

    @staticmethod
    def generate_html_report(assessment: Dict[str, Any], report_type: str = "technical") -> str:
        score_data = assessment["scoring"]
        posture = assessment["posture"]
        xai = assessment["xai"]
        rules = assessment["rules"]
        seq = assessment["sequence_validation"]

        grade = score_data["grade"]
        score = score_data["overall_score"]
        rating = score_data["rating_text"]

        grade_color = "#10B981" if score >= 85 else ("#F59E0B" if score >= 70 else "#EF4444")

        if report_type == "executive":
            return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>IPsec VPN Executive Security Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }}
        .card {{ background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }}
        .grade-badge {{ font-size: 48px; font-weight: bold; color: {grade_color}; background: rgba(255,255,255,0.05); padding: 12px 32px; border-radius: 16px; border: 2px solid {grade_color}; display: inline-block; }}
        .score {{ font-size: 36px; font-weight: bold; color: #38bdf8; }}
        .risk-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }}
        .risk-box {{ background: #0f172a; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #334155; }}
        .risk-box.crit {{ border-top: 4px solid #ef4444; }}
        .risk-box.high {{ border-top: 4px solid #f97316; }}
        .risk-box.med {{ border-top: 4px solid #eab308; }}
        .risk-box.low {{ border-top: 4px solid #10b981; }}
        .risk-num {{ font-size: 28px; font-weight: bold; margin-top: 4px; }}
        ul {{ line-height: 1.6; padding-left: 20px; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div>
                <h1 style="margin:0; color:#f8fafc;">IPsec VPN Security Assessment — Executive Report</h1>
                <p style="margin:4px 0 0 0; color:#94a3b8;">Privacy-Preserving AI + Rule-Based Cryptographic Audit</p>
            </div>
            <div class="grade-badge">{grade}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h2>Overall Security Score: <span class="score">{score} / 100</span></h2>
                <p style="color:#cbd5e1;">Assessment Grade Status: <strong>{rating}</strong></p>
            </div>
        </div>

        <h3>Risk Distribution Summary</h3>
        <div class="risk-grid">
            <div class="risk-box crit">
                <div style="color:#ef4444; font-weight:bold;">Critical</div>
                <div class="risk-num" style="color:#ef4444;">{score_data['risk_counts']['critical']}</div>
            </div>
            <div class="risk-box high">
                <div style="color:#f97316; font-weight:bold;">High</div>
                <div class="risk-num" style="color:#f97316;">{score_data['risk_counts']['high']}</div>
            </div>
            <div class="risk-box med">
                <div style="color:#eab308; font-weight:bold;">Medium</div>
                <div class="risk-num" style="color:#eab308;">{score_data['risk_counts']['medium']}</div>
            </div>
            <div class="risk-box low">
                <div style="color:#10b981; font-weight:bold;">Low</div>
                <div class="risk-num" style="color:#10b981;">{score_data['risk_counts']['low']}</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h3>Primary Risk Summary</h3>
        <p style="font-size:18px; color:#f1f5f9; background:#0f172a; padding:16px; border-left:4px solid #38bdf8; border-radius:4px;">
            {xai['primary_risk_summary']}
        </p>
        <p style="color:#94a3b8;">{xai['primary_risk_detail']}</p>
    </div>

    <div class="card">
        <h3>Priority Remediation Roadmap</h3>
        <ul>
            {"".join([f"<li><strong>[{r['priority']}] {r['issue']}:</strong> {r['action']}</li>" for r in xai.get('remediation_roadmap', [])])}
        </ul>
    </div>
</body>
</html>"""

        # Technical Report
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>IPsec VPN Technical Assessment Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }}
        .card {{ background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #334155; }}
        th {{ background: #0f172a; color: #38bdf8; }}
        .pass {{ color: #10b981; font-weight: bold; }}
        .warn {{ color: #eab308; font-weight: bold; }}
        .fail {{ color: #ef4444; font-weight: bold; }}
        .attr-pos {{ color: #10b981; font-weight: bold; }}
        .attr-neg {{ color: #ef4444; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>IPsec VPN Technical Protocol & Cryptographic Assessment</h1>
        <p>Overall Score: <strong>{score}/100 ({grade})</strong> | Target Vendor: {posture.get('vendor_type', 'Generic')}</p>
    </div>

    <div class="card">
        <h2>Detected Cryptographic Posture</h2>
        <table>
            <tr><th>Parameter</th><th>Value</th></tr>
            <tr><td>IKE Version</td><td>{posture.get('ike_version')}</td></tr>
            <tr><td>Phase 1 Encryption</td><td>{posture.get('phase1_encryption')}</td></tr>
            <tr><td>Integrity / Hash</td><td>{posture.get('phase1_integrity')}</td></tr>
            <tr><td>Diffie-Hellman Group</td><td>{posture.get('dh_group')}</td></tr>
            <tr><td>Perfect Forward Secrecy (PFS)</td><td>{'Enabled' if posture.get('pfs_enabled') else 'Disabled'}</td></tr>
            <tr><td>Authentication Method</td><td>{posture.get('auth_method')}</td></tr>
            <tr><td>SA Lifetime</td><td>{posture.get('sa_lifetime_sec')} seconds</td></tr>
        </table>
    </div>

    <div class="card">
        <h2>Explainable AI (XAI) Score Attributions</h2>
        <table>
            <tr><th>Factor</th><th>Impact</th><th>Explanation</th></tr>
            {"".join([f"<tr><td>{a['factor']}</td><td class='{'attr-pos' if a['numeric_impact']>0 else 'attr-neg'}'>{a['impact']}</td><td>{a['description']}</td></tr>" for a in xai['point_attributions']])}
        </table>
    </div>

    <div class="card">
        <h2>Compliance & Cryptographic Rule Assessment</h2>
        <table>
            <tr><th>Rule ID</th><th>Parameter</th><th>Status</th><th>Severity</th><th>Assessment</th></tr>
            {"".join([f"<tr><td>{r['id']}</td><td>{r['parameter']}</td><td class='{r['status'].lower()}'>{r['status']}</td><td>{r['severity_badge']}</td><td>{r['assessment']}</td></tr>" for r in rules])}
        </table>
    </div>
</body>
</html>"""
