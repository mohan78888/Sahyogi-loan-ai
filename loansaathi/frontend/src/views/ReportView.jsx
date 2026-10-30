import React from "react";
import { Download, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { useWebFinance, formatINR } from "../WebFinanceContext";

export default function ReportView() {
  const {
    source,
    inputs,
    calculations,
    hasData,
  } = useWebFinance();

  const income = inputs.income || 0;
  const expenses = inputs.expenses || 0;
  const existingEmi = inputs.existingEmi || 0;
  const proposedEmi = inputs.proposedEmi || 0;
  const monthlySurplus = calculations.monthlySurplus ?? (income - expenses - existingEmi);
  const emiPct = calculations.emiToIncomePct ?? (income > 0 ? Math.round((existingEmi / income) * 1000) / 10 : 0);
  const surplusAfterProposed = calculations.surplusAfterNewEmi ?? (monthlySurplus - proposedEmi);

  // Dynamic plain-language summary
  const summaryText = hasData
    ? `Your confirmed monthly income of ${formatINR(income)} covers your living expenses of ${formatINR(expenses)} and existing EMI obligations of ${formatINR(existingEmi)}, leaving an operating surplus of ${formatINR(monthlySurplus)}. Existing obligations take ${emiPct}% of monthly income. ${
        proposedEmi > 0
          ? surplusAfterProposed >= 0
            ? `Accounting for the proposed ${formatINR(proposedEmi)} EMI, your remaining monthly cushion is ${formatINR(surplusAfterProposed)}.`
            : `The proposed new EMI of ${formatINR(proposedEmi)} exceeds your monthly surplus by ${formatINR(Math.abs(surplusAfterProposed))}.`
          : "You have room to safely service new obligations if sized within your monthly surplus."
      }`
    : "No confirmed financial numbers have been added yet. Upload a bank statement or enter your numbers manually to generate a personalized report.";

  const strengthsText = hasData
    ? emiPct < 35
      ? `Positive monthly surplus of ${formatINR(monthlySurplus)}. Existing EMI-to-income ratio of ${emiPct}% is well within the healthy 35% benchmark.`
      : `Confirmed monthly income of ${formatINR(income)} provides steady cash inflows.`
    : "Positive cash flow when recurring obligations stay below 40% of earnings.";

  const riskText = hasData
    ? proposedEmi > 0 && surplusAfterProposed < 0
      ? `Proposed new EMI of ${formatINR(proposedEmi)} turns net surplus negative (${formatINR(surplusAfterProposed)}/mo).`
      : emiPct >= 40
      ? `Existing debt burden is ${emiPct}%, exceeding the recommended 40% threshold.`
      : `Surplus after debt obligations leaves limited room for sudden medical or household shocks.`
    : "High existing debt obligations reduce absorption room for emergency expenses.";

  const missingText = hasData
    ? "Other income sources, credit card balances, and a second consecutive bank statement month."
    : "Verified bank statements and confirmed salary slip credits.";

  const recommendations = [
    {
      period: "30 days · High",
      title: "Build a larger monthly buffer",
      action: "Trim discretionary living expenses to safeguard operating surplus before fresh commitments.",
      reason: "Ensures debt payments don't compromise emergency liquidity.",
    },
    {
      period: "60 days · Medium",
      title: "Review the new EMI size",
      action: "Use the what-if simulator to test lower EMI tenures that keep total debt ratio under 35%.",
      reason: "The monthly EMI size is the largest driver of financial stress.",
    },
    {
      period: "90 days · Low",
      title: "Confirm consecutive surplus",
      action: "Maintain 3 consecutive months of documented surplus and clean bank records.",
      reason: "Verifiable repayment track record gives lenders the highest confidence.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header Row matching Page 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#0D332A] tracking-tight">
            Your AI financial report
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-200 text-stone-700">
            {source === "demo" ? "Demo data" : hasData ? "Your data" : "Evaluation"}
          </span>
          <button
            onClick={() => window.print()}
            className="bg-[#0D332A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#15463A] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Card matching Page 3 */}
      <div className="bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-2">
        <h3 className="font-serif text-lg font-bold text-[#0D332A]">
          Summary
        </h3>
        <p className="text-sm text-stone-700 leading-relaxed">
          {summaryText}
        </p>
      </div>

      {/* 3 Callout Cards Row matching Page 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Strengths */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs space-y-3">
          <h4 className="font-serif text-base font-bold text-[#0D332A]">
            Strengths
          </h4>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span>{strengthsText}</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Risk indicators */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs space-y-3">
          <h4 className="font-serif text-base font-bold text-[#0D332A]">
            Risk indicators
          </h4>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span>{riskText}</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Missing information */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs space-y-3">
          <h4 className="font-serif text-base font-bold text-[#0D332A]">
            Missing information
          </h4>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span>{missingText}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recommendations Card matching Page 3 */}
      <div className="bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-5">
        <h3 className="font-serif text-lg font-bold text-[#0D332A]">
          Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#EAE8DF] space-y-2">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D332A] text-white">
                {rec.period}
              </span>
              <h5 className="font-serif text-sm font-bold text-[#0D332A] pt-1">
                {rec.title}
              </h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                {rec.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legal Disclaimer */}
      <p className="text-xs text-stone-500 text-center pt-2">
        Informational assessment only. Not a lender decision.
      </p>
    </div>
  );
}

