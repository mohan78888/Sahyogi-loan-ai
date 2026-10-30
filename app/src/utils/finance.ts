/**
 * Financial calculations engine for Sahyogi Loan AI.
 * Deterministic pure mathematical formulas matching exact lending assessment rules.
 * Never uses AI for arithmetic calculations.
 */

export interface FinancialInputs {
  income?: number | null;
  expenses?: number | null;
  existingEmi?: number | null;
  proposedEmi?: number | null;
  creditScore?: number | null;
  loanAmount?: number | null;
  employmentStatus?: string | null;
}

export interface CalculationResult {
  monthlySurplus: number | null;
  emiToIncomePct: number | null;
  surplusAfterNewEmi: number | null;
  documentCompletenessPct: number;
  hasData: boolean;
  errorMessage?: string;
}

export interface ScenarioComparison {
  baseline: {
    emiToIncomePct: number;
    monthlySurplus: number;
    surplusAfterNewEmi: number;
  };
  scenario: {
    emiToIncomePct: number;
    monthlySurplus: number;
    surplusAfterNewEmi: number;
  };
  change: {
    emiToIncomeDiffPts: number;
    monthlySurplusDiff: number;
    surplusAfterNewEmiDiff: number;
  };
}

/**
 * Calculates existing EMI-to-income percentage.
 * Returns null if income is missing, 0, or negative. Never returns NaN or Infinity.
 */
export function calculateEmiToIncomePercent(
  existingEmi: number | null | undefined,
  income: number | null | undefined
): number | null {
  if (income === null || income === undefined || isNaN(income) || income <= 0) {
    return null;
  }
  const emi = existingEmi === null || existingEmi === undefined || isNaN(existingEmi) ? 0 : Math.max(0, existingEmi);
  const ratio = (emi / income) * 100;
  return Number(ratio.toFixed(1));
}

/**
 * Calculates monthly surplus (disposable income after living expenses & debt obligations).
 * monthlySurplus = income - expenses - existingEmi
 * Returns null if income is missing, 0, or negative.
 */
export function calculateMonthlySurplus(
  income: number | null | undefined,
  expenses: number | null | undefined,
  existingEmi: number | null | undefined
): number | null {
  if (income === null || income === undefined || isNaN(income) || income <= 0) {
    return null;
  }
  const exp = expenses === null || expenses === undefined || isNaN(expenses) ? 0 : expenses;
  const emi = existingEmi === null || existingEmi === undefined || isNaN(existingEmi) ? 0 : existingEmi;
  const surplus = income - exp - emi;
  return Math.round(surplus);
}

/**
 * Calculates remaining buffer after proposed new EMI obligation.
 * surplusAfterNewEmi = monthlySurplus - proposedEmi
 * Returns null if monthly surplus is null.
 */
export function calculateSurplusAfterNewEmi(
  surplus: number | null | undefined,
  proposedEmi: number | null | undefined
): number | null {
  if (surplus === null || surplus === undefined || isNaN(surplus)) {
    return null;
  }
  const newEmi = proposedEmi === null || proposedEmi === undefined || isNaN(proposedEmi) ? 0 : proposedEmi;
  return Math.round(surplus - newEmi);
}

/**
 * Calculates document confirmation completeness percentage (out of total 5 required documents).
 */
export function calculateDocumentCompleteness(confirmedCount: number, totalCount = 5): number {
  if (!confirmedCount || confirmedCount <= 0) return 0;
  return Math.min(100, Math.round((confirmedCount / totalCount) * 100));
}

/**
 * Comprehensive calculator wrapping pure functions.
 */
export function calculateFinances(inputs: FinancialInputs, confirmedDocsCount = 0): CalculationResult {
  const { income, expenses, existingEmi, proposedEmi = 0 } = inputs;

  const hasData = income !== null && income !== undefined && !isNaN(income) && income > 0;

  if (!hasData) {
    return {
      monthlySurplus: null,
      emiToIncomePct: null,
      surplusAfterNewEmi: null,
      documentCompletenessPct: calculateDocumentCompleteness(confirmedDocsCount),
      hasData: false,
      errorMessage: 'Add financial details to calculate',
    };
  }

  const emiPct = calculateEmiToIncomePercent(existingEmi, income);
  const surplus = calculateMonthlySurplus(income, expenses, existingEmi);
  const afterNew = calculateSurplusAfterNewEmi(surplus, proposedEmi);

  return {
    monthlySurplus: surplus,
    emiToIncomePct: emiPct,
    surplusAfterNewEmi: afterNew,
    documentCompletenessPct: calculateDocumentCompleteness(confirmedDocsCount),
    hasData: true,
  };
}

/**
 * Compares baseline and scenario figures for the what-if simulator.
 */
export function compareScenarios(
  baselineInputs: FinancialInputs,
  scenarioInputs: FinancialInputs
): ScenarioComparison {
  const baseCalc = calculateFinances(baselineInputs);
  const scenCalc = calculateFinances(scenarioInputs);

  const baseEmiPct = baseCalc.emiToIncomePct ?? 0;
  const baseSurplus = baseCalc.monthlySurplus ?? 0;
  const baseAfterNew = baseCalc.surplusAfterNewEmi ?? 0;

  const scenEmiPct = scenCalc.emiToIncomePct ?? 0;
  const scenSurplus = scenCalc.monthlySurplus ?? 0;
  const scenAfterNew = scenCalc.surplusAfterNewEmi ?? 0;

  return {
    baseline: {
      emiToIncomePct: baseEmiPct,
      monthlySurplus: baseSurplus,
      surplusAfterNewEmi: baseAfterNew,
    },
    scenario: {
      emiToIncomePct: scenEmiPct,
      monthlySurplus: scenSurplus,
      surplusAfterNewEmi: scenAfterNew,
    },
    change: {
      emiToIncomeDiffPts: Number((scenEmiPct - baseEmiPct).toFixed(1)),
      monthlySurplusDiff: scenSurplus - baseSurplus,
      surplusAfterNewEmiDiff: scenAfterNew - baseAfterNew,
    },
  };
}

/**
 * Formats numbers into Indian Rupee strings with ₹ prefix.
 */
export function formatRupee(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toLocaleString('en-IN');
  return isNegative ? `−₹${absFormatted}` : `₹${absFormatted}`;
}

/**
 * Signed difference formatter (e.g. +₹8,000 or −₹2,000).
 */
export function formatRupeeDiff(diff: number): string {
  if (diff > 0) {
    return `+₹${diff.toLocaleString('en-IN')}`;
  }
  if (diff < 0) {
    return `−₹${Math.abs(diff).toLocaleString('en-IN')}`;
  }
  return '₹0';
}
