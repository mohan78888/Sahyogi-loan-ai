"""
Data preprocessing, feature definition, and pipeline transformers for Sahyogi Loan AI ML Engine.
"""
from typing import List, Tuple
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

TARGET_COL = "loan_paid_back"

# Demographic features excluded for ethical/fair-lending compliance
DEMOGRAPHIC_FEATURES: List[str] = [
    "age",
    "gender",
    "marital_status",
    "education_level",
]

# Post-underwriting variables investigated for target leakage
LEAKAGE_FEATURES: List[str] = [
    "grade_subgrade",
    "interest_rate",
]

# Production clean pre-underwriting feature set
CLEAN_NUMERIC_FEATURES: List[str] = [
    "monthly_income",
    "annual_income",
    "debt_to_income_ratio",
    "credit_score",
    "loan_amount",
    "loan_term",
    "installment",
    "num_of_open_accounts",
    "total_credit_limit",
    "current_balance",
    "delinquency_history",
    "public_records",
    "num_of_delinquencies",
]

CLEAN_CATEGORICAL_FEATURES: List[str] = [
    "employment_status",
    "loan_purpose",
]


def create_preprocessor(include_leakage: bool = False) -> Tuple[ColumnTransformer, List[str], List[str]]:
    """Builds a scikit-learn ColumnTransformer for standard scaling and one-hot encoding."""
    numeric_cols = list(CLEAN_NUMERIC_FEATURES)
    cat_cols = list(CLEAN_CATEGORICAL_FEATURES)

    if include_leakage:
        numeric_cols.append("interest_rate")
        cat_cols.append("grade_subgrade")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ],
        remainder="drop",
    )
    return preprocessor, numeric_cols, cat_cols


def prepare_dataset(df: pd.DataFrame, include_leakage: bool = False):
    """Separates features X and target y, removing demographic features."""
    y = df[TARGET_COL].values
    feature_cols = CLEAN_NUMERIC_FEATURES + CLEAN_CATEGORICAL_FEATURES
    if include_leakage:
        feature_cols = feature_cols + LEAKAGE_FEATURES

    X = df[feature_cols].copy()
    return X, y

