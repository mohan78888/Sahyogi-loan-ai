"""
Exploratory Data Analysis (EDA) and Dataset Audit for Sahyogi Loan AI
Analyzes loan_dataset_20000.csv, validates data integrity, computes statistics,
and generates charts + machine-readable profile in artifacts/eda/.
"""
import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

DATA_PATH = r"c:\Users\user\Downloads\loansaathi\loansaathi\backend\data\loan_dataset_20000.csv"
EDA_DIR = r"c:\Users\user\Downloads\loansaathi\loansaathi\backend\artifacts\eda"
os.makedirs(EDA_DIR, exist_ok=True)

def run_dataset_audit():
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    total_records = len(df)
    total_cols = len(df.columns)
    print(f"Loaded {total_records} rows, {total_cols} columns.")

    # 1. Missing Values
    null_counts = df.isnull().sum().to_dict()
    has_nulls = df.isnull().values.any()

    # 2. Duplicate Records
    duplicates = int(df.duplicated().sum())

    # 3. Data Types
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

    # 4. Target Distribution
    target_counts = df['loan_paid_back'].value_counts().to_dict()
    repayment_rate = float(df['loan_paid_back'].mean())

    # 5. Annual vs Monthly Income Consistency
    # Check ratio annual_income / monthly_income
    income_ratio = df['annual_income'] / df['monthly_income']
    ratio_mean = float(income_ratio.mean())
    ratio_std = float(income_ratio.std())
    ratio_exact_12 = int(np.isclose(income_ratio, 12.0, atol=0.05).sum())
    income_consistency = {
        "expected_ratio": 12.0,
        "observed_mean_ratio": round(ratio_mean, 4),
        "observed_std_ratio": round(ratio_std, 4),
        "records_matching_ratio_12": ratio_exact_12,
        "is_consistent": bool(ratio_exact_12 == total_records)
    }

    # 6. Currency and Demographics Audit
    sensitive_features = ['age', 'gender', 'marital_status', 'education_level']
    leakage_features = ['grade_subgrade', 'interest_rate']
    
    # 7. Numerical Summary Stats
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    summary_stats = {}
    for col in num_cols:
        summary_stats[col] = {
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "mean": round(float(df[col].mean()), 2),
            "median": round(float(df[col].median()), 2),
            "std": round(float(df[col].std()), 2),
            "q25": round(float(df[col].quantile(0.25)), 2),
            "q75": round(float(df[col].quantile(0.75)), 2)
        }

    # 8. Correlations with Target
    corrs = df[num_cols].corr()['loan_paid_back'].sort_values(ascending=False).to_dict()
    corrs = {k: round(float(v), 4) for k, v in corrs.items()}

    profile = {
        "dataset_name": "loan_dataset_20000.csv",
        "total_rows": total_records,
        "total_columns": total_cols,
        "has_missing_values": bool(has_nulls),
        "missing_values_by_column": null_counts,
        "duplicate_rows": duplicates,
        "target_column": "loan_paid_back",
        "target_distribution": {
            "repaid_count_1": int(target_counts.get(1, 0)),
            "default_count_0": int(target_counts.get(0, 0)),
            "repayment_rate_pct": round(repayment_rate * 100, 2),
            "default_rate_pct": round((1 - repayment_rate) * 100, 2),
            "class_balance": f"{round(repayment_rate*100, 1)}% Repaid vs {round((1-repayment_rate)*100, 1)}% Default"
        },
        "income_consistency_check": income_consistency,
        "sensitive_demographic_features": sensitive_features,
        "potential_leakage_features": leakage_features,
        "column_data_types": dtypes,
        "summary_statistics": summary_stats,
        "correlation_with_target": corrs
    }

    # Save Profile
    profile_path = os.path.join(EDA_DIR, "dataset_profile.json")
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)
    print(f"Dataset profile saved: {profile_path}")

    # Generate Visualizations
    plt.style.use('default')
    
    # Chart 1: Target Distribution
    fig, ax = plt.subplots(figsize=(6, 5))
    bars = ax.bar(['Repaid (1)', 'Not Repaid (0)'], 
                  [target_counts.get(1, 0), target_counts.get(0, 0)], 
                  color=['#10B981', '#EF4444'], width=0.5, edgecolor='#334155')
    for bar in bars:
        yval = bar.get_height()
        pct = (yval / total_records) * 100
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 200, f"{yval:,}\n({pct:.1f}%)", ha='center', va='bottom', fontweight='bold', fontsize=11)
    ax.set_title("Target Distribution: loan_paid_back (Imbalanced ~80/20)", fontsize=13, fontweight='bold', pad=15)
    ax.set_ylabel("Number of Borrowers", fontsize=11)
    ax.set_ylim(0, total_records * 0.95)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "01_target_distribution.png"), dpi=200)
    plt.close()

    # Chart 2: Credit Score Distribution
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(df[df['loan_paid_back'] == 1]['credit_score'], bins=30, alpha=0.6, color='#10B981', label='Repaid (1)', edgecolor='white')
    ax.hist(df[df['loan_paid_back'] == 0]['credit_score'], bins=30, alpha=0.6, color='#EF4444', label='Not Repaid (0)', edgecolor='white')
    ax.set_title("Credit Score Distribution by Repayment Status", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("Credit Score", fontsize=11)
    ax.set_ylabel("Count", fontsize=11)
    ax.legend(frameon=True)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "02_credit_score_distribution.png"), dpi=200)
    plt.close()

    # Chart 3: Income Distribution
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    ax1.hist(df['monthly_income'], bins=40, color='#3B82F6', edgecolor='white', alpha=0.8)
    ax1.set_title("Monthly Income Distribution", fontsize=12, fontweight='bold')
    ax1.set_xlabel("Monthly Income", fontsize=10)
    ax1.set_ylabel("Count", fontsize=10)
    ax1.grid(axis='y', linestyle='--', alpha=0.5)

    ax2.hist(np.log1p(df['annual_income']), bins=40, color='#6366F1', edgecolor='white', alpha=0.8)
    ax2.set_title("Log(1 + Annual Income) Distribution", fontsize=12, fontweight='bold')
    ax2.set_xlabel("Log-Transformed Annual Income", fontsize=10)
    ax2.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "03_income_distribution.png"), dpi=200)
    plt.close()

    # Chart 4: Debt-to-Income Ratio Distribution
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(df['debt_to_income_ratio'], bins=35, color='#F59E0B', edgecolor='white', alpha=0.85)
    ax.axvline(df['debt_to_income_ratio'].median(), color='#DC2626', linestyle='--', linewidth=2, label=f"Median: {df['debt_to_income_ratio'].median():.2f}")
    ax.set_title("Debt-to-Income (DTI) Ratio Distribution", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("Debt-to-Income Ratio", fontsize=11)
    ax.set_ylabel("Frequency", fontsize=11)
    ax.legend()
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "04_dti_distribution.png"), dpi=200)
    plt.close()

    # Chart 5: Interest Rate Distribution
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(df[df['loan_paid_back'] == 1]['interest_rate'], bins=30, alpha=0.6, color='#10B981', label='Repaid (1)', edgecolor='white')
    ax.hist(df[df['loan_paid_back'] == 0]['interest_rate'], bins=30, alpha=0.6, color='#EF4444', label='Not Repaid (0)', edgecolor='white')
    ax.set_title("Interest Rate Distribution by Outcome (Potential Target Leakage)", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("Interest Rate (%)", fontsize=11)
    ax.set_ylabel("Count", fontsize=11)
    ax.legend()
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "05_interest_rate_distribution.png"), dpi=200)
    plt.close()

    # Chart 6: Loan Amount Distribution
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(df['loan_amount'], bins=35, color='#8B5CF6', edgecolor='white', alpha=0.85)
    ax.axvline(df['loan_amount'].mean(), color='#F59E0B', linestyle='--', linewidth=2, label=f"Mean: {df['loan_amount'].mean():,.0f}")
    ax.set_title("Loan Amount Distribution", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("Loan Amount", fontsize=11)
    ax.set_ylabel("Count", fontsize=11)
    ax.legend()
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "06_loan_amount_distribution.png"), dpi=200)
    plt.close()

    # Chart 7: Repayment Rate by Credit Score Band
    bins = [300, 580, 670, 740, 800, 900]
    labels = ['Poor (<580)', 'Fair (580-669)', 'Good (670-739)', 'Very Good (740-799)', 'Exceptional (800+)']
    df['credit_band'] = pd.cut(df['credit_score'], bins=bins, labels=labels, right=False)
    band_rates = df.groupby('credit_band', observed=False)['loan_paid_back'].agg(['mean', 'count'])
    
    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.bar(band_rates.index.astype(str), band_rates['mean'] * 100, color='#3B82F6', width=0.55, edgecolor='#1E3A8A')
    for bar, count in zip(bars, band_rates['count']):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{yval:.1f}%\n(n={count})", ha='center', va='bottom', fontsize=9, fontweight='bold')
    ax.set_title("Repayment Rate by Credit Score Band", fontsize=13, fontweight='bold', pad=15)
    ax.set_ylabel("Repayment Rate (%)", fontsize=11)
    ax.set_ylim(0, 110)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "07_repayment_by_credit_band.png"), dpi=200)
    plt.close()

    # Chart 8: Repayment Rate by DTI Band
    dti_bins = [0, 0.15, 0.30, 0.45, 1.0]
    dti_labels = ['Low (<15%)', 'Moderate (15-30%)', 'High (30-45%)', 'Critical (>45%)']
    df['dti_band'] = pd.cut(df['debt_to_income_ratio'], bins=dti_bins, labels=dti_labels, right=False)
    dti_rates = df.groupby('dti_band', observed=False)['loan_paid_back'].agg(['mean', 'count'])
    
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(dti_rates.index.astype(str), dti_rates['mean'] * 100, color='#F97316', width=0.5, edgecolor='#9A3412')
    for bar, count in zip(bars, dti_rates['count']):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{yval:.1f}%\n(n={count})", ha='center', va='bottom', fontsize=9, fontweight='bold')
    ax.set_title("Repayment Rate by Debt-to-Income (DTI) Band", fontsize=13, fontweight='bold', pad=15)
    ax.set_ylabel("Repayment Rate (%)", fontsize=11)
    ax.set_ylim(0, 110)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "08_repayment_by_dti_band.png"), dpi=200)
    plt.close()

    # Chart 9: Correlation Matrix
    fig, ax = plt.subplots(figsize=(10, 8))
    corr_mat = df[num_cols].corr()
    cax = ax.matshow(corr_mat, cmap='coolwarm', vmin=-1, vmax=1)
    fig.colorbar(cax, shrink=0.8)
    ticks = np.arange(len(num_cols))
    ax.set_xticks(ticks)
    ax.set_yticks(ticks)
    ax.set_xticklabels(num_cols, rotation=90, fontsize=8)
    ax.set_yticklabels(num_cols, fontsize=8)
    ax.set_title("Correlation Matrix of Numerical Features", fontsize=13, fontweight='bold', pad=25)
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "09_correlation_matrix.png"), dpi=200)
    plt.close()

    # Chart 10: Multi-panel Feature Relationships
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    # 1. Delinquency history vs repayment rate
    delinq_rates = df.groupby('delinquency_history', observed=False)['loan_paid_back'].mean() * 100
    axes[0, 0].bar([str(x) for x in delinq_rates.index], delinq_rates.values, color='#EF4444', width=0.4)
    axes[0, 0].set_title("Repayment Rate by Delinquency History Flag", fontweight='bold')
    axes[0, 0].set_ylabel("Repayment Rate (%)")
    axes[0, 0].set_ylim(0, 100)
    axes[0, 0].grid(axis='y', linestyle='--', alpha=0.5)

    # 2. Public Records vs repayment rate
    pub_rates = df.groupby('public_records', observed=False)['loan_paid_back'].mean() * 100
    axes[0, 1].bar([str(x) for x in pub_rates.index], pub_rates.values, color='#F59E0B', width=0.4)
    axes[0, 1].set_title("Repayment Rate by Public Records", fontweight='bold')
    axes[0, 1].set_ylabel("Repayment Rate (%)")
    axes[0, 1].set_ylim(0, 100)
    axes[0, 1].grid(axis='y', linestyle='--', alpha=0.5)

    # 3. Loan Term vs repayment rate
    term_rates = df.groupby('loan_term', observed=False)['loan_paid_back'].mean() * 100
    axes[1, 0].bar([f"{x} mo" for x in term_rates.index], term_rates.values, color='#3B82F6', width=0.4)
    axes[1, 0].set_title("Repayment Rate by Loan Term", fontweight='bold')
    axes[1, 0].set_ylabel("Repayment Rate (%)")
    axes[1, 0].set_ylim(0, 100)
    axes[1, 0].grid(axis='y', linestyle='--', alpha=0.5)

    # 4. Employment Status vs repayment rate
    emp_rates = df.groupby('employment_status', observed=False)['loan_paid_back'].mean() * 100
    axes[1, 1].bar(emp_rates.index.astype(str), emp_rates.values, color='#10B981', width=0.4)
    axes[1, 1].set_title("Repayment Rate by Employment Status", fontweight='bold')
    axes[1, 1].set_ylabel("Repayment Rate (%)")
    axes[1, 1].set_ylim(0, 100)
    axes[1, 1].grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, "10_feature_relationships.png"), dpi=200)
    plt.close()

    print("All 10 EDA charts generated successfully in artifacts/eda/")
    return profile

if __name__ == '__main__':
    run_dataset_audit()

