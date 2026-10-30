"""
Machine Learning prediction and model evaluation routes.
"""
from fastapi import APIRouter, HTTPException
from schemas.prediction import PredictionRequest, PredictionResponse
from services.model_service import model_service

router = APIRouter(prefix="/ml", tags=["machine-learning"])

@router.post("/predict", response_model=PredictionResponse)
def predict_repayment_risk(req: PredictionRequest):
    """
    Predicts historical loan repayment risk pattern using the trained Random Forest model.
    Excludes sensitive demographics and provides feature importance explanations.
    """
    try:
        return model_service.predict_repayment(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/model-info")
def get_model_information():
    """Returns model metadata, cross-validation metrics, and feature comparison details."""
    return {
        "metadata": model_service.metadata,
        "comparison": model_service.comparison,
        "features": model_service.feature_info,
        "is_loaded": model_service.is_loaded,
    }

