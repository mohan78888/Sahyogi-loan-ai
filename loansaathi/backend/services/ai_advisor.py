"""
AI Financial Advisor Service for Sahyogi Loan AI.
Generates structured 30/60/90-day action plans, report-aware chat responses,
and provides robust fallback guardrails against hallucinations.
"""
import os
import httpx
from typing import Dict, Any, Optional, List
from schemas.report import AIAdvisorReportResponse, RecommendationItem
from schemas.chat import ChatMessageResponse
from core.config import settings

def call_gemini_api(query: str, context: Optional[Dict[str, Any]] = None) -> Optional[str]:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        ctx_summary = ""
        if context:
            ctx_summary = (
                f"Borrower Financial Profile: Monthly Income: ₹{context.get('income') or context.get('monthly_income', 'N/A')}, "
                f"Existing EMI: ₹{context.get('existingEmi') or context.get('existing_emis', 'N/A')}, "
                f"Calculated FOIR: {context.get('foir_pct') or context.get('emi_to_income_pct', 'N/A')}%, "
                f"Monthly Surplus: ₹{context.get('monthly_surplus', 'N/A')}."
            )
        system_prompt = (
            "You are Sahyogi Loan AI, an expert Indian banking underwriting diagnostic and financial advisor. "
            "Help the user understand why loans get rejected, how to improve FOIR/DTI ratio, and recommend Indian government schemes "
            "(e.g., PM Mudra PMMY, Jan Samarth, PMAY) or tenure extension hacks. "
            "Reply in natural, encouraging Hinglish (Hindi + English). "
            "Keep the reply concise (under 75 words) so it can be easily read aloud by Text-to-Speech."
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\n{ctx_summary}\n\nUser Question: {query}"}
                    ]
                }
            ]
        }
        res = httpx.post(url, json=payload, timeout=5.0)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception as e:
        print(f"Gemini API request skipped/failed: {e}")
    return None

