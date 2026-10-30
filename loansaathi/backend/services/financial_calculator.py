"""
Deterministic Financial Calculation Engine for Sahyogi Loan AI.
All financial arithmetic (FOIR, Surplus, Amortization, Stress Testing) is strictly deterministic.
"""
from typing import Dict, Any, List, Tuple
from decimal import Decimal, ROUND_HALF_UP

from schemas.financial import (
    FinancialAnalysisRequest,
    FinancialAnalysisResponse,
    ScenarioSimulateRequest,
    ScenarioSimulateResponse,
)

class FinancialCalculator:

    @staticmethod
    def calculate_foir(obligations: float, income: float) -> float:
        """Fixed Obligation to Income Ratio (FOIR %)."""
        if income <= 0:
            return 100.0 if obligations > 0 else 0.0
        return round((obligations / income) * 100.0, 2)

    @staticmethod
    def calculate_surplus(income: float, expenses: float, emis: float, additional_emi: float = 0.0) -> float:
        """Disposable income buffer remaining after living costs and all debt obligations."""
        surplus = income - expenses - emis - additional_emi
        return round(surplus, 2)

    @staticmethod
    def compute_analysis(req: FinancialAnalysisRequest) -> FinancialAnalysisResponse:
        income = float(req.monthly_income)
        expenses = float(req.monthly_expenses)
        existing_emis = float(req.existing_emis)
        proposed_emi = float(req.proposed_additional_emi)

        # If target loan amount & tenure provided but proposed_emi is 0, estimate EMI
        if proposed_emi == 0.0 and req.target_loan_amount and req.tenure_months:
            r = (req.interest_rate_pct or 10.5) / 100 / 12
            n = req.tenure_months
            if n > 0 and r > 0:
                proposed_emi = round((req.target_loan_amount * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)

        current_foir = FinancialCalculator.calculate_foir(existing_emis, income)
        projected_total_emis = existing_emis + proposed_emi
        projected_foir = FinancialCalculator.calculate_foir(projected_total_emis, income)

        current_surplus = FinancialCalculator.calculate_surplus(income, expenses, existing_emis)
        projected_surplus = FinancialCalculator.calculate_surplus(income, expenses, existing_emis, proposed_emi)

        # Deterministic Underwriting Health Score (0 - 100)
        # 1. FOIR score component (Max 40 pts)
        if projected_foir <= 30.0:
            foir_pts = 40
        elif projected_foir <= 45.0:
            foir_pts = 30
        elif projected_foir <= 55.0:
            foir_pts = 15
        else:
            foir_pts = 0

        # 2. Disposable Surplus component (Max 35 pts)
        surplus_ratio = projected_surplus / income if income > 0 else 0.0
        if surplus_ratio >= 0.35:
            surplus_pts = 35
        elif surplus_ratio >= 0.20:
            surplus_pts = 25
        elif surplus_ratio >= 0.05:
            surplus_pts = 15
        else:
            surplus_pts = 0

        # 3. Income Base & Expense Buffer (Max 25 pts)
        expense_ratio = expenses / income if income > 0 else 1.0
        if expense_ratio <= 0.40:
            buffer_pts = 25
        elif expense_ratio <= 0.60:
            buffer_pts = 15
        else:
            buffer_pts = 5

        health_score = max(5, min(100, foir_pts + surplus_pts + buffer_pts))

        if health_score >= 70:
            health_status = "Healthy"
            health_badge = "success"
            assessment = "Strong repayment capacity. Debt obligations remain well within standard banking guidelines."
        elif health_score >= 45:
            health_status = "Moderate Risk"
            health_badge = "warning"
            assessment = "Moderate repayment capacity. Total debt obligations approach typical banking caps (45-50%)."
        else:
            health_status = "High Debt Burden"
            health_badge = "danger"
            assessment = "High risk. Proposed debt service exceeds sustainable disposable income, creating default exposure."

        observations = []
        if projected_foir > 50.0:
            observations.append(f"Projected FOIR ({projected_foir}%) exceeds typical 45-50% ceiling in retail banking.")
        else:
            observations.append(f"Projected FOIR ({projected_foir}%) is within prudent debt-servicing limits.")

        if projected_surplus < (0.15 * income):
            observations.append(f"Post-EMI surplus buffer (₹{projected_surplus:,.0f}) leaves limited margin for financial shocks.")
        else:
            observations.append(f"Healthy post-EMI surplus (₹{projected_surplus:,.0f}/month) supports emergency resilience.")

        missing_info = []
        if req.target_loan_amount is None:
            missing_info.append("Target loan amount not specified.")
        if req.tenure_months is None:
            missing_info.append("Desired repayment tenure not specified.")

        return FinancialAnalysisResponse(
            monthly_net_income=income,
            monthly_living_expenses=expenses,
            existing_emis=existing_emis,
            proposed_additional_emi=proposed_emi,
            current_foir_pct=current_foir,
            projected_foir_pct=projected_foir,
            current_monthly_surplus=current_surplus,
            projected_monthly_surplus=projected_surplus,
            financial_health_score=health_score,
            health_status=health_status,
            health_badge=health_badge,
            cash_flow_assessment=assessment,
            document_completeness_pct=85.0 if income > 0 else 30.0,
            observations=observations,
            missing_information=missing_info,
            disclaimer="Deterministic calculation based on user-provided financial figures and standard amortizations.",
        )

    @staticmethod
    def simulate_scenario(req: ScenarioSimulateRequest) -> ScenarioSimulateResponse:
        base_surplus = FinancialCalculator.calculate_surplus(req.base_income, req.base_expenses, req.base_emis)
        base_foir = FinancialCalculator.calculate_foir(req.base_emis, req.base_income)

        mod_total_emis = req.new_emis + req.additional_emi
        mod_surplus = FinancialCalculator.calculate_surplus(req.new_income, req.new_expenses, req.new_emis, req.additional_emi)
        mod_foir = FinancialCalculator.calculate_foir(mod_total_emis, req.new_income)

        surplus_diff = round(mod_surplus - base_surplus, 2)
        foir_diff = round(mod_foir - base_foir, 2)

        if mod_surplus < 0:
            verdict = "Unsustainable: Cash flow turns negative under simulated conditions."
            direction = "deteriorating"
            rec = "Consider lowering requested principal or extending loan tenure to bring monthly EMI within bounds."
        elif mod_foir > 50.0:
            verdict = "High Risk: Debt commitments absorb over 50% of monthly income."
            direction = "deteriorating"
            rec = "Consolidate higher-interest loans or add a co-applicant to improve qualification readiness."
        elif surplus_diff >= 0:
            verdict = "Favorable: Affordability and surplus buffer improve under this scenario."
            direction = "improving"
            rec = "Maintain debt levels to ensure rapid application processing."
        else:
            verdict = "Sustainable: Moderate cash flow compression, but remains within viable servicing thresholds."
            direction = "neutral"
            rec = "Ensure a 3-month emergency fund remains untouched before taking on additional obligations."

        return ScenarioSimulateResponse(
            baseline={
                "income": req.base_income,
                "expenses": req.base_expenses,
                "emis": req.base_emis,
                "foir_pct": base_foir,
                "surplus": base_surplus,
            },
            modified={
                "income": req.new_income,
                "expenses": req.new_expenses,
                "emis": mod_total_emis,
                "foir_pct": mod_foir,
                "surplus": mod_surplus,
            },
            diff={
                "income_diff": round(req.new_income - req.base_income, 2),
                "foir_diff": foir_diff,
                "surplus_diff": surplus_diff,
            },
            verdict=verdict,
            risk_direction=direction,
            recommendation=rec,
        )

financial_calculator = FinancialCalculator()

