"""AI-driven loan rejection analysis and advisory module for Sahyogi Loan AI."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
from engine import emi


def analyze_rejection(
    loan_type: str,
    loan_amount: float,
    monthly_income: float,
    employment_type: str,
    existing_emis: float = 0.0,
    credit_score: Optional[int] = None,
    rejection_reason: Optional[str] = None,
    lender_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Analyze borrower profile and rejection details to diagnose rejection factors."""
    monthly_income = max(monthly_income, 1.0)
    annual_income = monthly_income * 12.0
    lti_multiplier = round(loan_amount / annual_income, 2)

    # Estimate expected interest rate and tenure based on loan type for baseline EMI
    rates = {
        "personal": (13.5, 48),
        "business": (15.0, 36),
        "student": (9.5, 84),
        "farmer": (8.5, 60),
        "home": (8.75, 240),
    }
    def_rate, def_tenure = rates.get(loan_type.lower(), (13.5, 48))
    estimated_new_emi = emi(loan_amount, def_rate, def_tenure)

    # FOIR (Fixed Obligation to Income Ratio) calculation
    total_obligations = existing_emis + estimated_new_emi
    foir_pct = round((total_obligations / monthly_income) * 100, 1)
    existing_foir_pct = round((existing_emis / monthly_income) * 100, 1)

    factors: List[Dict[str, Any]] = []
    risk_score = 0  # 0 to 100 scale

    # 1. FOIR / Debt-to-Income Factor
    if foir_pct > 60:
        risk_score += 40
        factors.append({
            "name": "Excessive Debt Burden (High FOIR)",
            "status": "critical",
            "metric": f"{foir_pct}% FOIR",
            "explanation": (
                f"Your total monthly EMI obligations ({existing_emis + estimated_new_emi:,.0f} INR) "
                f"would consume {foir_pct}% of your monthly income. Indian banks mandate an FOIR cap under 50%."
            ),
            "suggestion": "Close small active loans or request a longer tenure to reduce the monthly EMI burden.",
        })
    elif foir_pct > 45:
        risk_score += 20
        factors.append({
            "name": "Elevated Debt Burden (Moderate FOIR)",
            "status": "warning",
            "metric": f"{foir_pct}% FOIR",
            "explanation": (
                f"Your projected monthly obligations take up {foir_pct}% of income. "
                "Conservative lenders often prefer FOIR to stay below 40%."
            ),
            "suggestion": "Consider a co-applicant or clearing existing credit card outstanding balances.",
        })
    else:
        factors.append({
            "name": "Monthly Debt Obligation (FOIR)",
            "status": "favorable",
            "metric": f"{foir_pct}% FOIR",
            "explanation": "Your projected EMI-to-income ratio is within standard acceptable banking limits (under 45%).",
            "suggestion": "Keep this ratio low by not taking any new short-term credit lines.",
        })

    # 2. Credit Score Factor
    if credit_score is not None and credit_score > 0:
        if credit_score < 650:
            risk_score += 45
            factors.append({
                "name": "Credit Score Below Lending Cut-off",
                "status": "critical",
                "metric": f"{credit_score} CIBIL/Experian",
                "explanation": (
                    f"A score of {credit_score} is below the threshold (typically 700-750+) required by "
                    "most tier-1 commercial banks, often triggering automated rejection."
                ),
                "suggestion": "Pull your free official CIBIL report to dispute errors and ensure 0 missed payments for 6 consecutive months.",
            })
        elif credit_score < 720:
            risk_score += 25
            factors.append({
                "name": "Moderate Credit Score",
                "status": "warning",
                "metric": f"{credit_score} CIBIL/Experian",
                "explanation": (
                    f"A score of {credit_score} qualifies for some NBFCs, but major PSU banks prefer 750+ "
                    "for competitive interest rates and frictionless approval."
                ),
                "suggestion": "Keep credit card utilization strictly under 30% to give your score a 20-40 point boost.",
            })
        else:
            factors.append({
                "name": "Strong Credit Track Record",
                "status": "favorable",
                "metric": f"{credit_score} CIBIL",
                "explanation": "Your credit score is solid and generally meets bank eligibility criteria.",
                "suggestion": "Rejection is likely tied to debt obligations, document mismatch, or internal policy rather than credit history.",
            })
    else:
        risk_score += 15
        factors.append({
            "name": "No / Unreported Credit History (NTC)",
            "status": "warning",
            "metric": "New to Credit",
            "explanation": "Without an established credit history, automated underwriting engines cannot verify past repayment discipline.",
            "suggestion": "Apply with a credit-worthy co-applicant or start with a secured credit card against a fixed deposit.",
        })

    # 3. Loan-to-Income / Ticket Size Factor
    if loan_type == "personal" and lti_multiplier > 12:
        risk_score += 20
        factors.append({
            "name": "High Loan Request vs Annual Income",
            "status": "warning",
            "metric": f"{lti_multiplier}x Annual Income",
            "explanation": (
                f"Requested loan of ₹{loan_amount:,.0f} is {lti_multiplier} times your annual income (₹{annual_income:,.0f}). "
                "Unsecured personal loans are normally capped at 8-10x annual income."
            ),
            "suggestion": "Apply for a lower principal amount (e.g., ₹{monthly_income * 8:,.0f}) or provide collateral.",
        })

    # 4. Keyword parsing of lender rejection reason (if provided)
    rejection_notes: List[str] = []
    if rejection_reason and len(rejection_reason.strip()) > 3:
        reason_lower = rejection_reason.lower()
        if any(w in reason_lower for w in ["cibil", "credit", "bureau", "dpd", "score", "overdue"]):
            rejection_notes.append("Lender explicitly flagged credit score or bureau repayment history.")
        if any(w in reason_lower for w in ["foir", "obligation", "capacity", "existing emi", "burden"]):
            rejection_notes.append("Lender explicitly indicated excessive existing debt obligations.")
        if any(w in reason_lower for w in ["income", "salary", "banking", "average balance", "statement"]):
            rejection_notes.append("Lender noted insufficient net disposable income or irregular bank deposits.")
        if any(w in reason_lower for w in ["pincode", "area", "geo", "unserviceable", "negative list"]):
            rejection_notes.append("Lender rejected due to unserviceable residence or employment pin code policy.")
        if any(w in reason_lower for w in ["vintage", "stability", "experience", "business continuity"]):
            rejection_notes.append("Lender criteria required longer business vintage or employment tenure.")

    # Determine overall risk category
    if risk_score >= 60:
        risk_level = "high"
        confidence_text = "Multiple critical risk factors identified that align with standard bank rejection patterns."
    elif risk_score >= 30:
        risk_level = "medium"
        confidence_text = "Borderline factors detected that likely led the lender's risk department to decline."
    else:
        risk_level = "low"
        confidence_text = "Financial ratios look adequate; rejection may stem from lender internal criteria or documentation issues."

    # Actionable Recommendations
    recommendations = [
        {
            "step": 1,
            "title": "Check Free Credit Bureau Report",
            "timeframe": "1-2 days",
            "priority": "High",
            "description": "Download your official CIBIL/Experian report. Verify all personal details, check for inaccurate 'overdue' or 'write-off' tags, and dispute any errors.",
        },
        {
            "step": 2,
            "title": "Lower Current FOIR to Under 40%",
            "timeframe": "1-3 months",
            "priority": "High" if foir_pct > 50 else "Medium",
            "description": "Pre-pay small consumer loans, buy-now-pay-later (BNPL) accounts, or credit card balances to immediately reduce monthly obligations.",
        },
        {
            "step": 3,
            "title": "Add a Co-Borrower with Stable Income",
            "timeframe": "Immediate",
            "priority": "Medium",
            "description": "Adding an earning family member (spouse or parent) combines household income and significantly boosts eligibility.",
        },
        {
            "step": 4,
            "title": "Pause Fresh Loan Applications for 90 Days",
            "timeframe": "90 days",
            "priority": "High",
            "description": "Multiple hard inquiries in short succession hurt your credit score by signaling credit hunger to lenders.",
        },
    ]

    # Verification checklist
    checklist = [
        {"item": "Last 6 Months Bank Statement with consistent salary / cash flow", "category": "Banking", "mandatory": True},
        {"item": "Form 16 or 2 Years ITR with Computation of Income", "category": "Income Proof", "mandatory": True},
        {"item": "PAN Card and Aadhaar with matching name and DOB", "category": "KYC", "mandatory": True},
        {"item": "No active payment delays or cheque bounce entries in past 6 months", "category": "Repayment Track", "mandatory": True},
        {"item": "Current address electricity or utility bill under 2 months old", "category": "Address Proof", "mandatory": False},
    ]

    summary = (
        f"Based on your profile (Monthly Income: ₹{monthly_income:,.0f}, Requested: ₹{loan_amount:,.0f}), "
        f"your total obligations represent an estimated FOIR of {foir_pct}%. "
        + (" ".join(rejection_notes) if rejection_notes else "The analysis highlights key factors that lenders evaluate during underwriting.")
    )

    return {
        "summary": summary,
        "risk_level": risk_level,
        "risk_score": min(risk_score, 100),
        "confidence_text": confidence_text,
        "foir_percentage": foir_pct,
        "existing_foir_percentage": existing_foir_pct,
        "estimated_new_emi": round(estimated_new_emi),
        "lti_multiplier": lti_multiplier,
        "factors": factors,
        "lender_stated_notes": rejection_notes,
        "recommendations": recommendations,
        "checklist": checklist,
        "disclaimer": (
            "Sahyogi Loan AI provides independent decision-support analytics based on standard Indian banking guidelines. "
            "We do not represent any lender or credit bureau. Lenders independently determine approval under proprietary underwriting policies."
        ),
    }


