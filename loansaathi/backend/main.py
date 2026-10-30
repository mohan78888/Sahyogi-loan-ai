"""FastAPI app for Sahyogi Loan AI."""
from __future__ import annotations

import os
import sys
from typing import Literal

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Core & Service imports
from core.config import settings
from engine import loan_cost, stress_test
from passport import build_passport
from data import SCHEMES, RED_FLAGS
from ml_engine import predict_approval, recommend_schemes, optimize_tenure, break_even_income
from rejection_analyzer import analyze_rejection, handle_ai_chat
from document_processor import (
    extract_text_from_pdf,
    parse_financial_document,
    compute_comprehensive_report,
    simulate_what_if_scenario,
)

# New Modular Route Handlers
from api.routes.health import router as health_router
from api.routes.dataset import router as dataset_router
from api.routes.prediction import router as prediction_router
from api.routes.financial import router as financial_router
from api.routes.documents import router as documents_router
from api.routes.chat import router as chat_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Underwriting Diagnostic, ML Repayment-Risk Prediction & AI Financial Advisory Engine."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"=== 422 VALIDATION ERROR on {request.url.path} ===")
    print(f"Errors: {exc.errors()}")
    print(f"Body: {body.decode('utf-8', errors='ignore')}")
    print("===============================================")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


# ─────────────────────────────────────────────────────────────────────
# MOUNT NEW MODULAR ROUTERS
# ─────────────────────────────────────────────────────────────────────
app.include_router(health_router, prefix="/api")
app.include_router(dataset_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(financial_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


# ─────────────────────────────────────────────────────────────────────
# QUESTIONNAIRE & PASSPORT ENDPOINTS
# ─────────────────────────────────────────────────────────────────────
class EmiRequest(BaseModel):
    principal: float = Field(gt=0, le=1_000_000_000)
    annual_rate_pct: float = Field(ge=0, le=60)
    tenure_months: int = Field(gt=0, le=480)
    processing_fee_pct: float | None = Field(default=None, ge=0, le=20)
    moratorium_months: int = Field(default=0, ge=0, le=96)


class StressRequest(BaseModel):
    new_emi: float = Field(ge=0)
    monthly_income: float = Field(ge=0)
    monthly_expenses: float = Field(ge=0)
    existing_emis: float = Field(default=0, ge=0)
    income_drop_pcts: list[float] = Field(default=[0, 20, 40])


class PassportRequest(BaseModel):
    category: Literal["student", "farmer", "business", "personal"]
    goal: str = Field(default="", max_length=300)
    amount: float = Field(gt=0, le=1_000_000_000)
    tenure_months: int = Field(gt=0, le=480)
    annual_rate_pct: float | None = Field(default=None, ge=0, le=60)
    processing_fee_pct: float | None = Field(default=None, ge=0, le=20)
    moratorium_months: int = Field(default=0, ge=0, le=96)
    monthly_income: float | None = Field(default=None, ge=0)
    monthly_expenses: float = Field(default=0, ge=0)
    existing_emis: float = Field(default=0, ge=0)
    documents_ready: list[str] = []
    seasonal_income: dict[str, float] | None = None
    crop_income_drop_pct: float = Field(default=30, ge=0, le=100)


@app.post("/api/emi")
def api_emi(req: EmiRequest):
    return loan_cost(**req.model_dump())


@app.post("/api/stress")
def api_stress(req: StressRequest):
    d = req.model_dump()
    return {"scenarios": stress_test(**d)}


@app.post("/api/passport")
def api_passport(req: PassportRequest):
    return build_passport(req.model_dump())


@app.get("/api/schemes")
def api_schemes(category: str | None = None):
    items = [s for s in SCHEMES if category is None or s["category"] == category]
    return {"schemes": items, "note": "Sample data. Verify on the official source."}


@app.get("/api/red-flags")
def api_red_flags():
    return {"red_flags": RED_FLAGS}


# ─────────────────────────────────────────────────────────────────────
# RULE-BASED ML ENDPOINTS (LEGACY)
# ─────────────────────────────────────────────────────────────────────
class ApprovalRequest(BaseModel):
    category: Literal["student", "farmer", "business", "personal"]
    monthly_income: float = Field(gt=0)
    amount: float = Field(gt=0, le=1_000_000_000)
    tenure_months: int = Field(gt=0, le=480)
    annual_rate_pct: float = Field(ge=0, le=60)
    existing_emis: float = Field(default=0, ge=0)


class SchemeRecommendRequest(BaseModel):
    category: Literal["student", "farmer", "business", "personal"]
    amount: float = Field(gt=0, le=1_000_000_000)
    monthly_income: float | None = Field(default=None, ge=0)
    existing_emis: float = Field(default=0, ge=0)


class OptimizeTenureRequest(BaseModel):
    principal: float = Field(gt=0, le=1_000_000_000)
    annual_rate_pct: float = Field(ge=0, le=60)
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(default=0, ge=0)
    existing_emis: float = Field(default=0, ge=0)


class BreakEvenRequest(BaseModel):
    new_emi: float = Field(gt=0)
    monthly_expenses: float = Field(default=0, ge=0)
    existing_emis: float = Field(default=0, ge=0)
    buffer_pct: float = Field(default=10, ge=0, le=100)


@app.post("/api/ml/approval")
def api_approval(req: ApprovalRequest):
    return predict_approval(**req.model_dump())


@app.post("/api/ml/recommend-schemes")
def api_recommend_schemes(req: SchemeRecommendRequest):
    return {"schemes": recommend_schemes(**req.model_dump())}


@app.post("/api/ml/optimize-tenure")
def api_optimize_tenure(req: OptimizeTenureRequest):
    return optimize_tenure(**req.model_dump())


@app.post("/api/ml/break-even")
def api_break_even(req: BreakEvenRequest):
    return break_even_income(**req.model_dump())
