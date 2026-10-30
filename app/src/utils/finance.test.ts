/**
 * Unit test suite for Sahyogi Loan AI pure financial calculations.
 * Run directly with Node.js to verify mathematical invariants.
 */

import {
  calculateEmiToIncomePercent,
  calculateMonthlySurplus,
  calculateSurplusAfterNewEmi,
  calculateDocumentCompleteness,
  calculateFinances,
  compareScenarios,
} from './finance';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runFinanceTests() {
  console.log('Running Sahyogi Loan AI Finance Calculation Tests...');

  // 1. Normal case (Hackathon Acceptance Requirement: 50000 / 20000 / 10000)
  const normal = calculateFinances({
    income: 50000,
    expenses: 20000,
    existingEmi: 10000,
    proposedEmi: 5000,
  }, 2);

  assert(normal.hasData === true, 'Normal case should have data');
  assert(normal.monthlySurplus === 20000, `Expected surplus 20000, got ${normal.monthlySurplus}`);
  assert(normal.emiToIncomePct === 20.0, `Expected EMI-to-income 20.0%, got ${normal.emiToIncomePct}`);
  assert(normal.surplusAfterNewEmi === 15000, `Expected surplus after new EMI 15000, got ${normal.surplusAfterNewEmi}`);
  assert(normal.documentCompletenessPct === 40, `Expected completeness 40%, got ${normal.documentCompletenessPct}`);
  console.log('✔ Test 1 Passed: Normal case (50k/20k/10k -> 20k surplus, 20% EMI ratio)');

  // 2. Zero income case (Never returns NaN or Infinity)
  const zeroIncome = calculateFinances({
    income: 0,
    expenses: 20000,
    existingEmi: 10000,
  });

  assert(zeroIncome.hasData === false, 'Zero income should not have data');
  assert(zeroIncome.monthlySurplus === null, 'Monthly surplus should be null on zero income');
  assert(zeroIncome.emiToIncomePct === null, 'EMI to income should be null on zero income');
  assert(calculateEmiToIncomePercent(10000, 0) === null, 'calculateEmiToIncomePercent should return null on 0 income');
  assert(calculateMonthlySurplus(0, 10000, 5000) === null, 'calculateMonthlySurplus should return null on 0 income');
  console.log('✔ Test 2 Passed: Zero income safely returns null (No NaN or Infinity)');

  // 3. Missing fields (null or undefined)
  const missingInputs = calculateFinances({
    income: null,
    expenses: undefined,
  });

  assert(missingInputs.hasData === false, 'Missing income should not have data');
  assert(missingInputs.monthlySurplus === null, 'Surplus should be null when income is missing');
  assert(missingInputs.emiToIncomePct === null, 'EMI-to-income should be null when income is missing');
  console.log('✔ Test 3 Passed: Missing / null fields safely handled');

  // 4. Negative surplus (Expenses + EMI > Income)
  const deficit = calculateFinances({
    income: 30000,
    expenses: 25000,
    existingEmi: 10000,
  });

  assert(deficit.hasData === true, 'Deficit profile still has valid data');
  assert(deficit.monthlySurplus === -5000, `Expected deficit -5000, got ${deficit.monthlySurplus}`);
  assert(deficit.emiToIncomePct === 33.3, `Expected EMI ratio 33.3%, got ${deficit.emiToIncomePct}`);
  console.log('✔ Test 4 Passed: Negative surplus correctly computed (-5000)');

  // 5. Scenario comparison (Live live what-if)
  const comparison = compareScenarios(
    { income: 60000, expenses: 25000, existingEmi: 16500, proposedEmi: 12300 },
    { income: 65000, expenses: 22000, existingEmi: 16500, proposedEmi: 10000 }
  );

  assert(comparison.change.monthlySurplusDiff === 8000, 'Expected surplus diff +8000');
  assert(comparison.change.emiToIncomeDiffPts === -2.1, 'Expected EMI diff -2.1 pts');
  console.log('✔ Test 5 Passed: Scenario comparison correctly calculates differences');

  console.log('🎉 ALL 5 FINANCE CALCULATION TESTS PASSED SUCCESSFULLY!');
  return true;
}

runFinanceTests();
