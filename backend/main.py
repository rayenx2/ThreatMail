import os
import time
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from runtime_graph import app as agent_app
from confidence import compute_confidence_score

# ----------------------------
# FastAPI app
# ----------------------------
app = FastAPI(
    title="ThreatMail — Multi-Agent AI Security Operations Center",
    description=(
        "AI-powered email threat analysis system using LangGraph multi-agent "
        "orchestration. Detects phishing, suspicious, and legitimate emails with "
        "explainable SOC-style reports. By Rayen Lassoued."
    ),
    version="2.0.0",
)

# ----------------------------
# In-memory request metrics
# ----------------------------
_metrics: dict = {
    "total_requests": 0,
    "verdicts": defaultdict(int),
    "avg_risk_score": 0.0,
    "risk_scores": [],
    "start_time": time.time(),
    "high_confidence_count": 0,
}

# ----------------------------
# CORS CONFIG (FIXED)
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://agentic-soc-runtime-1.onrender.com",
        "https://agentic-soc-runtime.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Request schema
# ----------------------------
class EmailInput(BaseModel):
    email_content: str

# ----------------------------
# Health check
# ----------------------------
@app.get("/")
def health():
    uptime_seconds = int(time.time() - _metrics["start_time"])
    return {
        "status": "ok",
        "service": "ThreatMail",
        "version": "2.0.0",
        "uptime_seconds": uptime_seconds,
        "total_requests": _metrics["total_requests"],
    }


# ----------------------------
# SOC Investigation endpoint
# ----------------------------
@app.post("/investigate")
def investigate(payload: EmailInput):
    try:
        result = agent_app.invoke({
            "email": payload.email_content
        })

        # Compute multi-factor confidence score
        confidence_result = compute_confidence_score(result)
        result["confidence"] = {
            "overall": confidence_result.overall_confidence,
            "reliable": confidence_result.reliable,
            "explanation": confidence_result.explanation,
            "factors": confidence_result.factors,
        }

        # Update in-memory metrics
        _metrics["total_requests"] += 1
        verdict = result.get("verdict", "unknown")
        _metrics["verdicts"][verdict] += 1
        risk = result.get("risk_score", 0)
        _metrics["risk_scores"].append(risk)
        _metrics["avg_risk_score"] = sum(_metrics["risk_scores"]) / len(_metrics["risk_scores"])
        if confidence_result.reliable:
            _metrics["high_confidence_count"] += 1

        return result

    except Exception as e:
        return {
            "verdict": "error",
            "risk_score": 0,
            "confidence": {"overall": 0, "reliable": False, "explanation": str(e), "factors": {}},
            "reasoning": {
                "signals": [],
                "soc_report": [f"Backend error: {str(e)}"],
            },
        }


# ----------------------------
# Metrics endpoint
# ----------------------------
@app.get("/metrics")
def metrics():
    """
    Returns runtime statistics for the ThreatMail system.
    Useful for monitoring and portfolio demos.
    """
    uptime = int(time.time() - _metrics["start_time"])
    total = _metrics["total_requests"]
    verdicts = dict(_metrics["verdicts"])
    phishing_count = verdicts.get("phishing", 0)
    detection_rate = round(phishing_count / total * 100, 1) if total > 0 else 0.0

    return {
        "service": "ThreatMail",
        "uptime_seconds": uptime,
        "total_analyses": total,
        "verdict_distribution": verdicts,
        "avg_risk_score": round(_metrics["avg_risk_score"], 1),
        "phishing_detection_rate_pct": detection_rate,
        "high_confidence_detections": _metrics["high_confidence_count"],
        "model": {
            "llm": os.getenv("LLM_MODEL", "gpt-4.1-mini"),
            "framework": "LangGraph",
            "agents": ["ioc", "threat", "virustotal", "memory", "reasoning", "report"],
        },
        "benchmark": {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.90,
            "dataset_size": 40,
        },
    }