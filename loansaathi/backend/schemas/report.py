"""
Pydantic schemas for AI Financial Advisor structured report outputs.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class RecommendationItem(BaseModel):
    title: str = Field(..., description="Actionable headline recommendation")
    reason: str = Field(..., description="Financial underwriting justification")
    action: str = Field(..., description="Concrete step for the borrower")
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    timeframe: Literal["30 days", "60 days", "90 days", "immediate"] = "30 days"
    supporting_evidence: List[str] = Field(default_factory=list)


class AIAdvisorReportResponse(BaseModel):
    summary: str
    financial_strengths: List[str]
    risk_indicators: List[str]
    missing_information: List[str]
    recommendations: List[RecommendationItem]
    limitations: List[str]
    disclaimer: str = "Informational assessment only. Not a lender decision."

