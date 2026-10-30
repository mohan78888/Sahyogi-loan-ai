"""Document processing and financial health analysis engine for Sahyogi Loan AI."""
from __future__ import annotations

import io
import re
from typing import Any, Dict, List, Optional
from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from an uploaded PDF document."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted.append(text)
        return "\n".join(extracted)
    except Exception as e:
        return ""


def parse_financial_document(
    filename: str,
    raw_text: str,
    doc_type_hint: Optional[str] = None
) -> Dict[str, Any]:
    """Parse document text and extract structured financial fields with confidence scores."""
    text_lower = raw_text.lower()
    
    # 1. Detect Document Type
    detected_type = doc_type_hint or "unknown"
    if detected_type == "unknown" or not doc_type_hint:
        if any(k in text_lower for k in ["salary slip", "payslip", "gross earnings", "net pay", "basic salary"]):
            detected_type = "salary_slip"
        elif any(k in text_lower for k in ["bank statement", "account statement", "closing balance", "cr/dr", "withdrawal"]):
            detected_type = "bank_statement"
        elif any(k in text_lower for k in ["form 16", "part b", "certificate under section 203"]):
            detected_type = "form_16"
        elif any(k in text_lower for k in ["loan account", "sanction letter", "emi schedule", "outstanding principal"]):
            detected_type = "loan_statement"
        else:
            detected_type = "general_financial_doc"

    # 2. Extract Monthly Income / Net Salary
    extracted_income: Optional[float] = None
    confidence_income = 0.0

    # Common Indian salary patterns
    net_pay_match = re.search(r"(?:net\s*pay|net\s*salary|take\s*home|in[\s-]*hand)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)", text_lower)
    if net_pay_match:
        val_str = net_pay_match.group(1).replace(",", "")
        try:
            val = float(val_str)
            if 5000 <= val <= 5000000:
                extracted_income = val
                confidence_income = 0.92
        except ValueError:
            pass

    if not extracted_income:
        gross_match = re.search(r"(?:gross\s*pay|gross\s*salary|total\s*earnings)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)", text_lower)
        if gross_match:
            try:
                extracted_income = float(gross_match.group(1).replace(",", "")) * 0.88  # approximate net
                confidence_income = 0.75
            except ValueError:
                pass

    # 3. Extract Existing EMIs / Debits
    extracted_emis = 0.0
    confidence_emis = 0.5
    emi_matches = re.findall(r"(?:emi|loan\s*installment|ecs\s*debit|nach)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)", text_lower)
    if emi_matches:
        for m in emi_matches[:3]:
            try:
                v = float(m.replace(",", ""))
                if 500 <= v <= 200000:
                    extracted_emis += v
                    confidence_emis = 0.85
            except ValueError:
                pass

    # 4. Extract Employer or Bank Name
    employer_match = re.search(r"(?:employer|company|organisation)\s*[:=-]?\s*([A-Za-z0-9\s.,&-]{3,40})", raw_text, re.IGNORECASE)
    employer_name = employer_match.group(1).strip() if employer_match else None

    return {
        "filename": filename,
        "document_type": detected_type,
        "raw_text_length": len(raw_text),
        "extracted_income": extracted_income,
        "confidence_income": confidence_income,
        "extracted_emis": extracted_emis,
        "confidence_emis": confidence_emis,
        "employer_name": employer_name,
        "status": "extracted" if extracted_income else "needs_review",
    }


