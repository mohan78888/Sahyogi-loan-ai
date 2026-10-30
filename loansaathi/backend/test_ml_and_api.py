"""
Comprehensive Unit & Integration Test Suite for Sahyogi Loan AI ML & FastAPI Endpoints.
"""
import os
import io
import pytest
from fastapi.testclient import TestClient

from main import app
from core.config import settings
from services.model_service import model_service
from services.financial_calculator import financial_calculator
from services.ai_advisor import ai_advisor_service
from ml.preprocess import DEMOGRAPHIC_FEATURES, CLEAN_NUMERIC_FEATURES, CLEAN_CATEGORICAL_FEATURES

client = TestClient(app)


# =====================================================================
# 1. DATASET & PREPROCESSING TESTS
# =====================================================================

def test_dataset_exists_and_clean():
    assert os.path.exists(settings.DATA_PATH), f"Dataset not found at {settings.DATA_PATH}"
    assert os.path.exists(settings.DATASET_PROFILE_PATH), "Profile json not found"


def test_demographic_fair_lending_exclusion():
    """Verify sensitive demographics are explicitly excluded from the model feature lists."""
    for demo_col in DEMOGRAPHIC_FEATURES:
        assert demo_col not in CLEAN_NUMERIC_FEATURES
        assert demo_col not in CLEAN_CATEGORICAL_FEATURES


# =====================================================================
# 2. MODEL ARTIFACT & INFERENCE TESTS
# =====================================================================

def test_model_loaded_on_startup():
    assert model_service.is_loaded is True
    assert model_service.model is not None


def test_api_health_endpoint():
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["ml_model_loaded"] is True
    assert data["dataset_available"] is True


