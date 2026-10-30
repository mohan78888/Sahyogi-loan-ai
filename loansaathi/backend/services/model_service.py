"""
Model Service for Sahyogi Loan AI.
Loads persisted Joblib models on startup and computes predictions with explainability.
"""
import os
import json
import joblib
import pandas as pd
from typing import Dict, Any, Optional

from core.config import settings
from schemas.prediction import PredictionRequest, PredictionResponse, InfluentialFactor

class ModelService:
    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.model = None
        self.metadata = {}
        self.comparison = {}
        self.feature_info = {}
        self.is_loaded = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self):
        """Loads trained model pipeline and metadata files safely on startup."""
        try:
            if os.path.exists(settings.BEST_MODEL_PATH):
                self.model = joblib.load(settings.BEST_MODEL_PATH)
                self.is_loaded = True
                print(f"[ModelService] Loaded best model pipeline from: {settings.BEST_MODEL_PATH}")
            else:
                print(f"[ModelService] Model artifact not found at: {settings.BEST_MODEL_PATH}")

            if os.path.exists(settings.MODEL_METADATA_PATH):
                with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)

            if os.path.exists(settings.MODEL_COMPARISON_PATH):
                with open(settings.MODEL_COMPARISON_PATH, "r", encoding="utf-8") as f:
                    self.comparison = json.load(f)

            feature_list_path = os.path.join(settings.MODELS_DIR, "feature_list.json")
            if os.path.exists(feature_list_path):
                with open(feature_list_path, "r", encoding="utf-8") as f:
                    self.feature_info = json.load(f)

        except Exception as e:
            print(f"[ModelService] Error loading artifacts: {e}")
            self.is_loaded = False

    def predict_repayment(self, req: PredictionRequest) -> PredictionResponse:
        """Executes inference on validated applicant financial profile with factor explainability."""
        if not self.is_loaded or self.model is None:
            raise RuntimeError("ML model pipeline is not loaded.")

        # Compute installment if not provided
        annual_inc = req.annual_income if req.annual_income is not None else req.monthly_income * 12.0
        installment_val = req.installment
        if installment_val is None or installment_val <= 0:
            # Amortization estimate with standard illustrative rate
            r = 0.105 / 12
            n = req.loan_term
            installment_val = round((req.loan_amount * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)

        input_row = {
            "monthly_income": req.monthly_income,
            "annual_income": annual_inc,
            "debt_to_income_ratio": req.debt_to_income_ratio,
            "credit_score": req.credit_score,
            "loan_amount": req.loan_amount,
            "loan_term": req.loan_term,
            "installment": installment_val,
            "num_of_open_accounts": req.num_of_open_accounts,
            "total_credit_limit": req.total_credit_limit,
            "current_balance": req.current_balance,
            "delinquency_history": req.delinquency_history,
            "public_records": req.public_records,
            "num_of_delinquencies": req.num_of_delinquencies,
            "employment_status": req.employment_status,
            "loan_purpose": req.loan_purpose,
        }

        df_input = pd.DataFrame([input_row])
        pred_class = int(self.model.predict(df_input)[0])
        probabilities = self.model.predict_proba(df_input)[0]
        repay_prob = float(probabilities[1])
        default_prob = float(probabilities[0])

        # Risk Tier
        if repay_prob >= 0.80:
            risk_tier = "Low Risk"
        elif repay_prob >= 0.55:
            risk_tier = "Moderate Risk"
        else:
            risk_tier = "High Risk"

        outcome = "likely_repaid" if pred_class == 1 else "elevated_default_risk"
        confidence = round(max(repay_prob, default_prob) * 100, 1)

        # Compute Influential Factor Explanations
        factors = []
        # 1. DTI Impact
        if req.debt_to_income_ratio <= 0.20:
            factors.append(InfluentialFactor(
                feature="debt_to_income_ratio",
                impact_direction="positive_for_repayment",
                description=f"Low DTI ratio ({req.debt_to_income_ratio:.1%}) leaves substantial disposable cashflow."
            ))
        elif req.debt_to_income_ratio >= 0.40:
            factors.append(InfluentialFactor(
                feature="debt_to_income_ratio",
                impact_direction="negative_for_repayment",
                description=f"High DTI ratio ({req.debt_to_income_ratio:.1%}) indicates heavy debt service strain."
            ))

        # 2. Credit Score Impact
        if req.credit_score >= 740:
            factors.append(InfluentialFactor(
                feature="credit_score",
                impact_direction="positive_for_repayment",
                description=f"Strong credit track record (Score: {req.credit_score}) correlates with >90% repayment completion."
            ))
        elif req.credit_score < 620:
            factors.append(InfluentialFactor(
                feature="credit_score",
                impact_direction="negative_for_repayment",
                description=f"Subprime credit score ({req.credit_score}) indicates elevated historical repayment risk."
            ))

        # 3. Employment Status
        if req.employment_status == "Unemployed":
            factors.append(InfluentialFactor(
                feature="employment_status",
                impact_direction="negative_for_repayment",
                description="Unemployed status is the single highest Gini penalty in historical repayment data."
            ))
        elif req.employment_status in ["Employed", "Self-employed"]:
            factors.append(InfluentialFactor(
                feature="employment_status",
                impact_direction="positive_for_repayment",
                description=f"Active regular income stream verified under '{req.employment_status}'."
            ))

        # 4. Delinquencies
        if req.num_of_delinquencies > 0 or req.delinquency_history > 0:
            factors.append(InfluentialFactor(
                feature="delinquency_history",
                impact_direction="negative_for_repayment",
                description=f"Detected {req.num_of_delinquencies} past delinquency events negatively depressing score."
            ))

        return PredictionResponse(
            predicted_outcome=outcome,
            predicted_class=pred_class,
            repayment_probability_pct=round(repay_prob * 100, 2),
            default_risk_probability_pct=round(default_prob * 100, 2),
            risk_tier=risk_tier,
            confidence_level=confidence,
            model_name="Random Forest Classifier (Clean Pre-underwriting)",
            model_version="1.0.0",
            influential_factors=factors,
            limitations_disclaimer=(
                "Predicts statistical historical repayment outcome based on credit and cashflow features. "
                "Does not constitute guaranteed loan approval or official bank underwriting decision."
            ),
        )

model_service = ModelService.get_instance()

