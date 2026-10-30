"""
Pydantic schemas for Machine Learning predictions.
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    monthly_income: float = Field(..., gt=0, description="Monthly net verified income in currency units")
    annual_income: Optional[float] = Field(None, description="Annual gross income (auto-computed as 12x monthly if omitted)")
    debt_to_income_ratio: float = Field(..., ge=0.0, le=1.0, description="Current DTI ratio (0.0 to 1.0)")
    credit_score: int = Field(..., ge=300, le=900, description="Credit Bureau Score (300-900)")
    loan_amount: float = Field(..., gt=0, description="Target loan principal requested")
    loan_term: int = Field(..., ge=12, le=360, description="Loan term in months (e.g. 36 or 60)")
    installment: Optional[float] = Field(None, description="Expected monthly installment payment")
    employment_status: Literal["Employed", "Self-employed", "Student", "Retired", "Unemployed"] = Field(
        "Employed", description="Current employment status"
    )
    loan_purpose: Literal["Debt consolidation", "Business", "Education", "Home", "Car", "Medical", "Other", "Vacation"] = Field(
        "Debt consolidation", description="Primary loan purpose"
    )
    num_of_open_accounts: int = Field(5, ge=0, le=50, description="Number of currently active credit accounts")
    total_credit_limit: float = Field(40000.0, ge=0, description="Total aggregated credit limit across lines")
    current_balance: float = Field(15000.0, ge=0, description="Total current outstanding debt balance")
    delinquency_history: int = Field(0, ge=0, le=50, description="Historical delinquency events on file")
    num_of_delinquencies: int = Field(0, ge=0, le=50, description="Recent 2-year delinquency count")
    public_records: int = Field(0, ge=0, le=20, description="Public derogatory legal or bankruptcy records")


class InfluentialFactor(BaseModel):
    feature: str
    impact_direction: Literal["positive_for_repayment", "negative_for_repayment", "neutral"]
    description: str


class PredictionResponse(BaseModel):
    predicted_outcome: Literal["likely_repaid", "elevated_default_risk"]
    predicted_class: int = Field(..., description="1 = Repaid, 0 = Default risk")
    repayment_probability_pct: float = Field(..., description="Model estimated repayment probability (0-100%)")
    default_risk_probability_pct: float = Field(..., description="Model estimated default risk probability (0-100%)")
    risk_tier: Literal["Low Risk", "Moderate Risk", "High Risk"]
    confidence_level: float = Field(..., description="Statistical confidence estimate (0-100%)")
    model_name: str
    model_version: str
    influential_factors: List[InfluentialFactor]
    limitations_disclaimer: str

