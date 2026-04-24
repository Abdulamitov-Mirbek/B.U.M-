from pathlib import Path
from typing import Optional

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel


MODELS_DIR = Path("models")
MODEL_PATH = MODELS_DIR / "model.pkl"

app = FastAPI(title="Credit Scoring ML Service")
model = None


class CreditFeatures(BaseModel):
    user_id: str
    age: int
    monthly_income: float
    loan_amount: float
    loan_term_months: int
    credit_history_years: float
    current_debt: float
    employment_years: float
    dependents: int


class PredictionResponse(BaseModel):
    probability: float
    result: str
    score: float
    riskLevel: str
    recommendedAmount: float


def load_model() -> Optional[object]:
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    return None


def build_feature_vector(features: CreditFeatures) -> np.ndarray:
    return np.array(
        [[
            features.age,
            features.monthly_income,
            features.loan_amount,
            features.loan_term_months,
            features.credit_history_years,
            features.current_debt,
            features.employment_years,
            features.dependents,
        ]]
    )


def fallback_score(features: CreditFeatures) -> float:
    debt_ratio = features.current_debt / max(features.monthly_income, 1)
    loan_ratio = features.loan_amount / max(features.monthly_income * 12, 1)
    term_penalty = min(features.loan_term_months / 72, 1)
    dependents_penalty = min(features.dependents / 5, 1)

    raw_score = (
        0.30 * min(features.credit_history_years / 10, 1)
        + 0.20 * min(features.employment_years / 10, 1)
        + 0.18 * min(features.age / 60, 1)
        + 0.17 * max(0, 1 - debt_ratio)
        + 0.15 * max(0, 1 - loan_ratio)
        - 0.08 * term_penalty
        - 0.05 * dependents_penalty
    )
    return round(float(max(0, min(raw_score, 1))), 4)


@app.on_event("startup")
def startup_event() -> None:
    global model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model = load_model()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/api/health")
def api_health() -> dict:
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(features: CreditFeatures) -> PredictionResponse:
    if model is not None:
        values = build_feature_vector(features)
        probability = float(model.predict_proba(values)[0][1])
    else:
        probability = fallback_score(features)

    score = round(probability, 4)
    risk_level = "low" if score >= 0.7 else "medium" if score >= 0.45 else "high"
    result = "approved" if score >= 0.6 else "rejected"
    recommended_amount = round(features.monthly_income * 8 * max(score, 0.35), 2)

    return PredictionResponse(
        probability=score,
        result=result,
        score=score,
        riskLevel=risk_level,
        recommendedAmount=recommended_amount,
    )