def compute_comprehensive_report(
    monthly_income: float,
    monthly_expenses: float,
    existing_emis: float,
    target_loan_amount: float = 500000.0,
    tenure_months: int = 60,
    annual_rate_pct: float = 10.5,
    documents_provided: Optional[List[str]] = None,
    credit_score_hint: Optional[int] = None,
) -> Dict[str, Any]:
    """Compute complete financial readiness report with deterministic formulas and educational insights."""
    monthly_income = max(monthly_income, 1.0)
    monthly_expenses = max(monthly_expenses, 0.0)
    existing_emis = max(existing_emis, 0.0)
    
    # Calculate Proposed Loan EMI using reducing balance
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    if monthly_rate > 0:
        factor = (1.0 + monthly_rate) ** tenure_months
        proposed_emi = round(target_loan_amount * (monthly_rate * factor) / (factor - 1.0))
    else:
        proposed_emi = round(target_loan_amount / tenure_months)

    total_debt_obligations = existing_emis + proposed_emi
    
    # Key Financial Metrics
    current_foir_pct = round((existing_emis / monthly_income) * 100.0, 1)
    projected_foir_pct = round((total_debt_obligations / monthly_income) * 100.0, 1)
    monthly_surplus = round(monthly_income - monthly_expenses - existing_emis)
    projected_surplus = round(monthly_surplus - proposed_emi)

    # Document Completeness Calculation
    docs = documents_provided or []
    required_doc_types = ["salary_slip", "bank_statement", "identity_kyc"]
    verified_count = sum(1 for req in required_doc_types if any(req in d.lower() for d in docs))
    doc_completeness_pct = min(100, round((verified_count / len(required_doc_types)) * 100))

    # Determine Financial Health Indicator
    if projected_foir_pct <= 40 and projected_surplus > (monthly_income * 0.2):
        health_status = "Optimal Readiness"
        health_badge = "success"
        health_score = 88
    elif projected_foir_pct <= 50 and projected_surplus >= 0:
        health_status = "Moderate / Cautious"
        health_badge = "warning"
        health_score = 65
    else:
        health_status = "Over-leveraged Risk"
        health_badge = "critical"
        health_score = 38

    # Strengths
    strengths = []
    if current_foir_pct < 30:
        strengths.append(f"Low baseline EMI burden ({current_foir_pct}% FOIR) leaves headroom for fresh credit.")
    if monthly_surplus > (monthly_income * 0.35):
        strengths.append(f"Strong disposable monthly surplus of ₹{monthly_surplus:,.0f} prior to loan application.")
    if doc_completeness_pct >= 66:
        strengths.append("Core income verification documents are present and validated.")

    # Risk Indicators
    risk_indicators = []
    if projected_foir_pct > 50:
        risk_indicators.append({
            "title": "FOIR Exceeds Banking Benchmark",
            "metric": f"{projected_foir_pct}% Projected FOIR",
            "explanation": f"Adding ₹{proposed_emi:,.0f} monthly EMI pushes total debt service to {projected_foir_pct}% of net income. Most Indian commercial banks strictly cap FOIR at 45-50%.",
            "priority": "High"
        })
    if projected_surplus < 5000:
        risk_indicators.append({
            "title": "Thin Cash Buffer Post-EMI",
            "metric": f"₹{projected_surplus:,.0f} Surplus Left",
            "explanation": "After household expenses and new EMI, very little disposable liquidity remains to absorb unexpected emergencies.",
            "priority": "High" if projected_surplus < 0 else "Medium"
        })
    if doc_completeness_pct < 60:
        risk_indicators.append({
            "title": "Documentation Incomplete",
            "metric": f"{doc_completeness_pct}% Complete",
            "explanation": "Missing 6 months banking or ITR documentation frequently triggers automated rejection by NBFC underwriting engines.",
            "priority": "Medium"
        })

    # Actionable 30 / 60 / 90-Day Roadmap
    action_plan = [
        {
            "timeframe": "Next 30 Days",
            "phase": "Immediate Debt & Buffer Clean-up",
            "action": "Pre-pay credit card outstanding balances or small BNPL lines to immediately reduce fixed obligations below 40% FOIR.",
            "impact": "Lowers FOIR by 5-10% and improves bank statement underwriting."
        },
        {
            "timeframe": "Next 60 Days",
            "phase": "Cash Flow Consolidation",
            "action": "Maintain average bank balance (MAB) consistently without any inward cheque bounce or ECS return charges.",
            "impact": "Proves sustained liquidity and reliable repayment capacity."
        },
        {
            "timeframe": "Next 90 Days",
            "phase": "Strategic Re-application",
            "action": "Apply with a family co-borrower or opt for a longer tenure (e.g. 72 vs 48 months) to structurally depress the monthly EMI.",
            "impact": "Increases disposable income calculation and boosts loan sanction odds."
        }
    ]

    return {
        "summary": (
            f"Financial Profile Analysis indicates a {health_status.lower()} stance. "
            f"Monthly income of ₹{monthly_income:,.0f} supports current EMIs of ₹{existing_emis:,.0f} ({current_foir_pct}% FOIR). "
            f"The proposed ₹{target_loan_amount:,.0f} loan adds ₹{proposed_emi:,.0f}/mo, moving projected FOIR to {projected_foir_pct}%."
        ),
        "health_status": health_status,
        "health_badge": health_badge,
        "health_score": health_score,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "existing_emis": existing_emis,
        "proposed_emi": proposed_emi,
        "current_foir_pct": current_foir_pct,
        "projected_foir_pct": projected_foir_pct,
        "monthly_surplus": monthly_surplus,
        "projected_surplus": projected_surplus,
        "doc_completeness_pct": doc_completeness_pct,
        "strengths": strengths,
        "risk_indicators": risk_indicators,
        "action_plan": action_plan,
        "disclaimer": (
            "Sahyogi Loan AI is an educational decision-support platform. It is not an approval authority, credit bureau, or lender. "
            "All metrics are calculated using standard banking amortization formulas and illustrative assumptions."
        )
    }


def simulate_what_if_scenario(
    base_income: float,
    base_expenses: float,
    base_emis: float,
    new_income: float,
    new_expenses: float,
    new_emis: float,
    additional_emi: float = 0.0
) -> Dict[str, Any]:
    """Calculate instant before vs after delta for What-If scenario simulations."""
    base_income = max(base_income, 1.0)
    new_income = max(new_income, 1.0)

    base_total_emi = base_emis
    new_total_emi = new_emis + additional_emi

    base_foir = round((base_total_emi / base_income) * 100.0, 1)
    new_foir = round((new_total_emi / new_income) * 100.0, 1)

    base_surplus = round(base_income - base_expenses - base_total_emi)
    new_surplus = round(new_income - new_expenses - new_total_emi)

    surplus_diff = new_surplus - base_surplus
    foir_diff = round(new_foir - base_foir, 1)

    affordability = "Affordable" if (new_foir <= 45 and new_surplus >= 0) else "Borderline" if new_foir <= 55 else "Risky Deficit"

    return {
        "baseline": {
            "income": base_income,
            "expenses": base_expenses,
            "emis": base_total_emi,
            "foir": base_foir,
            "surplus": base_surplus,
        },
        "modified": {
            "income": new_income,
            "expenses": new_expenses,
            "emis": new_total_emi,
            "foir": new_foir,
            "surplus": new_surplus,
        },
        "diff": {
            "surplus_diff": surplus_diff,
            "foir_diff": foir_diff,
            "is_improved": surplus_diff >= 0 and foir_diff <= 0,
        },
        "affordability": affordability,
    }
