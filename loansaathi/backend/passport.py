"""Financial Readiness Passport generator. Pure functions, no LLM."""
from __future__ import annotations

from datetime import date

from engine import loan_cost, stress_test, seasonal_stress_test
from data import schemes_for, DOCUMENTS, LENDER_QUESTIONS, RED_FLAGS
from ml_engine import generate_ml_insights

DISCLAIMER = (
    "This is a preparation aid, not an official document, credit score or guarantee of approval. "
    "Rates and scheme details are illustrative until verified with the official source or lender."
)


def build_passport(profile: dict) -> dict:
    """profile keys: category, goal, amount, annual_rate_pct, tenure_months, monthly_income,
    monthly_expenses, existing_emis, processing_fee_pct, moratorium_months,
    documents_ready (list[str]), seasonal_income (dict, farmer only), crop_income_drop_pct."""
    category = profile["category"]
    schemes = schemes_for(category)

    rate = profile.get("annual_rate_pct")
    rate_is_sample = False
    if rate is None:
        rate = next((s["sample_rate_pct"] for s in schemes if s.get("default_rate")), 10.0)
        rate_is_sample = True

    cost = loan_cost(
        principal=profile["amount"],
        annual_rate_pct=rate,
        tenure_months=profile["tenure_months"],
        processing_fee_pct=profile.get("processing_fee_pct"),
        moratorium_months=profile.get("moratorium_months", 0),
    )
    if rate_is_sample:
        cost["assumptions"].insert(0, f"Rate of {rate}% is a SAMPLE placeholder, not a quote.")

    stress = None
    seasonal = None
    if profile.get("seasonal_income"):
        seasonal = seasonal_stress_test(
            new_emi=cost["monthly_emi"],
            monthly_expenses=profile.get("monthly_expenses", 0),
            seasonal_income=profile["seasonal_income"],
            crop_income_drop_pct=profile.get("crop_income_drop_pct", 30.0),
            existing_emis=profile.get("existing_emis", 0),
        )
    if profile.get("monthly_income") is not None:
        stress = stress_test(
            new_emi=cost["monthly_emi"],
            monthly_income=profile["monthly_income"],
            monthly_expenses=profile.get("monthly_expenses", 0),
            existing_emis=profile.get("existing_emis", 0),
        )

    needed = DOCUMENTS["common"] + DOCUMENTS.get(category, [])
    ready = {d.strip().lower() for d in profile.get("documents_ready", [])}
    checklist = [{"document": d, "ready": d.strip().lower() in ready} for d in needed]
    missing = [c["document"] for c in checklist if not c["ready"]]

    cautions = [
        "Do not pay anyone an upfront fee to 'guarantee' approval.",
        "Check every figure against the lender's sanction letter before signing.",
    ]
    worst = None
    if stress:
        worst = stress[-1]
    elif seasonal:
        worst = {"pressure": "high" if seasonal["lowest_cash_reduced"] < 0 else "low"}
    if worst and worst["pressure"] == "high":
        cautions.insert(0, "In the lower-income scenario repayment is not covered. Consider a smaller amount, longer tenure, or a repayment schedule that matches your income.")
    elif worst and worst["pressure"] == "medium":
        cautions.insert(0, "Repayment becomes tight if income falls. Keep a buffer before committing.")

    next_steps = [
        f"Gather the {len(missing)} missing document(s)." if missing else "All listed documents are marked ready. Double-check validity dates.",
        "Ask at least two lenders for a written quote using the questions below.",
        "Open the official source links to confirm current scheme rules.",
        "Re-run the stress test with your real rate and fees once you have a quote.",
    ]

    # Generate ML insights
    try:
        ml_insights = generate_ml_insights(profile, cost)
        # Use ML-ranked schemes if available
        if ml_insights.get("scheme_ranking"):
            schemes = ml_insights["scheme_ranking"]
    except Exception:
        ml_insights = None

    return {
        "generated_on": date.today().isoformat(),
        "goal": profile.get("goal", ""),
        "category": category,
        "cost": cost,
        "stress_test": stress,
        "seasonal_stress_test": seasonal,
        "schemes": schemes,
        "checklist": checklist,
        "missing_documents": missing,
        "lender_questions": LENDER_QUESTIONS,
        "red_flags": RED_FLAGS,
        "cautions": cautions,
        "next_steps": next_steps,
        "disclaimer": DISCLAIMER,
        "ml_insights": ml_insights,
    }

