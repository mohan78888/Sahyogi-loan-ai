"""
Pydantic schemas for deterministic financial calculations and scenario simulations.
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class FinancialAnalysisRequest(BaseModel):
    monthly_income: float = Field(..., ge=0, description="Monthly net in-hand income")
    monthly_expenses: float = Field(..., ge=0, description="Monthly non-debt living expenses")
    existing_emis: float = Field(0.0, ge=0, description="Sum of active recurring monthly loan EMIs")
    proposed_additional_emi: float = Field(0.0, ge=0, description="Estimated monthly EMI of newly requested loan")
    target_loan_amount: Optional[float] = Field(None, ge=0)
    tenure_months: Optional[int] = Field(None, ge=1)
    interest_rate_pct: Optional[float] = Field(10.5, ge=0)


class FinancialAnalysisResponse(BaseModel):
    monthly_net_income: float
    monthly_living_expenses: float
    existing_emis: float
    proposed_additional_emi: float
    current_foir_pct: float = Field(..., description="Current EMI-to-income ratio (FOIR)")
    projected_foir_pct: float = Field(..., description="Projected total debt obligation ratio")
    current_monthly_surplus: float = Field(..., description="Disposable cashflow before new loan")
    projected_monthly_surplus: float = Field(..., description="Disposable cashflow after proposed new EMI")
    financial_health_score: int = Field(..., ge=0, le=100)
    health_status: Literal["Healthy", "Moderate Risk", "High Debt Burden"]
    health_badge: Literal["success", "warning", "danger"]
    cash_flow_assessment: str
    document_completeness_pct: float
    observations: List[str]
    missing_information: List[str]
    disclaimer: str


class ScenarioSimulateRequest(BaseModel):
    base_income: float = Field(..., ge=0)
    base_expenses: float = Field(..., ge=0)
    base_emis: float = Field(..., ge=0)
    new_income: float = Field(..., ge=0)
    new_expenses: float = Field(..., ge=0)
    new_emis: float = Field(..., ge=0)
    additional_emi: float = Field(0.0, ge=0)


class ScenarioSimulateResponse(BaseModel):
    baseline: Dict[str, float]
    modified: Dict[str, float]
    diff: Dict[str, float]
    verdict: str
    risk_direction: Literal["improving", "deteriorating", "neutral"]
    recommendation: str

