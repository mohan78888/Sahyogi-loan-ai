# Sahyogi Loan AI — Backend Engine Documentation

AI-powered loan readiness, repayment-risk classification, document intelligence, and financial advisory platform built with **Python 3.14 + FastAPI + Scikit-Learn**.

---

## 1. System Architecture

The backend supports two independent, decoupled engines:

### Engine A: Machine Learning Repayment-Risk Engine
* **Objective:** Predicts historical repayment pattern likelihood (`loan_paid_back`: 1 = repaid, 0 = default risk) using `loan_dataset_20000.csv` (20,000 records).
* **Ethical Compliance:** Sensitive demographics (`age`, `gender`, `marital_status`, `education_level`) are strictly excluded from the scoring features.
* **Leakage Safeguards:** Investigated post-hoc underwriting features (`grade_subgrade`, `interest_rate`) vs clean pre-underwriting features. Production baseline uses the clean pre-underwriting model.
* **Trained Models:**
  * **Random Forest Classifier (Clean Pre-underwriting)**: **87.08% Accuracy**, **91.42% Precision**, **92.53% Recall**, **91.97% F1**, **0.8852 ROC-AUC**.
  * **Logistic Regression (Clean Pre-underwriting)**: **81.50% Accuracy**, **92.86% Precision**, **83.28% Recall**, **87.81% F1**, **0.8853 ROC-AUC**.
* **Model Serialization:** Persisted via Joblib in `artifacts/models/best_repayment_model.joblib`.

### Engine B: AI Financial Advisor & Document Processor
* **Deterministic Calculation Engine:** Pure arithmetic for FOIR (EMI-to-income), monthly surplus, projected surplus, and stress testing. Zero arithmetic delegated to LLMs.
* **Document Intelligence:** Secure private storage in `storage/documents/`, PDF text extraction via PyPDF, entity extraction for net salary, employer, and existing EMIs with confidence scores.
* **AI Advisor Service:** Report generation with structured 30/60/90-day action plans and conversational report-aware chatbot with zero-downtime fallback rules.

---

## 2. Project Directory Structure

```
loansaathi/backend/
├── app/
│   ├── main.py                     # Central FastAPI application & CORS
│   ├── core/
│   │   ├── config.py               # Settings & LLM provider configurations
│   │   └── security.py             # Auth & file upload validation
│   ├── api/
│   │   └── routes/
│   │       ├── health.py           # GET /api/health
│   │       ├── dataset.py          # GET /api/dataset/profile, /statistics, /insights
│   │       ├── prediction.py       # POST /api/ml/predict, GET /api/ml/model-info
│   │       ├── financial.py        # POST /api/financial/analyze, /simulate
│   │       ├── documents.py        # POST /api/documents/upload, /status, /extracted-data
│   │       └── chat.py             # POST /api/ai/chat, /analyze
│   ├── schemas/
│   │   ├── prediction.py           # PredictionRequest & PredictionResponse Pydantic schemas
│   │   ├── financial.py            # Financial analysis & scenario simulation schemas
│   │   ├── report.py               # Structured AI advisor report schemas
│   │   └── chat.py                 # Chat request & response schemas
│   ├── services/
│   │   ├── model_service.py        # Joblib artifact loader & batch/single predictor
│   │   ├── financial_calculator.py # Deterministic math (FOIR, Surplus, Amortization)
│   │   ├── document_service.py     # PDF text extraction & private storage
│   │   └── ai_advisor.py           # Structured advisor report & conversational assistant
│   └── ml/
│       ├── train.py                # Stratified 5-Fold training script
│       ├── preprocess.py           # ColumnTransformer & feature definitions
│       └── ml_dataset_eda.py       # EDA chart generation & dataset profiler
├── data/
│   └── loan_dataset_20000.csv      # Decompressed historical loan repayment dataset
├── artifacts/
│   ├── eda/                        # 10 EDA charts + dataset_profile.json
│   └── models/                     # Trained Joblib model pipelines & metadata
├── tests/
│   ├── test_engine.py              # Amortization, FOIR & Passport tests
│   └── test_ml_and_api.py          # 14 unit & integration tests covering all endpoints
└── requirements.txt
```

---

## 3. API Endpoints

### System & Health
* `GET /api/health` — Returns application status, loaded ML model status, and dataset availability.

### Dataset & Exploratory Analysis
* `GET /api/dataset/profile` — Full machine-readable dataset profile and distribution statistics.
* `GET /api/dataset/statistics` — Quantile distributions, mean, and standard deviation per feature.
* `GET /api/dataset/insights` — Correlations with repayment, demographic audit, and key drivers.

### Machine Learning Predictions
* `POST /api/ml/predict` — Predicts historical repayment probability and influential risk factors.
* `GET /api/ml/model-info` — Returns model metadata, training configuration, and 5-fold CV comparisons.

### Financial Underwriting
* `POST /api/financial/analyze` — Computes FOIR %, disposable surplus, and financial health score.
* `POST /api/financial/simulate` — What-If simulator for income drops and proposed loan EMIs.

### Documents
* `POST /api/documents/upload` — Multipart PDF upload, text extraction, and entity parsing.
* `GET /api/documents/{id}/status` — Status check (`uploaded`, `completed`, `needs_review`).
* `GET /api/documents/{id}/extracted-data` — Structured extracted income, employer, and EMI values.
* `DELETE /api/documents/{id}` — Private storage deletion.

### AI Financial Advisor
* `POST /api/ai/analyze` — Generates structured 30/60/90-day improvement recommendations.
* `POST /api/ai/chat` — Context-aware financial guidance chatbot.

---

## 4. How to Run & Test

### Run FastAPI Server
```powershell
cd loansaathi/backend
python -m uvicorn main:app --reload --port 8000
```
* **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Run Automated Test Suite
```powershell
cd loansaathi/backend
python -m pytest -v
```
*(All 30 unit and integration tests execute and pass).*

