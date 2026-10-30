"""Deterministic calculation engine for Sahyogi Loan AI.

All financial maths lives here. The LLM never computes or invents numbers.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict


def emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
    """Standard reducing-balance EMI."""
    if principal <= 0:
        raise ValueError("principal must be positive")
    if tenure_months <= 0:
        raise ValueError("tenure_months must be positive")
    if annual_rate_pct < 0:
        raise ValueError("annual_rate_pct cannot be negative")
    r = annual_rate_pct / 12 / 100
    if r == 0:
        return principal / tenure_months
    f = (1 + r) ** tenure_months
    return principal * r * f / (f - 1)


def loan_cost(
    principal: float,
    annual_rate_pct: float,
    tenure_months: int,
    processing_fee_pct: float | None = None,
    moratorium_months: int = 0,
) -> dict:
    """EMI, total repayment and interest.

    moratorium_months: months with no EMI (common for education loans). Interest
    is assumed to accrue simply and be added to the principal before EMIs start
    (a conservative, clearly stated assumption).
    """
    r = annual_rate_pct / 12 / 100
    accrued = principal * r * moratorium_months if moratorium_months > 0 else 0.0
    effective_principal = principal + accrued
    monthly = emi(effective_principal, annual_rate_pct, tenure_months)
    total_repayment = monthly * tenure_months
    fee = principal * processing_fee_pct / 100 if processing_fee_pct is not None else None
    total_interest = total_repayment - principal
    return {
        "principal": round(principal, 2),
        "annual_rate_pct": annual_rate_pct,
        "tenure_months": tenure_months,
        "moratorium_months": moratorium_months,
        "interest_accrued_during_moratorium": round(accrued, 2),
        "monthly_emi": round(monthly, 2),
        "total_repayment": round(total_repayment, 2),
        "total_interest": round(total_interest, 2),
        "processing_fee": round(fee, 2) if fee is not None else None,
        "total_cost_with_fee": round(total_repayment + fee, 2) if fee is not None else None,
        "assumptions": [
            "Reducing-balance EMI, monthly compounding.",
            "Rate is user-entered or illustrative; confirm the actual rate with the lender.",
            "Processing fee included only if provided; other charges (insurance, penalties) are unknown.",
        ]
        + (
            ["Interest during the moratorium is assumed to accrue and be added to the principal."]
            if moratorium_months > 0
            else []
        ),
    }


@dataclass
class Scenario:
    name: str
    monthly_income: float
    monthly_expenses: float
    existing_emis: float
    new_emi: float

    @property
    def surplus_after_loan(self) -> float:
        return self.monthly_income - self.monthly_expenses - self.existing_emis - self.new_emi

    @property
    def emi_to_income_pct(self) -> float:
        if self.monthly_income <= 0:
            return 100.0
        return (self.existing_emis + self.new_emi) / self.monthly_income * 100

    @property
    def pressure(self) -> str:
        if self.surplus_after_loan < 0:
            return "high"
        if self.emi_to_income_pct > 40 or self.surplus_after_loan < 0.1 * self.monthly_income:
            return "medium"
        return "low"

    def to_dict(self) -> dict:
        d = asdict(self)
        d["surplus_after_loan"] = round(self.surplus_after_loan, 2)
        d["emi_to_income_pct"] = round(self.emi_to_income_pct, 1)
        d["pressure"] = self.pressure
        return d


PRESSURE_NOTE = {
    "low": "Repayment looks manageable under these assumptions.",
    "medium": "Repayment is tight; little room for surprises.",
    "high": "Income does not cover expenses plus EMI in this scenario.",
}


def stress_test(
    new_emi: float,
    monthly_income: float,
    monthly_expenses: float,
    existing_emis: float = 0.0,
    income_drop_pcts: tuple[float, ...] = (0, 20, 40),
    extra_scenarios: list[dict] | None = None,
) -> list[dict]:
    """Compare repayment pressure under normal and reduced income."""
    out = []
    for drop in income_drop_pcts:
        name = "Normal income" if drop == 0 else f"Income lower by {int(drop)}%"
        s = Scenario(name, monthly_income * (1 - drop / 100), monthly_expenses, existing_emis, new_emi)
        d = s.to_dict()
        d["note"] = PRESSURE_NOTE[s.pressure]
        out.append(d)
    for extra in extra_scenarios or []:
        s = Scenario(
            extra["name"],
            extra["monthly_income"],
            extra.get("monthly_expenses", monthly_expenses),
            existing_emis,
            new_emi,
        )
        d = s.to_dict()
        d["note"] = PRESSURE_NOTE[s.pressure]
        out.append(d)
    return out


def seasonal_stress_test(
    new_emi: float,
    monthly_expenses: float,
    seasonal_income: dict[str, float],
    crop_income_drop_pct: float = 30.0,
    existing_emis: float = 0.0,
) -> dict:
    """Farmer flow: income arrives in seasons, EMI is due every month.

    seasonal_income maps month label -> expected income in that month.
    Returns month-by-month cumulative cash position for normal and reduced crop income.
    """

    def run(factor: float) -> list[dict]:
        cash = 0.0
        rows = []
        for month, inc in seasonal_income.items():
            cash += inc * factor - monthly_expenses - existing_emis - new_emi
            rows.append({"month": month, "income": round(inc * factor, 2), "cash_position": round(cash, 2)})
        return rows

    normal = run(1.0)
    reduced = run(1 - crop_income_drop_pct / 100)
    return {
        "normal": normal,
        "reduced": reduced,
        "crop_income_drop_pct": crop_income_drop_pct,
        "lowest_cash_normal": min(r["cash_position"] for r in normal),
        "lowest_cash_reduced": min(r["cash_position"] for r in reduced),
        "note": (
            "Cash position is cumulative over the year and ignores savings or other income. "
            "A negative value means you would need savings, a bridge, or a different repayment schedule."
        ),
    }
