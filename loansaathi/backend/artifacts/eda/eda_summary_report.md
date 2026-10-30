# Sahyogi Loan AI — Exploratory Data Analysis & Dataset Audit

## Executive Summary
This document provides the formal audit and exploratory data analysis of the historical loan repayment dataset `loan_dataset_20000.csv` containing **20,000 records** and **22 columns**.

---

## 1. Dataset Integrity Audit

- **Total Observations:** 20,000
- **Total Features:** 21 predictors + 1 target (`loan_paid_back`)
- **Missing Values:** 0 across all 22 columns (100% complete)
- **Duplicate Records:** 0 duplicates detected
- **Annual vs Monthly Income Consistency:** Exactly `annual_income / monthly_income = 12.0` across 100% of rows (20,000 / 20,000).
- **Target Distribution:**
  - Repaid (`1`): 15,998 (79.99%)
  - Not Repaid / Default (`0`): 4,002 (20.01%)
  - **Class Balance:** Imbalanced ~80:20. Accuracy alone is misleading; models must be evaluated using Precision, Recall, F1-Score, and ROC-AUC.

---

## 2. Demographic & Leakage Feature Screening

### A. Protected Demographic Features (To Exclude from Lending Model)
Under ethical AI and fair lending guidelines (ECOA, RBI guidelines), the following columns will be excluded from the core scoring feature set:
- `age`
- `gender`
- `marital_status`
- `education_level`

### B. Target Leakage Screening
- `grade_subgrade`: An underwriting outcome assigned after assessing risk.
- `interest_rate`: Derived post-hoc based on perceived borrower risk ($r = -0.1109$).
*Architecture recommendation:* Train baseline models with and without post-hoc underwriting markers to evaluate clean pre-underwriting predictive power.

---

## 3. Key Feature Drivers of Repayment

1. **Debt-to-Income Ratio (DTI):** Strongest negative linear correlation with repayment ($r = -0.2238$). Repayment rates fall sharply as DTI exceeds 35-40%.
2. **Credit Score:** Strongest positive correlation ($r = +0.1998$). Borrowers with credit scores >740 show >90% repayment probability, whereas <580 exhibits elevated default risk.
3. **Delinquency History & Count:** Negative correlation ($r = -0.0849$, $r = -0.0709$). Prior delinquencies directly depress repayment rates.
4. **Loan Term:** 36-month loans have a slightly higher repayment completion rate compared to 60-month tenures.

---

## 4. Generated EDA Artifacts

All charts generated at 200 DPI in `backend/artifacts/eda/`:
1. `01_target_distribution.png`: Class balance breakdown (79.99% vs 20.01%).
2. `02_credit_score_distribution.png`: Score distributions grouped by repayment outcome.
3. `03_income_distribution.png`: Raw monthly income vs log annual income.
4. `04_dti_distribution.png`: DTI spread with median line ($0.16$).
5. `05_interest_rate_distribution.png`: Interest rate distributions for repaid vs default.
6. `06_loan_amount_distribution.png`: Requested principal amounts with mean ($15,129).
7. `07_repayment_by_credit_band.png`: Repayment % across Poor, Fair, Good, Very Good, Exceptional bands.
8. `08_repayment_by_dti_band.png`: Repayment % across Low, Moderate, High, and Critical DTI brackets.
9. `09_correlation_matrix.png`: Heatmap across all numerical features.
10. `10_feature_relationships.png`: 4-quadrant feature effect panel (Delinquencies, Public Records, Term, Employment).
11. `dataset_profile.json`: Machine-readable audit specifications.