class AIAdvisorService:

    @staticmethod
    def generate_report(metrics: Dict[str, Any]) -> AIAdvisorReportResponse:
        """Generates structured report adhering to the master schema."""
        income = float(metrics.get("monthly_net_income", 50000))
        expenses = float(metrics.get("monthly_living_expenses", 20000))
        foir = float(metrics.get("projected_foir_pct", 25.0))
        surplus = float(metrics.get("projected_monthly_surplus", 20000))
        health_score = int(metrics.get("financial_health_score", 75))

        strengths = []
        risks = []
        missing = []
        recommendations = []

        if foir <= 35.0:
            strengths.append(f"Conservative Debt-Servicing Ratio: Projected FOIR is {foir:.1f}%, well within standard 40% threshold.")
        elif foir <= 50.0:
            strengths.append(f"Moderate Debt Obligation: FOIR of {foir:.1f}% is acceptable across public and private sector banks.")
        else:
            risks.append(f"High Debt-to-Income Exposure: Projected FOIR of {foir:.1f}% exceeds standard retail banking caps (45-50%).")

        if surplus >= 0.25 * income:
            strengths.append(f"Resilient Monthly Buffer: Post-EMI surplus of ₹{surplus:,.0f} provides strong emergency liquidity.")
        elif surplus > 0:
            risks.append(f"Narrow Cashflow Margin: Surplus of ₹{surplus:,.0f} leaves vulnerable shock absorption.")
        else:
            risks.append(f"Deficit Cashflow: Proposed obligations create a negative monthly cashflow of ₹{abs(surplus):,.0f}.")

        # Recommendations
        if foir > 45.0:
            recommendations.append(RecommendationItem(
                title="Restructure or Consolidate High-Interest Short Term Debt",
                reason=f"Current obligations absorb {foir:.1f}% of income, which triggers automated underwriting rejections.",
                action="Close personal loans or credit card balances with highest APR before submitting new loan files.",
                priority="high",
                timeframe="30 days",
                supporting_evidence=[f"Current FOIR: {foir:.1f}%", "Standard Banking Cap: 45.0%"]
            ))
            recommendations.append(RecommendationItem(
                title="Opt for Extended Tenure to Amortize Monthly Installments",
                reason="Lengthening tenure lowers the monthly installment burden, immediately reducing FOIR.",
                action="Request a 60 or 84 month repayment schedule rather than 36 months.",
                priority="medium",
                timeframe="60 days",
                supporting_evidence=["Lowers required monthly EMI commitment"]
            ))
        else:
            recommendations.append(RecommendationItem(
                title="Assemble Banking Inflow Documentation",
                reason="Lenders require 6 consecutive months of steady salary/revenue credits matching tax returns.",
                action="Download official PDF bank statements with stamp/digital signature from your netbanking portal.",
                priority="medium",
                timeframe="30 days",
                supporting_evidence=["6-month banking statements are mandatory for formal underwriting"]
            ))

        recommendations.append(RecommendationItem(
            title="Maintain Clean Repayment Vintage & Low Hard Enquiries",
            reason="Multiple loan applications within 90 days trigger hard inquiries that depress credit scores.",
            action="Avoid submitting parallel loan applications across multiple aggregators.",
            priority="low",
            timeframe="90 days",
            supporting_evidence=["Bureau enquiries >3 in 90 days flags credit hunger"]
        ))

        summary = (
            f"Financial Profile Analysis reveals a Financial Health Score of {health_score}/100. "
            f"Projected FOIR stands at {foir:.1f}% with a monthly post-obligation surplus of ₹{surplus:,.0f}. "
            f"{'Debt capacity is favorable for planned borrowings.' if foir <= 45 else 'Action is advised to trim existing debts before fresh credit submission.'}"
        )

        return AIAdvisorReportResponse(
            summary=summary,
            financial_strengths=strengths,
            risk_indicators=risks,
            missing_information=missing,
            recommendations=recommendations,
            limitations=[
                "Calculations rely on user-reported and OCR-extracted figures.",
                "Actual lender interest rates and margins vary by credit tier and institutional underwriting policy."
            ],
            disclaimer="Informational assessment only. Not a lender approval or credit bureau decision."
        )

    @staticmethod
    def handle_chat(query: str, context: Optional[Dict[str, Any]] = None) -> ChatMessageResponse:
        q = query.lower().strip()
        ctx = context or {}

        # 1. Try Gemini 1.5 Flash first if configured
        gemini_reply = call_gemini_api(query, ctx)
        if gemini_reply:
            return ChatMessageResponse(
                reply=gemini_reply,
                suggested_followups=[
                    "Kaunsi government scheme se loan mil sakta hai?",
                    "Mera safe EMI burden kitna hona chahiye?",
                    "Tenure badhane se EMI kitni kam hogi?"
                ],
                disclaimer="Informational guidance powered by Gemini & Sahyogi Underwriting Rules."
            )

        # Safely extract or compute foir and surplus from any context provided
        income = float(ctx.get("monthly_income") or ctx.get("income") or ctx.get("monthly_net_income") or 60000)
        expenses = float(ctx.get("monthly_expenses") or ctx.get("expenses") or ctx.get("monthly_living_expenses") or 25000)
        existing_emis = float(ctx.get("existing_emis") or ctx.get("existingEmi") or ctx.get("existing_emi") or 16500)

        foir_val = ctx.get("projected_foir_pct") or ctx.get("emi_to_income_pct")
        if foir_val is not None:
            foir = float(foir_val)
        else:
            foir = round((existing_emis / income) * 100, 1) if income > 0 else 25.0

        surplus_val = ctx.get("projected_monthly_surplus") or ctx.get("monthly_surplus")
        if surplus_val is not None:
            surplus = float(surplus_val)
        else:
            surplus = round(income - expenses - existing_emis)

        if "foir" in q or "dti" in q or "debt" in q:
            reply = (
                f"**Fixed Obligation to Income Ratio (FOIR)** measures the fraction of your monthly net income committed to loan repayments.\n\n"
                f"• **Safe:** <40% (preferred by all banks)\n"
                f"• **Moderate:** 40% – 50% (requires strong credit score)\n"
                f"• **High Risk:** >50% (leads to rejection or higher interest)\n\n"
                f"Based on your profile, your projected FOIR is **{foir}%**, leaving a monthly surplus of **₹{surplus:,.0f}**."
            )
            followups = ["How can I reduce my FOIR?", "Does FOIR include credit card bills?", "What is ideal surplus?"]

        elif "cibil" in q or "credit score" in q:
            reply = (
                "**Improving Credit Score for Loan Readiness:**\n\n"
                "1. **Never Miss a Due Date:** Payment history accounts for ~35% of your score.\n"
                "2. **Credit Utilization < 30%:** Keep your credit card spending well below the total limit.\n"
                "3. **Avoid Multiple Applications:** Applying to 5 banks simultaneously hurts your score with hard enquiries.\n"
                "4. **Maintain Vintage:** Keep your oldest credit account active to preserve credit history length."
            )
            followups = ["How often does CIBIL update?", "Does Sahyogi Loan AI check affect CIBIL?", "What score is required?"]

        elif "reject" in q or "why" in q or "refused" in q:
            reply = (
                "**Top Reasons Why Loan Applications Face Difficulty:**\n\n"
                "1. **High FOIR (>50%):** Existing EMIs already consume too much monthly earnings.\n"
                "2. **Irregular Bank Inflows:** Salary or business revenue not consistently routed through bank accounts.\n"
                "3. **Recent Delinquencies:** Missed EMIs or late card payments within the last 12-24 months.\n"
                "4. **Incomplete Documentation:** Missing salary slips, Form 16, or unverified employer credentials."
            )
            followups = ["Analyze my rejection risk", "How to add a co-applicant?", "Can I apply after 6 months?"]

        else:
            reply = (
                f"Namaste! As your **Sahyogi Loan AI Financial Advisor**, I help you understand debt capacity, "
                f"amortization stress testing, and documentation readiness.\n\n"
                f"Based on your current numbers, your projected debt-servicing ratio is **{foir}%** with a disposable surplus of **₹{surplus:,.0f}**.\n"
                f"How can I assist you with your loan readiness today?"
            )
            followups = ["Why is my FOIR important?", "How can I improve my loan eligibility?", "Check my surplus buffer"]

        return ChatMessageResponse(
            reply=reply,
            suggested_followups=followups,
            disclaimer="Informational guidance only. Not financial or credit counseling advice."
        )

ai_advisor_service = AIAdvisorService()

