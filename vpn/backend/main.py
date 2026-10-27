"""
FastAPI Server for AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework.
"""

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import time

from backend.analyzer.ipsec_parser import IPsecConfigParser
from backend.analyzer.pcap_flow_analyzer import PCAPFlowAnalyzer
from backend.analyzer.host_detector import HostVPNScanner
from backend.analyzer.log_analyzer import VPNLogAnalyzer
from backend.security_engine.rule_engine import IPsecRuleEngine
from backend.security_engine.sequence_validator import IKESequenceValidator
from backend.ai_engine.ml_models import IPsecAIEngine
from backend.ai_engine.explainable_ai import IPsecXAIEngine
from backend.scoring_engine.risk_calculator import IPsecRiskEngine
from backend.privacy_baseline.drift_manager import DriftManager
from backend.reports.report_generator import IPsecReportGenerator
from backend.samples import SAMPLE_SCENARIOS

app = FastAPI(
    title="AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework",
    version="1.0.0",
    description="Privacy-preserving local framework analyzing IPsec VPN protocols, configuration security, and protocol anomalies using AI + rule-based cryptographic evaluation."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Engine Instances
ai_engine = IPsecAIEngine()
drift_manager = DriftManager()


class ScanRequest(BaseModel):
    config_text: str
    config_type: Optional[str] = "auto"
    pcap_flow_data: Optional[Any] = None
    flow_type: Optional[str] = "none"
    vpn_id: Optional[str] = "VPN-01"


class BaselineSaveRequest(BaseModel):
    vpn_id: str
    assessment_data: Dict[str, Any]


class ReportRequest(BaseModel):
    assessment_data: Dict[str, Any]
    report_type: Optional[str] = "technical" # technical or executive


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "framework": "IPsec VPN Protocol Analyzer & Security Framework",
        "version": "1.0.0",
        "privacy_mode": "100% Local-First Zero-Payload Inspection",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@app.get("/api/samples")
def get_sample_scenarios():
    return {"scenarios": SAMPLE_SCENARIOS}


@app.post("/api/scan")
def analyze_ipsec_vpn(req: ScanRequest):
    try:
        # 1. Parse Config
        posture = IPsecConfigParser.parse_config(req.config_text, req.config_type or "auto")

        # 2. Parse / Generate PCAP Flow Telemetry
        if req.pcap_flow_data:
            flow_metadata = PCAPFlowAnalyzer.analyze_pcap_data(req.pcap_flow_data)
        else:
            flow_metadata = PCAPFlowAnalyzer._generate_sample_flow(req.flow_type or "none")

        # 3. Rule Engine Assessment
        rules = IPsecRuleEngine.evaluate_posture(posture)

        # 4. Protocol Sequence FSM Validation
        sequence_validation = IKESequenceValidator.validate_sequence(flow_metadata)

        # 5. AI Machine Learning Engine (Random Forest + Isolation Forest)
        ai_prediction = ai_engine.predict_security_posture(posture, flow_metadata)

        # 6. Hybrid Risk & Security Scoring Engine
        scoring = IPsecRiskEngine.calculate_overall_score(posture, rules, ai_prediction, sequence_validation)

        # 7. Explainable AI (XAI) Attribution & Primary Risk Synthesis
        xai = IPsecXAIEngine.explain_assessment(posture, rules, ai_prediction, sequence_validation)

        # 8. Baseline Drift Comparison
        drift = drift_manager.calculate_drift(req.vpn_id or "VPN-01", {
            "scoring": scoring,
            "posture": posture
        })

        # 9. Formulate Final Comprehensive Assessment Payload
        result = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "vpn_id": req.vpn_id or "VPN-01",
            "scoring": scoring,
            "posture": posture,
            "flow_metadata": flow_metadata,
            "sequence_validation": sequence_validation,
            "rules": rules,
            "ai_analysis": ai_prediction,
            "xai": xai,
            "baseline_drift": drift,
            "privacy_status": {
                "local_only": True,
                "payload_inspected": False,
                "metadata_only": True
            }
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running IPsec security assessment: {str(e)}")


@app.post("/api/scan/file")
async def analyze_ipsec_vpn_file(file: UploadFile = File(...), flow_type: Optional[str] = "none", vpn_id: Optional[str] = "VPN-01"):
    try:
        content = await file.read()
        config_text = content.decode("utf-8", errors="ignore")
        req = ScanRequest(
            config_text=config_text,
            config_type="auto",
            flow_type=flow_type,
            vpn_id=vpn_id
        )
        return analyze_ipsec_vpn(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing uploaded file: {str(e)}")


@app.get("/api/scan/device")
@app.post("/api/scan/device")
def scan_host_device_vpn():
    try:
        host_info = HostVPNScanner.detect_host_vpn()
        config_text = host_info.get("raw_config", "")
        req = ScanRequest(
            config_text=config_text,
            config_type="auto",
            flow_type="none",
            vpn_id=f"HOST-{host_info.get('hostname', 'DEVICE')}"
        )
        scan_res = analyze_ipsec_vpn(req)
        scan_res["host_device_metadata"] = {
            "os": host_info.get("os"),
            "hostname": host_info.get("hostname"),
            "source_type": host_info.get("source_type"),
            "detected_connections": host_info.get("detected_connections", []),
            "found_config_files": host_info.get("found_config_files", []),
            "active_adapters": host_info.get("active_adapters", [])
        }
        return scan_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning host device VPN: {str(e)}")


class LogScanRequest(BaseModel):
    log_text: str


@app.post("/api/log/analyze")
def analyze_vpn_logs(req: LogScanRequest):
    try:
        return VPNLogAnalyzer.analyze_logs(req.log_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing VPN logs: {str(e)}")


@app.post("/api/log/upload")
async def upload_vpn_logs(file: UploadFile = File(...)):
    try:
        content = await file.read()
        log_text = content.decode("utf-8", errors="ignore")
        return VPNLogAnalyzer.analyze_logs(log_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading and analyzing VPN logs: {str(e)}")


@app.post("/api/baselines/save")
def save_baseline(req: BaselineSaveRequest):
    res = drift_manager.save_baseline(req.vpn_id, req.assessment_data)
    return {"status": "success", "baseline": res}


@app.post("/api/reports/download")
def download_report(req: ReportRequest):
    html_content = IPsecReportGenerator.generate_html_report(req.assessment_data, req.report_type or "technical")
    return HTMLResponse(content=html_content)


@app.post("/api/privacy/federated-export")
def export_federated_update(req: ScanRequest):
    posture = IPsecConfigParser.parse_config(req.config_text, req.config_type or "auto")
    flow_metadata = PCAPFlowAnalyzer._generate_sample_flow(req.flow_type or "none")
    fed_update = drift_manager.generate_federated_update(posture, flow_metadata)
    return fed_update


# Serve Built Frontend Web Application if available
import os
from fastapi.staticfiles import StaticFiles
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