def test_api_ml_predict_salaried_prime_borrower():
    payload = {
        "monthly_income": 65000.0,
        "debt_to_income_ratio": 0.15,
        "credit_score": 780,
        "loan_amount": 300000.0,
        "loan_term": 36,
        "employment_status": "Employed",
        "loan_purpose": "Home",
        "num_of_open_accounts": 4,
        "total_credit_limit": 60000.0,
        "current_balance": 9000.0,
        "delinquency_history": 0,
        "num_of_delinquencies": 0,
        "public_records": 0,
    }
    r = client.post("/api/ml/predict", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["predicted_class"] == 1
    assert data["predicted_outcome"] == "likely_repaid"
    assert data["repayment_probability_pct"] >= 50.0
    assert data["risk_tier"] in ["Low Risk", "Moderate Risk"]
    assert len(data["influential_factors"]) > 0
    assert "does not constitute guaranteed" in data["limitations_disclaimer"].lower()


def test_api_ml_predict_high_risk_unemployed():
    payload = {
        "monthly_income": 12000.0,
        "debt_to_income_ratio": 0.55,
        "credit_score": 520,
        "loan_amount": 250000.0,
        "loan_term": 60,
        "employment_status": "Unemployed",
        "loan_purpose": "Debt consolidation",
        "num_of_open_accounts": 7,
        "total_credit_limit": 15000.0,
        "current_balance": 14000.0,
        "delinquency_history": 3,
        "num_of_delinquencies": 2,
        "public_records": 1,
    }
    r = client.post("/api/ml/predict", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["default_risk_probability_pct"] > 30.0
    assert any(f["feature"] == "employment_status" for f in data["influential_factors"])


def test_api_ml_predict_validation_errors():
    # Credit score out of bounds
    r = client.post("/api/ml/predict", json={
        "monthly_income": 50000,
        "debt_to_income_ratio": 0.2,
        "credit_score": 150,  # Invalid
        "loan_amount": 100000,
        "loan_term": 36
    })
    assert r.status_code == 422


# =====================================================================
# 3. DETERMINISTIC FINANCIAL CALCULATION TESTS
# =====================================================================

def test_financial_analyze_healthy():
    payload = {
        "monthly_income": 50000.0,
        "monthly_expenses": 18000.0,
        "existing_emis": 8000.0,
        "proposed_additional_emi": 5000.0,
    }
    r = client.post("/api/financial/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["current_foir_pct"] == 16.0
    assert data["projected_foir_pct"] == 26.0
    assert data["current_monthly_surplus"] == 24000.0
    assert data["projected_monthly_surplus"] == 19000.0
    assert data["health_status"] == "Healthy"
    assert data["financial_health_score"] >= 70


def test_financial_analyze_zero_income():
    payload = {
        "monthly_income": 0.0,
        "monthly_expenses": 10000.0,
        "existing_emis": 5000.0,
    }
    r = client.post("/api/financial/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["health_status"] == "High Debt Burden"
    assert data["projected_monthly_surplus"] < 0


def test_scenario_simulation():
    payload = {
        "base_income": 50000.0,
        "base_expenses": 20000.0,
        "base_emis": 10000.0,
        "new_income": 35000.0,  # 30% drop
        "new_expenses": 20000.0,
        "new_emis": 10000.0,
        "additional_emi": 8000.0,
    }
    r = client.post("/api/financial/simulate", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["diff"]["income_diff"] == -15000.0
    assert data["diff"]["surplus_diff"] < 0
    assert data["risk_direction"] == "deteriorating"


# =====================================================================
# 4. DATASET PROFILE & STATISTICS ROUTES
# =====================================================================

def test_dataset_profile_and_insights_routes():
    r_prof = client.get("/api/dataset/profile")
    assert r_prof.status_code == 200
    assert r_prof.json()["total_rows"] == 20000

    r_stats = client.get("/api/dataset/statistics")
    assert r_stats.status_code == 200
    assert "credit_score" in r_stats.json()["summary_statistics"]

    r_ins = client.get("/api/dataset/insights")
    assert r_ins.status_code == 200
    assert "debt_to_income_ratio" in r_ins.json()["correlation_with_target"]


# =====================================================================
# 5. AI ADVISOR & CHAT ASSISTANT TESTS
# =====================================================================

def test_ai_advisor_report_generation():
    metrics = {
        "monthly_net_income": 55000,
        "monthly_living_expenses": 22000,
        "projected_foir_pct": 20.0,
        "projected_monthly_surplus": 22000,
        "financial_health_score": 85,
    }
    r = client.post("/api/ai/analyze", json=metrics)
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert len(data["financial_strengths"]) > 0
    assert len(data["recommendations"]) > 0
    assert any(rec["timeframe"] == "30 days" for rec in data["recommendations"])


def test_ai_chat_advisor():
    r = client.post("/api/ai/chat", json={"query": "What is FOIR and why is it important?"})
    assert r.status_code == 200
    data = r.json()
    assert "foir" in data["reply"].lower()
    assert len(data["suggested_followups"]) > 0


# =====================================================================
# 6. DOCUMENT UPLOAD & PRIVATE STORAGE TESTS
# =====================================================================

def test_document_upload_and_status():
    dummy_text = (
        "CONFIDENTIAL SALARY STATEMENT\n"
        "Employer: Acme Tech Private Limited\n"
        "Net Pay: Rs. 65,000.00\n"
        "Gross Salary: Rs. 75,000.00\n"
        "Loan Deduction: Rs. 6,500.00\n"
    )
    files = {"file": ("salary_oct2026.txt", io.BytesIO(dummy_text.encode("utf-8")), "text/plain")}
    r = client.post("/api/documents/upload", files=files, data={"doc_type": "salary_slip"})
    assert r.status_code == 200
    doc = r.json()
    doc_id = doc["document_id"]
    assert doc["status"] in ["completed", "needs_review"]
    assert doc["extracted_data"]["net_salary"] == 65000.0
    assert doc["extracted_data"]["existing_emis"] == 6500.0

    # Status route
    r_stat = client.get(f"/api/documents/{doc_id}/status")
    assert r_stat.status_code == 200

    # Delete route
    r_del = client.delete(f"/api/documents/{doc_id}")
    assert r_del.status_code == 200
