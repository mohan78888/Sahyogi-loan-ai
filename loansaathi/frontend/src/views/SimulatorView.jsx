import React, { useState, useMemo } from "react";
import { Sliders, ArrowRight } from "lucide-react";
import { useWebFinance, formatINR } from "../WebFinanceContext";

export default function SimulatorView() {
  const { inputs, hasData, setActiveTab } = useWebFinance();

  const baseIncome = inputs.income || 50000;
  const baseExpenses = inputs.expenses || 20000;
  const baseExistingEmi = inputs.existingEmi || 10000;
  const baseProposedEmi = inputs.proposedEmi || 5000;

  const [simIncome, setSimIncome] = useState(baseIncome);
  const [simExpenses, setSimExpenses] = useState(baseExpenses);
  const [simExistingEmi, setSimExistingEmi] = useState(baseExistingEmi);
  const [simNewEmi, setSimNewEmi] = useState(baseProposedEmi);

  // Calculations
  const baselineSurplus = baseIncome - baseExpenses - baseExistingEmi;
  const baselineEmiPct = baseIncome > 0 ? Math.round((baseExistingEmi / baseIncome) * 1000) / 10 : 0;
  const baselineBufferAfter = baselineSurplus - baseProposedEmi;

  const scenarioSurplus = simIncome - simExpenses - simExistingEmi;
  const scenarioEmiPct = simIncome > 0 ? Math.round((simExistingEmi / simIncome) * 1000) / 10 : 0;
  const scenarioBufferAfter = scenarioSurplus - simNewEmi;

  const surplusDiff = scenarioSurplus - baselineSurplus;
  const emiDiffPts = Math.round((scenarioEmiPct - baselineEmiPct) * 10) / 10;
  const bufferDiff = scenarioBufferAfter - baselineBufferAfter;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0D332A] tracking-tight">
          What-if simulator
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Simulate income shocks, higher expenses, or different loan EMIs before committing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#0D332A]">
            Adjust scenario levers
          </h3>

          {/* Slider 1: Monthly income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Monthly income</span>
              <span className="text-[#0D332A]">{formatINR(simIncome)}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="200000"
              step="2000"
              value={simIncome}
              onChange={(e) => setSimIncome(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Living expenses */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Monthly living expenses</span>
              <span className="text-[#0D332A]">{formatINR(simExpenses)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={simExpenses}
              onChange={(e) => setSimExpenses(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3: Existing EMI */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Existing EMI obligations</span>
              <span className="text-[#0D332A]">{formatINR(simExistingEmi)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="60000"
              step="1000"
              value={simExistingEmi}
              onChange={(e) => setSimExistingEmi(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4: Proposed new EMI */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Proposed new EMI</span>
              <span className="text-[#0D332A]">{formatINR(simNewEmi)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={simNewEmi}
              onChange={(e) => setSimNewEmi(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Live Comparison Table */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#0D332A]">
              Baseline vs scenario comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="py-2.5">Measure</th>
                    <th className="py-2.5 text-right">Baseline</th>
                    <th className="py-2.5 text-right">Scenario</th>
                    <th className="py-2.5 text-right">Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  <tr>
                    <td className="py-3 font-medium">EMI-to-income</td>
                    <td className="py-3 text-right">{baselineEmiPct}%</td>
                    <td className="py-3 text-right font-bold">{scenarioEmiPct}%</td>
                    <td className={`py-3 text-right font-semibold ${emiDiffPts <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                      {emiDiffPts > 0 ? `+${emiDiffPts}` : emiDiffPts} pts
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-medium">Monthly surplus</td>
                    <td className="py-3 text-right">{formatINR(baselineSurplus)}</td>
                    <td className={`py-3 text-right font-bold ${scenarioSurplus < 0 ? "text-red-700" : "text-[#0D332A]"}`}>
                      {formatINR(scenarioSurplus)}
                    </td>
                    <td className={`py-3 text-right font-semibold ${surplusDiff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {surplusDiff >= 0 ? `+${formatINR(surplusDiff)}` : `-${formatINR(Math.abs(surplusDiff))}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-medium">After proposed EMI</td>
                    <td className="py-3 text-right">{formatINR(baselineBufferAfter)}</td>
                    <td className={`py-3 text-right font-bold ${scenarioBufferAfter < 0 ? "text-red-700" : "text-[#0D332A]"}`}>
                      {formatINR(scenarioBufferAfter)}
                    </td>
                    <td className={`py-3 text-right font-semibold ${bufferDiff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {bufferDiff >= 0 ? `+${formatINR(bufferDiff)}` : `-${formatINR(Math.abs(bufferDiff))}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {scenarioSurplus < 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">
                ⚠️ Spending is higher than income under this scenario. Consider reducing the proposed EMI.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("report")}
            className="w-full py-3 rounded-full bg-[#0D332A] text-white text-xs font-semibold hover:bg-[#15463A] transition-colors flex items-center justify-center gap-2"
          >
            <span>See full advice in AI report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