def handle_ai_chat(query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generate structured, objective financial guidance for mobile user queries."""
    q = query.lower().strip()
    
    # 1. FOIR / Debt burden queries
    if any(k in q for k in ["foir", "debt", "too many loans", "emi burden", "capacity"]):
        answer = (
            "**FOIR (Fixed Obligation to Income Ratio)** is the percentage of your monthly income that goes towards loan repayments. "
            "Most Indian banks strictly require FOIR to be below **40% to 50%**.\n\n"
            "**How to improve it:**\n"
            "• Prepay high-interest or small consumer loans.\n"
            "• Request a longer loan tenure to decrease the monthly installment.\n"
            "• Add a co-borrower to increase the combined disposable income."
        )
        suggestions = ["How is FOIR calculated?", "Can I add a co-applicant?", "What is a safe loan amount?"]

    # 2. CIBIL / Credit score queries
    elif any(k in q for k in ["cibil", "credit score", "experian", "score low", "improve score", "750"]):
        answer = (
            "A **CIBIL score above 750** is considered ideal for instant loan approvals and the lowest interest rates. "
            "If your score dropped below 700:\n\n"
            "• **Timely Payments:** Never miss an EMI or credit card due date (35% weightage).\n"
            "• **Credit Utilization:** Keep credit card spends under 30% of your total limit.\n"
            "• **Avoid Frequent Inquiries:** Don't apply to multiple banks simultaneously.\n"
            "• **Dispute Errors:** Check your credit report for wrong 'written-off' or 'suit-filed' remarks."
        )
        suggestions = ["How long to improve CIBIL score?", "How to dispute credit bureau errors?", "Does checking score reduce it?"]

    # 3. Why was my loan rejected
    elif any(k in q for k in ["why rejected", "rejection reason", "reapply", "rejected"]):
        answer = (
            "Common reasons for loan rejection in India include:\n"
            "1. **High FOIR (>50%):** Existing loans already take up too much of your monthly income.\n"
            "2. **CIBIL below 700-750:** Past defaults, late payments, or settlements.\n"
            "3. **Employment/Business Stability:** Less than 1-2 years continuous service or unlisted company.\n"
            "4. **KYC or Address Mismatch:** Discrepancy in PAN/Aadhaar details or unserviceable pincode.\n\n"
            "**Next Step:** Wait 90 days before reapplying, correct your credit report, or choose a specialized government scheme."
        )
        suggestions = ["Check my rejection factors", "Which schemes are available?", "How to talk to the branch manager?"]

    # 4. Government schemes
    elif any(k in q for k in ["scheme", "subsidy", "mudra", "pmegp", "kcc", "education loan"]):
        answer = (
            "India offers several government-backed schemes with lower collateral and subsidized interest rates:\n"
            "• **PMMY (Mudra):** Loans up to ₹10 Lakhs for micro-enterprises without collateral.\n"
            "• **Kisan Credit Card (KCC):** Farm credit at an effective subsidized 4% interest rate.\n"
            "• **CSIS Education Subsidy:** 100% interest subsidy during the study period for eligible students.\n"
            "• **Stand-Up India:** ₹10 Lakh to ₹1 Crore for SC/ST and women entrepreneurs."
        )
        suggestions = ["Explore Mudra loan rules", "Check student loan subsidy", "How to apply on JanSamarth?"]

    # 5. Default general response
    else:
        answer = (
            f"Here is what you need to know regarding '{query}':\n\n"
            "Lenders evaluate your application based on four primary pillars:\n"
            "1. **Repayment Capacity (FOIR):** Keeping total EMIs under 45% of net income.\n"
            "2. **Credit Track Record:** Consistent on-time payments and CIBIL score of 720+.\n"
            "3. **Income Proof:** Clear 6 months bank statement showing regular inflows.\n"
            "4. **Stability:** Documented employment or business vintage.\n\n"
            "Use Sahyogi Loan AI's **Rejection Analyzer** to test your specific numbers and get personalized recovery steps."
        )
        suggestions = ["Analyze my loan rejection", "What is FOIR?", "Tips to improve CIBIL score"]

    return {
        "reply": answer,
        "suggested_followups": suggestions,
        "disclaimer": "Informational guidance only. Not financial or credit counseling advice.",
    }
