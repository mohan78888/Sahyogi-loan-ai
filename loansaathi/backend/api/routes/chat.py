"""
AI Advisor report generation and conversational assistant routes.
"""
from fastapi import APIRouter
from schemas.report import AIAdvisorReportResponse
from schemas.chat import ChatMessageRequest, ChatMessageResponse
from services.ai_advisor import ai_advisor_service
from rejection_analyzer import analyze_rejection

router = APIRouter(prefix="/ai", tags=["ai-advisor"])

@router.post("/analyze", response_model=AIAdvisorReportResponse)
def generate_ai_report(metrics: dict):
    """Generates structured 30/60/90-day action plan based on validated underwriting metrics."""
    return ai_advisor_service.generate_report(metrics)

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_advisor(req: ChatMessageRequest):
    """Report-aware financial assistant for debt capacity, CIBIL, and documentation guidance."""
    return ai_advisor_service.handle_chat(req.query, req.context)

@router.post("/rejection-analysis")
def legacy_rejection_analysis(data: dict):
    """Backward-compatible loan rejection diagnostic endpoint."""
    inc = float(data.get("income", 50000))
    emis = float(data.get("existing_emis", 0))
    cibil = int(data.get("cibil_score", 700))
    loan_amt = float(data.get("target_loan", 500000))
    tenure = int(data.get("tenure_months", 60))
    docs = data.get("docs_available", ["salary_slip", "bank_statement"])
    rej_reason = data.get("reported_reason", "")
    return analyze_rejection(inc, emis, cibil, loan_amt, tenure, docs, rej_reason)

