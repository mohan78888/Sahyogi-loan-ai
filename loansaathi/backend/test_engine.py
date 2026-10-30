import math

import pytest
from fastapi.testclient import TestClient

from engine import emi, loan_cost, stress_test, seasonal_stress_test
from main import app

client = TestClient(app)


def test_emi_hand_checked():
    # 5,00,000 at 10% for 60 months -> 10,623.52 (standard EMI table value)
    assert emi(500_000, 10, 60) == pytest.approx(10_623.52, abs=1.0)


def test_emi_zero_rate():
    assert emi(120_000, 0, 12) == pytest.approx(10_000)


def test_emi_formula_matches_manual():
    p, r, n = 300_000, 12.0, 36
    mr = r / 12 / 100
    manual = p * mr * (1 + mr) ** n / ((1 + mr) ** n - 1)
    assert emi(p, r, n) == pytest.approx(manual)


def test_total_interest_consistent():
    c = loan_cost(200_000, 9, 24)
    assert c["total_repayment"] == pytest.approx(c["monthly_emi"] * 24, abs=0.5)
    assert c["total_interest"] == pytest.approx(c["total_repayment"] - 200_000, abs=0.5)


def test_fee_is_none_when_unknown():
    c = loan_cost(100_000, 10, 12)
    assert c["processing_fee"] is None and c["total_cost_with_fee"] is None


def test_moratorium_increases_cost():
    base = loan_cost(400_000, 10, 60)
    mor = loan_cost(400_000, 10, 60, moratorium_months=12)
    assert mor["monthly_emi"] > base["monthly_emi"]
    assert mor["interest_accrued_during_moratorium"] == pytest.approx(400_000 * 0.10 / 12 * 12)


@pytest.mark.parametrize("args", [(0, 10, 12), (1000, -1, 12), (1000, 10, 0)])
def test_invalid_inputs(args):
    with pytest.raises(ValueError):
        emi(*args)


def test_stress_pressure_levels():
    res = stress_test(new_emi=8000, monthly_income=30000, monthly_expenses=12000)
    # Hand-checked: surplus 10000 / 4000 / -2000 after loan at 0 / 20 / 40% income drop
    assert [r["surplus_after_loan"] for r in res] == [10000, 4000, -2000]
    assert [r["pressure"] for r in res] == ["low", "low", "high"]
    assert res[-1]["surplus_after_loan"] < res[0]["surplus_after_loan"]


def test_seasonal_negative_cash_when_income_drops():
    income = {"Jan": 0, "Feb": 0, "Mar": 60000, "Apr": 0, "May": 0, "Jun": 0}
    out = seasonal_stress_test(5000, 8000, income, crop_income_drop_pct=50)
    assert out["lowest_cash_reduced"] <= out["lowest_cash_normal"]


def test_api_emi():
    r = client.post("/api/emi", json={"principal": 500000, "annual_rate_pct": 10, "tenure_months": 60})
    assert r.status_code == 200
    assert r.json()["monthly_emi"] == pytest.approx(10623.52, abs=1.0)


def test_api_validation_rejects_bad_input():
    r = client.post("/api/emi", json={"principal": -5, "annual_rate_pct": 10, "tenure_months": 60})
    assert r.status_code == 422


def test_api_passport_student():
    r = client.post(
        "/api/passport",
        json={
            "category": "student",
            "goal": "B.Tech fees",
            "amount": 600000,
            "tenure_months": 84,
            "moratorium_months": 12,
            "monthly_income": 25000,
            "monthly_expenses": 9000,
            "documents_ready": ["Identity proof (e.g. Aadhaar or PAN)"],
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["cost"]["monthly_emi"] > 0
    assert len(body["stress_test"]) == 3
    assert any(c["ready"] for c in body["checklist"])
    assert body["missing_documents"]
    assert "not an official document" in body["disclaimer"]


def test_api_passport_farmer_seasonal():
    r = client.post(
        "/api/passport",
        json={
            "category": "farmer",
            "goal": "Tractor attachment",
            "amount": 250000,
            "tenure_months": 48,
            "monthly_expenses": 7000,
            "seasonal_income": {"Mar": 90000, "Jun": 0, "Sep": 0, "Nov": 80000},
        },
    )
    assert r.status_code == 200
    assert r.json()["seasonal_stress_test"] is not None


def test_default_sample_rate_is_labelled_and_matches_goal():
    body = client.post(
        "/api/passport",
        json={"category": "farmer", "amount": 250000, "tenure_months": 48, "monthly_expenses": 7000},
    ).json()
    # Equipment-loan sample rate (9%), not the short-term KCC rate (7%)
    assert body["cost"]["annual_rate_pct"] == 9.0
    assert any("SAMPLE" in a for a in body["cost"]["assumptions"])
  
  