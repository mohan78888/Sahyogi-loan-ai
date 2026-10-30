"""
Model training and evaluation pipeline for Sahyogi Loan AI.
Trains and compares Logistic Regression and Random Forest models on historical repayment outcomes.
Generates metrics, feature importances, and saved Joblib artifacts in artifacts/models/.
"""
import os
import sys
import json
import joblib

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    roc_curve,
)

from ml.preprocess import (
    create_preprocessor,
    prepare_dataset,
    CLEAN_NUMERIC_FEATURES,
    CLEAN_CATEGORICAL_FEATURES,
)

DATA_PATH = r"c:\Users\user\Downloads\loansaathi\loansaathi\backend\data\loan_dataset_20000.csv"
MODELS_DIR = r"c:\Users\user\Downloads\loansaathi\loansaathi\backend\artifacts\models"
os.makedirs(MODELS_DIR, exist_ok=True)


def evaluate_model_performance(model_name: str, pipeline, X_train, y_train, X_test, y_test, cv_folds: int = 5):
    """Computes cross-validated and held-out test evaluation metrics."""
    # 1. 5-Fold Stratified Cross Validation on Train Split
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    cv_results = cross_validate(pipeline, X_train, y_train, cv=skf, scoring=scoring, n_jobs=-1)

    # 2. Fit on Full Train Split
    pipeline.fit(X_train, y_train)

    # 3. Predict on Test Split
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # Metrics
    test_acc = float(accuracy_score(y_test, y_pred))
    test_prec = float(precision_score(y_test, y_pred, zero_division=0))
    test_rec = float(recall_score(y_test, y_pred, zero_division=0))
    test_f1 = float(f1_score(y_test, y_pred, zero_division=0))
    test_auc = float(roc_auc_score(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    report = classification_report(y_test, y_pred, output_dict=True)

    metrics = {
        "model_name": model_name,
        "cv_metrics_mean": {
            "accuracy": round(float(np.mean(cv_results["test_accuracy"])), 4),
            "precision": round(float(np.mean(cv_results["test_precision"])), 4),
            "recall": round(float(np.mean(cv_results["test_recall"])), 4),
            "f1": round(float(np.mean(cv_results["test_f1"])), 4),
            "roc_auc": round(float(np.mean(cv_results["test_roc_auc"])), 4),
        },
        "test_metrics": {
            "accuracy": round(test_acc, 4),
            "precision": round(test_prec, 4),
            "recall": round(test_rec, 4),
            "f1": round(test_f1, 4),
            "roc_auc": round(test_auc, 4),
        },
        "confusion_matrix": {
            "true_negatives_default_detected": tn,
            "false_positives_predicted_repaid_but_defaulted": fp,
            "false_negatives_predicted_default_but_repaid": fn,
            "true_positives_repaid_detected": tp,
        },
        "classification_report": report,
    }
    return pipeline, metrics, y_prob


def run_training_pipeline():
    print("Loading loan dataset for ML training...")
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset shape: {df.shape}")

    # ==========================================
    # 1. Config A: Clean Pre-underwriting Features
    # ==========================================
    print("\n--- Training Model Configuration A (Fair-Lending & Clean Pre-underwriting) ---")
    X_clean, y = prepare_dataset(df, include_leakage=False)
    X_tr_c, X_te_c, y_tr, y_te = train_test_split(
        X_clean, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_tr_c)}, Test samples: {len(X_te_c)}")

    prep_clean, num_cols_clean, cat_cols_clean = create_preprocessor(include_leakage=False)

    # Model 1: Logistic Regression
    lr_pipeline = Pipeline([
        ("preprocessor", prep_clean),
        ("classifier", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")),
    ])
    print("Training Logistic Regression (Clean)...")
    lr_clean_model, lr_clean_metrics, lr_clean_probs = evaluate_model_performance(
        "Logistic Regression (Pre-Underwriting Clean)", lr_pipeline, X_tr_c, y_tr, X_te_c, y_te
    )

    # Model 2: Random Forest
    rf_pipeline = Pipeline([
        ("preprocessor", prep_clean),
        ("classifier", RandomForestClassifier(
            n_estimators=150, max_depth=12, min_samples_split=6, random_state=42, n_jobs=-1, class_weight="balanced"
        )),
    ])
    print("Training Random Forest (Clean)...")
    rf_clean_model, rf_clean_metrics, rf_clean_probs = evaluate_model_performance(
        "Random Forest Classifier (Pre-Underwriting Clean)", rf_pipeline, X_tr_c, y_tr, X_te_c, y_te
    )

    # ==========================================
    # 2. Config B: Target Leakage Investigation (with Grade & Interest Rate)
    # ==========================================
    print("\n--- Training Model Configuration B (Leakage Investigation with Interest Rate & Grade) ---")
    X_leak, _ = prepare_dataset(df, include_leakage=True)
    X_tr_l, X_te_l, _, _ = train_test_split(
        X_leak, y, test_size=0.20, random_state=42, stratify=y
    )
    prep_leak, _, _ = create_preprocessor(include_leakage=True)
    rf_leak_pipeline = Pipeline([
        ("preprocessor", prep_leak),
        ("classifier", RandomForestClassifier(
            n_estimators=150, max_depth=12, min_samples_split=6, random_state=42, n_jobs=-1, class_weight="balanced"
        )),
    ])
    rf_leak_model, rf_leak_metrics, rf_leak_probs = evaluate_model_performance(
        "Random Forest (With Underwriting Leakage Features)", rf_leak_pipeline, X_tr_l, y_tr, X_te_l, y_te
    )

    # ==========================================
    # 3. Model Comparison & Best Model Selection
    # ==========================================
    comparison = {
        "dataset": "loan_dataset_20000.csv",
        "train_samples": len(X_tr_c),
        "test_samples": len(X_te_c),
        "target": "loan_paid_back",
        "models": {
            "logistic_regression_clean": lr_clean_metrics,
            "random_forest_clean": rf_clean_metrics,
            "random_forest_with_leakage": rf_leak_metrics,
        },
        "target_leakage_analysis": {
            "clean_rf_roc_auc": rf_clean_metrics["test_metrics"]["roc_auc"],
            "leakage_rf_roc_auc": rf_leak_metrics["test_metrics"]["roc_auc"],
            "finding": (
                "Adding post-hoc underwriting features ('grade_subgrade', 'interest_rate') introduces target leakage, "
                "which superficially shifts AUC. To ensure ethical pre-application decision support, "
                "the clean pre-underwriting pipeline is chosen as production baseline."
            )
        }
    }

    # Best production model is the clean Random Forest
    best_model = rf_clean_model
    best_metrics = rf_clean_metrics

    # ==========================================
    # 4. Extract Feature Importances
    # ==========================================
    fitted_preprocessor = best_model.named_steps["preprocessor"]
    fitted_rf = best_model.named_steps["classifier"]

    # Transform feature names from preprocessor
    cat_encoder = fitted_preprocessor.named_transformers_["cat"]
    encoded_cat_names = cat_encoder.get_feature_names_out(CLEAN_CATEGORICAL_FEATURES).tolist()
    all_feature_names = CLEAN_NUMERIC_FEATURES + encoded_cat_names

    importances = fitted_rf.feature_importances_
    feat_imp = sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
    feat_imp_dict = {name: round(float(val), 5) for name, val in feat_imp}

    # Save feature importance chart
    top_feats = feat_imp[:12]
    names = [x[0] for x in top_feats][::-1]
    values = [x[1] for x in top_feats][::-1]

    plt.figure(figsize=(9, 6))
    plt.barh(names, values, color="#3B82F6", edgecolor="#1E3A8A")
    plt.title("Top 12 Most Influential Features (Random Forest Repayment Model)", fontsize=12, fontweight="bold")
    plt.xlabel("Gini Feature Importance (MDI)")
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "feature_importance.png"), dpi=200)
    plt.close()

    # Save Confusion Matrix Plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5))
    cm_lr = np.array([[lr_clean_metrics["confusion_matrix"]["true_negatives_default_detected"],
                       lr_clean_metrics["confusion_matrix"]["false_positives_predicted_repaid_but_defaulted"]],
                      [lr_clean_metrics["confusion_matrix"]["false_negatives_predicted_default_but_repaid"],
                       lr_clean_metrics["confusion_matrix"]["true_positives_repaid_detected"]]])

    cm_rf = np.array([[rf_clean_metrics["confusion_matrix"]["true_negatives_default_detected"],
                       rf_clean_metrics["confusion_matrix"]["false_positives_predicted_repaid_but_defaulted"]],
                      [rf_clean_metrics["confusion_matrix"]["false_negatives_predicted_default_but_repaid"],
                       rf_clean_metrics["confusion_matrix"]["true_positives_repaid_detected"]]])

    for ax, mat, title in [(ax1, cm_lr, "Logistic Regression CM"), (ax2, cm_rf, "Random Forest CM")]:
        cax = ax.matshow(mat, cmap="Blues", alpha=0.8)
        fig.colorbar(cax, ax=ax)
        for i in range(2):
            for j in range(2):
                ax.text(j, i, f"{mat[i, j]:,}", ha="center", va="center", color="black", fontweight="bold", fontsize=12)
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Pred 0 (Default)", "Pred 1 (Repaid)"])
        ax.set_yticklabels(["True 0 (Default)", "True 1 (Repaid)"])
        ax.set_title(title, fontweight="bold", pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "confusion_matrix.png"), dpi=200)
    plt.close()

    # Save ROC Curve Plot
    fpr_lr, tpr_lr, _ = roc_curve(y_te, lr_clean_probs)
    fpr_rf, tpr_rf, _ = roc_curve(y_te, rf_clean_probs)

    plt.figure(figsize=(7, 5.5))
    plt.plot(fpr_lr, tpr_lr, label=f"Logistic Regression (AUC = {lr_clean_metrics['test_metrics']['roc_auc']:.3f})", color="#F59E0B", linewidth=2)
    plt.plot(fpr_rf, tpr_rf, label=f"Random Forest (AUC = {rf_clean_metrics['test_metrics']['roc_auc']:.3f})", color="#10B981", linewidth=2)
    plt.plot([0, 1], [0, 1], "k--", alpha=0.5, label="Random Guess (AUC = 0.500)")
    plt.title("ROC-AUC Comparison (Held-Out Test Set)", fontsize=12, fontweight="bold")
    plt.xlabel("False Positive Rate (1 - Specificity)")
    plt.ylabel("True Positive Rate (Sensitivity / Recall)")
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "roc_curve.png"), dpi=200)
    plt.close()

    # ==========================================
    # 5. Persist Joblib Artifacts & Metadata
    # ==========================================
    joblib.dump(lr_clean_model, os.path.join(MODELS_DIR, "logistic_regression_clean.joblib"))
    joblib.dump(rf_clean_model, os.path.join(MODELS_DIR, "random_forest_clean.joblib"))
    joblib.dump(best_model, os.path.join(MODELS_DIR, "best_repayment_model.joblib"))

    # Feature List
    features_meta = {
        "numeric_features": CLEAN_NUMERIC_FEATURES,
        "categorical_features": CLEAN_CATEGORICAL_FEATURES,
        "encoded_feature_names": all_feature_names,
        "feature_importances": feat_imp_dict,
    }
    with open(os.path.join(MODELS_DIR, "feature_list.json"), "w", encoding="utf-8") as f:
        json.dump(features_meta, f, indent=2)

    # Comparison Meta
    with open(os.path.join(MODELS_DIR, "model_comparison.json"), "w", encoding="utf-8") as f:
        json.dump(comparison, f, indent=2)

    # Best Model Metadata
    model_metadata = {
        "best_model_name": "Random Forest Classifier (Clean Pre-underwriting)",
        "model_file": "best_repayment_model.joblib",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 150,
        "max_depth": 12,
        "class_weight": "balanced",
        "metrics": best_metrics,
        "target": "loan_paid_back",
        "ethical_compliance": "Demographic variables (age, gender, marital_status, education_level) strictly omitted.",
        "limitations": (
            "Predicts statistical probability of historical repayment based on credit and cashflow profiles. "
            "Does not constitute loan approval, bank underwriting guarantee, or official bureau assessment."
        )
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)

    print("\nTraining completed successfully! Saved artifacts to artifacts/models/:")
    print("  - best_repayment_model.joblib")
    print("  - logistic_regression_clean.joblib")
    print("  - random_forest_clean.joblib")
    print("  - model_comparison.json")
    print("  - model_metadata.json")
    print("  - feature_list.json")
    print("  - feature_importance.png")
    print("  - confusion_matrix.png")
    print("  - roc_curve.png")
    return comparison

if __name__ == "__main__":
    run_training_pipeline()
