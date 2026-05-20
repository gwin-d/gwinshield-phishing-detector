from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import joblib
import os
import re
import numpy as np
import uvicorn  # <-- Imported for production hosting management

from database import get_db, init_db, ScanRecord
from ml.features import extract_features
from ml.heuristics import run_heuristics
from ml.scorer import compute_hybrid_score

# ── Load trained model ────────────────────────────────────────────
ML_DIR     = os.path.join(os.path.dirname(__file__), "ml")
MODEL_PATH = os.path.join(ML_DIR, "model.pkl")

print("Loading Random Forest model...")
model_data    = joblib.load(MODEL_PATH)
rf_model      = model_data["model"]
feature_names = model_data["feature_names"]
print(f"Model loaded. Features: {len(feature_names)}")

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(
    title="Hybrid Phishing Detection API",
    description="Detects phishing URLs using Heuristic Analysis + Random Forest",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── URL validation pattern ────────────────────────────────────────
URL_PATTERN = re.compile(
    r'^https?://'
    r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
    r'localhost|'
    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
    r'(?::\d+)?'
    r'(?:/?|[/?]\S+)$',
    re.IGNORECASE
)

# ── Initialise database on startup ────────────────────────────────
@app.on_event("startup")
def startup_event():
    init_db()
    print("Database ready.")

# ── Request / Response models ─────────────────────────────────────
class URLRequest(BaseModel):
    url:    str
    source: str = "portal"

class ScanResponse(BaseModel):
    url:             str
    verdict:         str
    hybrid_score:    float
    heuristic_score: float
    ml_score:        float
    flags:           list
    method:          str
    scanned_at:      str

# ── ML model inference ────────────────────────────────────────────
def run_ml_model(url: str) -> float:
    try:
        import pandas as pd
        features = extract_features(url)
        df       = pd.DataFrame([features])[feature_names]
        prob     = rf_model.predict_proba(df)[0]
        classes      = list(rf_model.classes_)
        phishing_idx = classes.index(1) if 1 in classes else 1
        return round(float(prob[phishing_idx]), 4)
    except Exception as e:
        print(f"ML error: {e}")
        return 0.5

# ── ENDPOINTS ─────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message":   "Hybrid Phishing Detection API is running",
        "version":   "1.0.0",
        "endpoints": {
            "check_url": "POST /api/check-url",
            "history":   "GET  /api/history",
            "stats":     "GET  /api/stats",
            "health":    "GET  /api/health",
        }
    }


@app.get("/api/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": True,
        "accuracy":     model_data.get("accuracy", "N/A"),
        "dataset":      model_data.get("dataset",  "N/A"),
    }


@app.post("/api/check-url", response_model=ScanResponse)
def check_url(request: URLRequest, db: Session = Depends(get_db)):
    url = request.url.strip()

    # Reject empty URLs
    if not url:
        raise HTTPException(
            status_code=400,
            detail="URL cannot be empty"
        )

    # Add scheme if missing
    if not (url.startswith("http://") or url.startswith("https://")):
        if url.startswith("www."):
            url = "https://" + url
        else:
            url = "http://" + url

    # Validate URL format
    if not URL_PATTERN.match(url):
        raise HTTPException(
            status_code=422,
            detail="Invalid URL format. Please enter a valid URL like https://example.com"
        )

    # 1. Run heuristic engine
    heuristic_result = run_heuristics(url)
    heuristic_score  = heuristic_result["heuristic_score"]
    flags            = heuristic_result["flags"]

    # 2. Run ML model
    ml_score = run_ml_model(url)

    # 3. Compute hybrid score and verdict
    scoring_result = compute_hybrid_score(ml_score, heuristic_score)
    hybrid_score   = scoring_result["hybrid_score"]
    verdict        = scoring_result["verdict"]
    method         = scoring_result["method"]

    # 4. Save to database
    record = ScanRecord(
        url             = url,
        heuristic_score = heuristic_score,
        ml_score        = ml_score,
        hybrid_score    = hybrid_score,
        verdict         = verdict,
        source          = request.source,
        scanned_at      = datetime.now(),
    )
    db.add(record)
    db.commit()

    return ScanResponse(
        url             = url,
        verdict         = verdict,
        hybrid_score    = hybrid_score,
        heuristic_score = heuristic_score,
        ml_score        = ml_score,
        flags           = flags,
        method          = method,
        scanned_at      = record.scanned_at.isoformat(),
    )


@app.get("/api/history")
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    records = (
        db.query(ScanRecord)
        .order_by(ScanRecord.scanned_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id":             r.id,
            "url":            r.url,
            "verdict":        r.verdict,
            "hybrid_score":   r.hybrid_score,
            "heuristic_score":r.heuristic_score,
            "ml_score":       r.ml_score,
            "source":         r.source,
            "scanned_at":     r.scanned_at.isoformat(),
        }
        for r in records
    ]


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total    = db.query(ScanRecord).count()
    phishing = db.query(ScanRecord).filter(
        ScanRecord.verdict == "Phishing"
    ).count()
    safe = db.query(ScanRecord).filter(
        ScanRecord.verdict == "Safe"
    ).count()

    return {
        "total_scans":     total,
        "phishing_found":  phishing,
        "safe_found":      safe,
        "phishing_rate":   round(phishing / total * 100, 2) if total > 0 else 0,
        "model_accuracy":  model_data.get("accuracy",  "N/A"),
        "model_f1":        model_data.get("f1_score",  "N/A"),
        "model_recall":    model_data.get("recall",    "N/A"),
        "model_precision": model_data.get("precision", "N/A"),
        "dataset":         model_data.get("dataset",   "N/A"),
    }

# ── Dynamic Port Block Entry Point for Render Cloud Architecture ──
if __name__ == "__main__":
    # Pulls the runtime port assigned by Render, defaulting to 8000 on your local computer
    production_port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=production_port)