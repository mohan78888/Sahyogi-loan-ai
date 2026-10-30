"""
Core configuration and environment settings for Sahyogi Loan AI.
"""
import os
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    _base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    load_dotenv(os.path.join(_base_dir, ".env"))
    load_dotenv(os.path.join(_base_dir, "..", ".env"))
except ImportError:
    pass

class Settings(BaseModel):
    APP_NAME: str = "Sahyogi Loan AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DATA_PATH: str = os.path.join(BASE_DIR, "data", "loan_dataset_20000.csv")
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts")
    MODELS_DIR: str = os.path.join(ARTIFACTS_DIR, "models")
    EDA_DIR: str = os.path.join(ARTIFACTS_DIR, "eda")
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "storage", "documents")
    
    # Model Artifacts
    BEST_MODEL_PATH: str = os.path.join(MODELS_DIR, "best_repayment_model.joblib")
    MODEL_METADATA_PATH: str = os.path.join(MODELS_DIR, "model_metadata.json")
    MODEL_COMPARISON_PATH: str = os.path.join(MODELS_DIR, "model_comparison.json")
    DATASET_PROFILE_PATH: str = os.path.join(EDA_DIR, "dataset_profile.json")

    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "fallback_rules")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

