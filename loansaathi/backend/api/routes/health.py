"""
Health check and system status endpoint.
"""
import os
from fastapi import APIRouter
from core.config import settings
from services.model_service import model_service

router = APIRouter()

@router.get("/health")
def get_health_status():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "ml_model_loaded": model_service.is_loaded,
        "model_file": os.path.basename(settings.BEST_MODEL_PATH),
        "dataset_available": os.path.exists(settings.DATA_PATH),
        "ai_provider_mode": settings.LLM_PROVIDER,
        "supported_features": [
            "ML Repayment-Risk Prediction (Random Forest)",
            "Deterministic Underwriting Math (FOIR, Surplus)",
            "AI Financial Advisor & 30/60/90-Day Roadmap",
            "PDF Document Extraction & Entity Normalization",
            "What-If Income Stress Simulator",
        ]
    }

