import React from "react";
import { ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { useWebFinance } from "../WebFinanceContext";

export default function PredictionView() {
  const {
    source,
    inputs,
    calculations,
    hasData,
    setActiveTab,
  } = useWebFinance();

  const isDemo = source === "demo";
  const repaidPct = hasData ? (isDemo ? 81 : 84) : null;
  const notRepaidPct = hasData ? (isDemo ? 19 : 16) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header matching Page 5 */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0D332A] tracking-tight">
          Historical repayment pattern
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Based on 20,000 past loans. This is not an approval decision.
        </p>
      </div>

      {/* Middle 2-Column Section matching Page 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Similar past profiles Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Similar past profiles
            </span>

            <h3 className="font-serif text-2xl font-bold text-[#0D332A]">
              {hasData ? "Similar to loans that were repaid" : "Pattern check pending"}
            </h3>

            {hasData ? (
              <div className="space-y-4 pt-2">
                {/* Repaid probability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">Repaid pattern</span>
                    <span className="text-[#0D332A]">{repaidPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D332A] rounded-full transition-all duration-500"
                      style={{ width: `${repaidPct}%` }}
                    />
                  </div>
                </div>

                {/* Not repaid probability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">Not repaid pattern</span>
                    <span className="text-[#B45309]">{notRepaidPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B45309] rounded-full transition-all duration-500"
                      style={{ width: `${notRepaidPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 leading-relaxed py-4">
                Add your monthly income and debt details to compare against historical repayment outcomes.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400">
            Model v1.0.0 · Random Forest (Pre-underwriting features)
          </div>
        </div>

        {/* Right Column: What influenced this Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#0D332A]">
              What influenced this
            </h3>

            <div className="space-y-4 pt-1">
              {/* Factor 1: Credit Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Credit score</span>
                  <span className="text-[#0D332A] text-[11px] font-semibold">
                    {inputs.creditScore ? `Score ${inputs.creditScore}` : "Not provided (profile avg)"}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0D332A] rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              {/* Factor 2: Debt-to-income ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Debt-to-income ratio</span>
                  <span className="text-[#B45309] text-[11px] font-semibold">
                    {calculations.emiToIncomePct ? `${calculations.emiToIncomePct}% burden` : "32%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B45309] rounded-full" style={{ width: "65%" }} />
                </div>
              </div>

              {/* Factor 3: Loan amount */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Loan amount</span>
                  <span className="text-stone-500 text-[11px]">
                    {inputs.loanAmount ? `₹${inputs.loanAmount.toLocaleString("en-IN")}` : "Not provided"}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0D332A] rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              {/* Factor 4: Past delinquencies */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Past delinquencies</span>
                  <span className="text-[#0D332A] text-[11px] font-semibold">0 missed</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-300 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
            Influence shows association, not cause.
          </p>
        </div>
      </div>

      {/* Bottom Amber Limitations Card matching Page 5 */}
      <div className="bg-[#FAF8F1] border border-[#EADBBD] rounded-3xl p-6 space-y-2">
        <h4 className="font-serif text-base font-bold text-[#7A5B18]">
          Limitations
        </h4>
        <ul className="space-y-1.5 text-xs text-[#7A5B18] leading-relaxed">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Not a bank decision or a credit score.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Learned from historical data only.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Sensitive traits like gender and age are excluded.</span>
          </li>
        </ul>
      </div>

      {/* Button: See my AI report */}
      <div>
        <button
          onClick={() => setActiveTab("report")}
          className="bg-[#0D332A] text-white text-xs md:text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#15463A] transition-colors shadow-sm flex items-center gap-2"
        >
          <span>See my AI report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

