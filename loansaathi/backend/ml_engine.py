"""ML Engine for Sahyogi Loan AI.

Four ML-powered features that augment the deterministic calculation engine:
1. Loan Approval Probability Predictor
2. Smart Scheme Recommender (content-based scoring)
3. Optimal Tenure / Amount Advisor
4. Break-Even Income Calculator

All predictions include confidence scores and disclaimers.
ML suggests, deterministic math proves.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

from engine import emi, loan_cost, stress_test
from data import schemes_for

# ─────────────────────────────────────────────────────────────────────
# 1. LOAN APPROVAL PROBABILITY PREDICTOR
# ─────────────────────────────────────────────────────────────────────

# Training data is synthetic, based on published Indian bank eligibility norms:
#   - EMI-to-income ratio: banks typically reject >50%, cautious >40%
#   - Loan-to-income ratio: personal ≤15x, business ≤20x, education flexible
#   - Existing debt: total EMI burden matters
#   - Category-specific thresholds

_MODEL: GradientBoostingClassifier | None = None
_SCALER: StandardScaler | None = None


def _generate_synthetic_data(n_samples: int = 5000, seed: int = 42) -> tuple:
    """Generate synthetic loan approval data based on Indian banking norms."""
    rng = random.Random(seed)
    np_rng = np.random.RandomState(seed)

    X, y = [], []
    categories = {"student": 0, "farmer": 1, "business": 2, "personal": 3}

    for _ in range(n_samples):
        cat_name = rng.choice(list(categories.keys()))
        cat = categories[cat_name]

        # Generate realistic profiles per category
        if cat_name == "student":
            income = rng.uniform(10000, 80000)  # co-applicant income
            amount = rng.uniform(50000, 1500000)
            tenure = rng.choice([36, 48, 60, 72, 84, 96])
            rate = rng.uniform(7.0, 14.0)
            existing_emi = rng.uniform(0, income * 0.3)
        elif cat_name == "farmer":
            income = rng.uniform(5000, 100000)
            amount = rng.uniform(10000, 1500000)
            tenure = rng.choice([12, 24, 36, 48, 60])
            rate = rng.uniform(4.0, 12.0)
            existing_emi = rng.uniform(0, income * 0.2)
        elif cat_name == "business":
            income = rng.uniform(15000, 500000)
            amount = rng.uniform(50000, 5000000)
            tenure = rng.choice([12, 24, 36, 48, 60, 72])
            rate = rng.uniform(8.0, 16.0)
            existing_emi = rng.uniform(0, income * 0.25)
        else:  # personal
            income = rng.uniform(15000, 200000)
            amount = rng.uniform(20000, 2000000)
            tenure = rng.choice([12, 24, 36, 48, 60])
            rate = rng.uniform(10.0, 24.0)
            existing_emi = rng.uniform(0, income * 0.3)

        monthly_emi = emi(amount, rate, tenure)
        emi_to_income = (monthly_emi + existing_emi) / income * 100 if income > 0 else 100
        loan_to_income = amount / (income * 12) if income > 0 else 100

        # Features
        features = [
            cat,                    # category encoded
            income,                 # monthly income
            amount,                 # loan amount
            tenure,                 # tenure months
            rate,                   # interest rate
            existing_emi,           # existing EMIs
            monthly_emi,            # new EMI
            emi_to_income,          # total EMI-to-income %
            loan_to_income,         # loan-to-annual-income ratio
        ]
        X.append(features)

        # Approval logic based on Indian banking norms
        score = 0.5  # base

        # EMI-to-income ratio (strongest signal)
        if emi_to_income < 30:
            score += 0.25
        elif emi_to_income < 40:
            score += 0.1
        elif emi_to_income < 50:
            score -= 0.1
        else:
            score -= 0.35

        # Loan-to-income ratio
        if loan_to_income < 3:
            score += 0.1
        elif loan_to_income > 15:
            score -= 0.3
        elif loan_to_income > 8:
            score -= 0.15

        # Category-specific adjustments
        if cat_name == "student" and amount <= 750000:
            score += 0.1  # CGFSEL guarantee
        if cat_name == "farmer" and amount <= 300000:
            score += 0.15  # KCC norms
        if cat_name == "business" and amount <= 1000000:
            score += 0.05  # Mudra norms

        # Income adequacy
        surplus = income - existing_emi - monthly_emi
        if surplus > income * 0.3:
            score += 0.1
        elif surplus < 0:
            score -= 0.3

        # Add noise for realistic variation
        score += rng.gauss(0, 0.08)

        approved = 1 if score > 0.5 else 0
        y.append(approved)

    return np.array(X), np.array(y)


def _get_model() -> tuple[GradientBoostingClassifier, StandardScaler]:
    """Lazy-initialize the ML model on first call."""
    global _MODEL, _SCALER
    if _MODEL is None:
        X, y = _generate_synthetic_data()
        _SCALER = StandardScaler()
        X_scaled = _SCALER.fit_transform(X)
        _MODEL = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
        )
        _MODEL.fit(X_scaled, y)
    return _MODEL, _SCALER


CATEGORY_MAP = {"student": 0, "farmer": 1, "business": 2, "personal": 3}


def predict_approval(
    category: str,
    monthly_income: float,
    amount: float,
    tenure_months: int,
    annual_rate_pct: float,
    existing_emis: float = 0.0,
) -> dict:
    """Predict loan approval probability and provide risk breakdown."""
    model, scaler = _get_model()

    monthly_emi = emi(amount, annual_rate_pct, tenure_months)
    emi_to_income = (monthly_emi + existing_emis) / monthly_income * 100 if monthly_income > 0 else 100
    loan_to_income = amount / (monthly_income * 12) if monthly_income > 0 else 100

    features = np.array([[
        CATEGORY_MAP.get(category, 3),
        monthly_income,
        amount,
        tenure_months,
        annual_rate_pct,
        existing_emis,
        monthly_emi,
        emi_to_income,
        loan_to_income,
    ]])

    features_scaled = scaler.transform(features)
    proba = model.predict_proba(features_scaled)[0]
    approval_pct = round(proba[1] * 100, 1)

    # Risk factors breakdown
    risk_factors = []
    positive_factors = []

    if emi_to_income > 50:
        risk_factors.append({"factor": "EMI-to-income ratio is very high", "detail": f"{emi_to_income:.0f}% — banks prefer below 40%", "severity": "high"})
    elif emi_to_income > 40:
        risk_factors.append({"factor": "EMI-to-income ratio is elevated", "detail": f"{emi_to_income:.0f}% — at the upper limit most banks accept", "severity": "medium"})
    else:
        positive_factors.append({"factor": "EMI-to-income ratio is healthy", "detail": f"{emi_to_income:.0f}% — well within bank comfort zone"})

    surplus = monthly_income - existing_emis - monthly_emi
    if surplus < 0:
        risk_factors.append({"factor": "Income does not cover all EMIs", "detail": f"Shortfall of ₹{abs(surplus):,.0f}/month", "severity": "high"})
    elif surplus < monthly_income * 0.1:
        risk_factors.append({"factor": "Very thin surplus after EMIs", "detail": f"Only ₹{surplus:,.0f}/month left", "severity": "medium"})
    else:
        positive_factors.append({"factor": "Adequate surplus after EMIs", "detail": f"₹{surplus:,.0f}/month remaining"})

    if loan_to_income > 10:
        risk_factors.append({"factor": "Loan amount is high relative to annual income", "detail": f"{loan_to_income:.1f}× annual income", "severity": "medium"})
    else:
        positive_factors.append({"factor": "Loan amount is reasonable vs income", "detail": f"{loan_to_income:.1f}× annual income"})

    # Category-specific notes
    if category == "student" and amount <= 750000:
        positive_factors.append({"factor": "Eligible for CGFSEL guarantee", "detail": "Collateral-free up to ₹7.5 Lakh"})
    if category == "farmer" and amount <= 300000:
        positive_factors.append({"factor": "Within KCC collateral-free limit", "detail": "Up to ₹3 Lakh without collateral"})

    # Confidence label
    if approval_pct >= 70:
        label = "high"
        message = "Your profile looks strong for this loan amount."
    elif approval_pct >= 45:
        label = "medium"
        message = "Approval is possible but not certain. Consider the suggestions below."
    else:
        label = "low"
        message = "Approval may be difficult with current parameters. See the risk factors below."

    return {
        "approval_pct": approval_pct,
        "label": label,
        "message": message,
        "risk_factors": risk_factors,
        "positive_factors": positive_factors,
        "emi_to_income_pct": round(emi_to_income, 1),
        "loan_to_income_ratio": round(loan_to_income, 1),
        "monthly_emi": round(monthly_emi, 2),
        "disclaimer": "This is an ML-based estimate from a synthetic model, NOT a credit score or bank decision. Actual approval depends on CIBIL score, documentation, and lender-specific policies.",
    }


# ─────────────────────────────────────────────────────────────────────
# 2. SMART SCHEME RECOMMENDER
# ─────────────────────────────────────────────────────────────────────

def recommend_schemes(
    category: str,
    amount: float,
    monthly_income: float | None = None,
    existing_emis: float = 0.0,
) -> list[dict]:
    """Rank schemes by compatibility with the user's profile.

    Scoring rubric:
    - Amount within scheme max: +30 points
    - Collateral-free eligibility: +20 points
    - Lower sample interest rate: +15 points (normalized)
    - Subsidy available: +15 points
    - Income adequacy for scheme: +20 points
    """
    schemes = schemes_for(category)
    if not schemes:
        return []

    scored = []
    rates = [s.get("sample_rate_pct", 15) for s in schemes]
    min_rate = min(rates) if rates else 0
    max_rate = max(rates) if rates else 1
    rate_range = max_rate - min_rate if max_rate != min_rate else 1

    for scheme in schemes:
        score = 0
        reasons = []

        # Amount within max limit
        max_amt = scheme.get("max_amount_inr", float("inf"))
        if amount <= max_amt:
            score += 30
            reasons.append(f"Loan amount ₹{amount:,.0f} is within the ₹{max_amt:,.0f} limit")
        else:
            score -= 20
            reasons.append(f"⚠ Amount ₹{amount:,.0f} exceeds the ₹{max_amt:,.0f} maximum")

        # Collateral-free check
        collateral = scheme.get("collateral_required", "").lower()
        if "no collateral" in collateral or "collateral-free" in collateral or "zero collateral" in collateral:
            score += 20
            reasons.append("No collateral required")

        # Interest rate comparison (lower = better)
        rate = scheme.get("sample_rate_pct", 15)
        rate_score = 15 * (1 - (rate - min_rate) / rate_range) if rate_range > 0 else 7.5
        score += rate_score
        if rate <= 5:
            reasons.append(f"Very low interest rate ({rate}%)")
        elif rate <= 10:
            reasons.append(f"Competitive interest rate ({rate}%)")

        # Subsidy availability
        subsidy = scheme.get("subsidy_info", "")
        if subsidy and "no" not in subsidy.lower()[:10]:
            score += 15
            reasons.append("Government subsidy available")

        # Income adequacy (if income provided)
        if monthly_income is not None and monthly_income > 0:
            try:
                tenure = 60  # default for scoring
                monthly_payment = emi(amount, rate, tenure)
                total_emi = monthly_payment + existing_emis
                if total_emi / monthly_income < 0.4:
                    score += 20
                    reasons.append("EMI fits comfortably within your income")
                elif total_emi / monthly_income < 0.5:
                    score += 10
                    reasons.append("EMI is manageable but tight with your income")
                else:
                    reasons.append("⚠ EMI may be high relative to your income at this rate")
            except (ValueError, ZeroDivisionError):
                pass

        # Normalize score to 0-100
        max_possible = 100
        match_pct = min(100, max(0, round(score / max_possible * 100)))

        scored.append({
            **scheme,
            "match_score": match_pct,
            "match_reasons": reasons,
            "match_label": "Excellent fit" if match_pct >= 75 else "Good fit" if match_pct >= 50 else "Partial fit" if match_pct >= 30 else "May not fit",
        })

    # Sort by match score descending
    scored.sort(key=lambda s: s["match_score"], reverse=True)
    return scored


# ─────────────────────────────────────────────────────────────────────
# 3. OPTIMAL TENURE / AMOUNT ADVISOR
# ─────────────────────────────────────────────────────────────────────

def optimize_tenure(
    principal: float,
    annual_rate_pct: float,
    monthly_income: float,
    monthly_expenses: float = 0.0,
    existing_emis: float = 0.0,
    min_tenure: int = 12,
    max_tenure: int = 360,
) -> dict:
    """Find optimal tenure that minimizes total interest while keeping pressure 'low'.

    Returns the current plan vs. the optimized suggestion with savings.
    """
    best = None
    all_options = []

    # Scan tenures in steps
    step = 6 if max_tenure > 120 else 3
    tenures = list(range(min_tenure, max_tenure + 1, step))
    # Always include common tenures
    for t in [12, 24, 36, 48, 60, 72, 84, 96, 120, 180, 240]:
        if min_tenure <= t <= max_tenure and t not in tenures:
            tenures.append(t)
    tenures.sort()

    for t in tenures:
        try:
            cost = loan_cost(principal, annual_rate_pct, t)
            monthly_emi_val = cost["monthly_emi"]
            total_interest = cost["total_interest"]

            # Check stress test pressure
            surplus = monthly_income - monthly_expenses - existing_emis - monthly_emi_val
            total_emi_ratio = (existing_emis + monthly_emi_val) / monthly_income * 100 if monthly_income > 0 else 100

            if surplus < 0:
                pressure = "high"
            elif total_emi_ratio > 40 or surplus < 0.1 * monthly_income:
                pressure = "medium"
            else:
                pressure = "low"

            option = {
                "tenure_months": t,
                "monthly_emi": round(monthly_emi_val, 2),
                "total_interest": round(total_interest, 2),
                "total_repayment": round(cost["total_repayment"], 2),
                "surplus_after_emi": round(surplus, 2),
                "emi_to_income_pct": round(total_emi_ratio, 1),
                "pressure": pressure,
            }
            all_options.append(option)

            # Best = shortest tenure with low pressure (minimizes interest)
            if pressure == "low":
                if best is None or t < best["tenure_months"]:
                    best = option

        except (ValueError, ZeroDivisionError):
            continue

    # If no "low" pressure found, pick the shortest "medium"
    if best is None:
        medium_options = [o for o in all_options if o["pressure"] == "medium"]
        if medium_options:
            best = min(medium_options, key=lambda o: o["tenure_months"])

    # Show a few representative options
    sample_tenures = {12, 24, 36, 48, 60, 72, 84, 96, 120}
    sample_options = [o for o in all_options if o["tenure_months"] in sample_tenures]

    return {
        "optimal": best,
        "sample_options": sample_options,
        "analysis": _build_optimization_analysis(best, all_options, principal, annual_rate_pct),
        "disclaimer": "Optimization assumes stable income and expenses. Confirm actual tenure options with your lender.",
    }


def _build_optimization_analysis(best, all_options, principal, rate) -> str:
    """Build a human-readable analysis of the optimization result."""
    if best is None:
        return "No feasible tenure found where repayment pressure stays manageable. Consider a lower loan amount."

    longest_low = [o for o in all_options if o["pressure"] == "low"]
    if len(longest_low) >= 2:
        longest = max(longest_low, key=lambda o: o["tenure_months"])
        savings = longest["total_interest"] - best["total_interest"]
        if savings > 0:
            return (
                f"Optimal tenure is {best['tenure_months']} months "
                f"(EMI ₹{best['monthly_emi']:,.0f}). "
                f"Compared to {longest['tenure_months']} months, "
                f"you save ₹{savings:,.0f} in interest while keeping repayment comfortable."
            )

    return (
        f"Shortest safe tenure: {best['tenure_months']} months "
        f"with EMI ₹{best['monthly_emi']:,.0f} and "
        f"total interest ₹{best['total_interest']:,.0f}."
    )


# ─────────────────────────────────────────────────────────────────────
# 4. BREAK-EVEN INCOME CALCULATOR
# ─────────────────────────────────────────────────────────────────────

def break_even_income(
    new_emi: float,
    monthly_expenses: float = 0.0,
    existing_emis: float = 0.0,
    buffer_pct: float = 10.0,
) -> dict:
    """Calculate minimum monthly income needed for safe loan repayment.

    Uses the same pressure logic as engine.py Scenario:
    - 'low' pressure: total EMI < 40% of income AND surplus > 10% of income
    - We solve for the income that just achieves 'low' pressure.
    """
    total_emi = new_emi + existing_emis
    total_outflow = monthly_expenses + total_emi

    # Condition 1: surplus > 10% of income → income - outflow > 0.1 × income
    #   0.9 × income > outflow → income > outflow / 0.9
    min_income_surplus = total_outflow / 0.9

    # Condition 2: total EMI < 40% of income → income > total_emi / 0.4
    min_income_emi_ratio = total_emi / 0.4

    # The binding constraint is the higher of the two
    min_income = max(min_income_surplus, min_income_emi_ratio)

    # Add a user-specified buffer
    safe_income = min_income * (1 + buffer_pct / 100)

    # Calculate what happens at different income levels
    scenarios = []
    for factor_name, factor in [("At minimum", 1.0), ("With 10% buffer", 1.1), ("With 20% buffer", 1.2)]:
        inc = min_income * factor
        surplus = inc - total_outflow
        emi_ratio = total_emi / inc * 100 if inc > 0 else 100
        if surplus < 0:
            pressure = "high"
        elif emi_ratio > 40 or surplus < 0.1 * inc:
            pressure = "medium"
        else:
            pressure = "low"
        scenarios.append({
            "label": factor_name,
            "income": round(inc, 2),
            "surplus": round(surplus, 2),
            "emi_to_income_pct": round(emi_ratio, 1),
            "pressure": pressure,
        })

    # Determine which constraint is binding
    binding = "EMI-to-income ratio" if min_income_emi_ratio >= min_income_surplus else "surplus cushion"

    return {
        "minimum_income": round(min_income, 2),
        "safe_income": round(safe_income, 2),
        "binding_constraint": binding,
        "scenarios": scenarios,
        "explanation": (
            f"You need at least ₹{min_income:,.0f}/month for the repayment pressure to stay 'low'. "
            f"The binding constraint is the {binding} rule. "
            f"With a {buffer_pct:.0f}% safety buffer, aim for ₹{safe_income:,.0f}/month."
        ),
        "disclaimer": "This is a mathematical minimum based on our stress-test heuristics, not a bank requirement.",
    }


# ─────────────────────────────────────────────────────────────────────
# COMBINED ML INSIGHTS (called from passport builder)
# ─────────────────────────────────────────────────────────────────────

def generate_ml_insights(profile: dict, cost: dict) -> dict:
    """Generate all ML insights for a given user profile and computed cost.

    Called by passport.py to add ML insights to the passport.
    """
    category = profile["category"]
    amount = profile["amount"]
    monthly_income = profile.get("monthly_income")
    monthly_expenses = profile.get("monthly_expenses", 0)
    existing_emis = profile.get("existing_emis", 0)
    tenure_months = profile["tenure_months"]
    rate = cost["annual_rate_pct"]
    monthly_emi_val = cost["monthly_emi"]

    insights = {}

    # 1. Approval prediction (only if income is provided)
    if monthly_income is not None and monthly_income > 0:
        insights["approval"] = predict_approval(
            category=category,
            monthly_income=monthly_income,
            amount=amount,
            tenure_months=tenure_months,
            annual_rate_pct=rate,
            existing_emis=existing_emis,
        )

    # 2. Smart scheme recommendation
    insights["scheme_ranking"] = recommend_schemes(
        category=category,
        amount=amount,
        monthly_income=monthly_income,
        existing_emis=existing_emis,
    )

    # 3. Tenure optimization (only if income is provided)
    if monthly_income is not None and monthly_income > 0:
        insights["tenure_optimization"] = optimize_tenure(
            principal=amount,
            annual_rate_pct=rate,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            existing_emis=existing_emis,
        )

    # 4. Break-even income
    insights["break_even"] = break_even_income(
        new_emi=monthly_emi_val,
        monthly_expenses=monthly_expenses,
        existing_emis=existing_emis,
    )

    return insights
