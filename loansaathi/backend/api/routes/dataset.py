"""
Dataset inspection, statistics, and EDA insights endpoints.
"""
import os
import json
from fastapi import APIRouter, HTTPException
from core.config import settings

router = APIRouter(prefix="/dataset", tags=["dataset"])

def _load_profile():
    if not os.path.exists(settings.DATASET_PROFILE_PATH):
        raise HTTPException(status_code=404, detail="Dataset profile not found. Run EDA pipeline first.")
    with open(settings.DATASET_PROFILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/profile")
def get_dataset_profile():
    """Returns complete machine-readable dataset profile and schema audit."""
    return _load_profile()

@router.get("/statistics")
def get_dataset_statistics():
    """Returns descriptive numerical statistics (mean, median, quantiles, std)."""
    prof = _load_profile()
    return {
        "dataset_name": prof.get("dataset_name"),
        "total_rows": prof.get("total_rows"),
        "summary_statistics": prof.get("summary_statistics"),
    }

@router.get("/insights")
def get_dataset_insights():
    """Returns correlation analysis, demographic audit, and key repayment drivers."""
    prof = _load_profile()
    return {
        "target_distribution": prof.get("target_distribution"),
        "correlation_with_target": prof.get("correlation_with_target"),
        "income_consistency_check": prof.get("income_consistency_check"),
        "sensitive_demographic_features_excluded": prof.get("sensitive_demographic_features"),
        "potential_leakage_features_evaluated": prof.get("potential_leakage_features"),
        "key_findings": [
            "Debt-to-income ratio is the strongest negative linear driver of repayment (r = -0.2238).",
            "Credit score is the strongest positive driver of historical repayment completion (r = +0.1998).",
            "Sensitive demographic attributes (age, gender, marital status, education) are filtered to uphold ethical lending standards.",
            "Historical repayment rate is 79.99% vs 20.01% default risk (80:20 imbalanced distribution).",
        ]
    }

