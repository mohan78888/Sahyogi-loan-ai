"""
Financial analysis and scenario simulation routes.
"""
from fastapi import APIRouter
from schemas.financial import (
    FinancialAnalysisRequest,
    FinancialAnalysisResponse,
    ScenarioSimulateRequest,
    ScenarioSimulateResponse,
)
from services.financial_calculator import financial_calculator
from document_processor import compute_comprehensive_report, simulate_what_if_scenario

router = APIRouter(tags=["financial-analysis"])

@router.post("/financial/analyze", response_model=FinancialAnalysisResponse)
def analyze_financial_profile(req: FinancialAnalysisRequest):
    """Calculates deterministic debt-to-income (FOIR) ratios and disposable surpluses."""
    return financial_calculator.compute_analysis(req)

@router.post("/financial/simulate", response_model=ScenarioSimulateResponse)
def simulate_financial_scenario(req: ScenarioSimulateRequest):
    """What-if stress tester for income drops and new debt additions."""
    return financial_calculator.simulate_scenario(req)

# Backward-compatibility aliases for existing React dashboard and Expo mobile app
@router.post("/analysis/comprehensive")
def analyze_comprehensive_legacy(data: dict):
    inc = float(data.get("monthly_income", 50000))
    exp = float(data.get("monthly_expenses", 20000))
    emis = float(data.get("existing_emis", 0))
    loan_amt = float(data.get("target_loan_amount", 500000))
    tenure = int(data.get("tenure_months", 60))
    return compute_comprehensive_report(inc, exp, emis, loan_amt, tenure)

@router.post("/scenarios/simulate")
def simulate_scenario_legacy(data: dict):
    return simulate_what_if_scenario(
        base_income=float(data.get("base_income", 50000)),
        base_expenses=float(data.get("base_expenses", 20000)),
        base_emis=float(data.get("base_emis", 10000)),
        new_income=float(data.get("new_income", 50000)),
        new_expenses=float(data.get("new_expenses", 20000)),
        new_emis=float(data.get("new_emis", 10000)),
        additional_emi=float(data.get("additional_emi", 12000)),
    )

