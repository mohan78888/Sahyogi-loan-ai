import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useWebFinance, formatINR } from "../WebFinanceContext";

export default function OverviewView({ onOpenManual }) {
  const {
    source,
    inputs,
    calculations,
    hasData,
    loadDemo,
  } = useWebFinance();

  const [propEmiSlider, setPropEmiSlider] = useState(inputs.proposedEmi || 5000);
  const [expSlider, setExpSlider] = useState(inputs.expenses || 20000);

  // Chat box state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "user",
      text: "Why is my EMI ratio flagged?",
    },
    {
      sender: "assistant",
      text: hasData
        ? `Your existing monthly EMI of ${formatINR(inputs.existingEmi)} consumes ${calculations.emiToIncomePct}% of your ${formatINR(inputs.income)} income. Financial institutions generally prefer debt obligations to stay below 40%.`
        : "Add your monthly income and EMI details to see an exact mathematical breakdown of your debt ratio.",
      note: "Calculated from numbers you confirmed.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (customText) => {
    const q = (customText || chatInput).trim();
    if (!q) return;

    const userMsg = { sender: "user", text: q };
    let replyText = "";

    const lower = q.toLowerCase();
    if (lower.includes("ratio") || lower.includes("emi")) {
      replyText = hasData
        ? `Your existing EMI is ${formatINR(inputs.existingEmi)} against ${formatINR(inputs.income)} income, resulting in exactly ${calculations.emiToIncomePct}% debt burden.`
        : "Please enter your income and EMI numbers to calculate your ratio.";
    } else if (lower.includes("surplus") || lower.includes("buffer")) {
      replyText = hasData
        ? `Your monthly net surplus is ${formatINR(calculations.monthlySurplus)}. After a proposed EMI of ${formatINR(propEmiSlider)}, your projected remaining buffer is ${formatINR(calculations.monthlySurplus - propEmiSlider)}.`
        : "Enter your income and expenses to view your monthly disposable surplus.";
    } else if (lower.includes("plan") || lower.includes("90")) {
      replyText =
        "Your 30-day focus is auditing discretionary spending; 60 days tests debt stress in the simulator; 90 days establishes a 3-month verified surplus record.";
    } else {
      replyText = hasData
        ? `Based on your confirmed income of ${formatINR(inputs.income)}, keeping monthly debt below 35% preserves the safest buffer for emergency reserves.`
        : "Enter your numbers or click 'Load demo' to explore personalized calculations.";
    }

    setChatMessages((prev) => [
      ...prev,
      userMsg,
      {
        sender: "assistant",
        text: replyText,
        note: "Calculated from numbers you confirmed.",
      },
    ]);
    if (!customText) setChatInput("");
  };

  // What-if simulator calculations
  const simIncome = inputs.income || 50000;
  const simExistingEmi = inputs.existingEmi || 10000;
  const simBeforeSurplus = hasData
    ? calculations.monthlySurplus
    : simIncome - expSlider - simExistingEmi;
  const simAfterSurplus = simBeforeSurplus - propEmiSlider;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header matching Page 4 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#0D332A] tracking-tight">
            Your financial overview
          </h2>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-200 text-stone-700">
            {source === "demo" ? "Demo data" : hasData ? "Your data" : "Evaluation"}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FBF6E9] text-[#7A5B18] border border-[#EEDB9F]">
            Not bank-verified
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Row matching Page 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Monthly income */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2DFD4] shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Monthly income</span>
          <span className="font-serif text-2xl font-bold text-[#0D332A]">
            {hasData ? formatINR(inputs.income) : "—"}
          </span>
        </div>

        {/* Metric 2: EMI-to-income */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2DFD4] shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">EMI-to-income</span>
          <span className="font-serif text-2xl font-bold text-[#0D332A]">
            {hasData && calculations.emiToIncomePct !== null ? `${calculations.emiToIncomePct}%` : "—"}
          </span>
        </div>

        {/* Metric 3: Monthly surplus */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2DFD4] shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Monthly surplus</span>
          <span
            className={`font-serif text-2xl font-bold ${
              calculations.monthlySurplus < 0 ? "text-red-700" : "text-[#0D332A]"
            }`}
          >
            {hasData && calculations.monthlySurplus !== null ? formatINR(calculations.monthlySurplus) : "—"}
          </span>
        </div>

        {/* Metric 4: Documents complete */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2DFD4] shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Documents complete</span>
          <span className="font-serif text-2xl font-bold text-[#0D332A]">
            {calculations.docCompletenessPct}%
          </span>
        </div>
      </div>

      {/* Middle 2-Column Section matching Page 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: What-if simulator Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs space-y-5">
          <h3 className="font-serif text-lg font-bold text-[#0D332A]">
            What-if simulator
          </h3>

          {/* Slider 1: Proposed new EMI */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Proposed new EMI</span>
              <span>{formatINR(propEmiSlider)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="35000"
              step="500"
              value={propEmiSlider}
              onChange={(e) => setPropEmiSlider(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Monthly expenses */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Monthly expenses</span>
              <span>{formatINR(expSlider)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={expSlider}
              onChange={(e) => setExpSlider(Number(e.target.value))}
              className="w-full accent-[#0D332A] h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Before vs After Box matching Page 4 */}
          <div className="bg-[#FAF8F1] border border-[#EADBBD] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 block">Before</span>
              <span className="font-serif text-base font-bold text-[#0D332A]">
                {formatINR(simBeforeSurplus)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 block">After</span>
              <span
                className={`font-serif text-lg font-bold ${
                  simAfterSurplus < 0 ? "text-red-700" : "text-[#7A5B18]"
                }`}
              >
                {formatINR(simAfterSurplus)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Your 30-60-90 day plan Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0D332A] mb-4">
              Your 30-60-90 day plan
            </h3>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0D332A] shrink-0">1. 30 days:</span>
                <span>Audit discretionary spending to safeguard your {formatINR(calculations.monthlySurplus || 20000)} monthly surplus.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0D332A] shrink-0">2. 60 days:</span>
                <span>Test EMI tenures in the what-if simulator to keep debt burden under 35%.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0D332A] shrink-0">3. 90 days:</span>
                <span>Maintain 3 consecutive months of documented surplus and zero debit bounces.</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
            Each item links to the figures it is based on.
          </p>
        </div>
      </div>

      {/* Bottom Section: Ask Sahyogi Chat Box matching Page 4 */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#0D332A]">
          Ask Sahyogi
        </h3>

        {/* Example Prompt Bubble */}
        <div className="space-y-3">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-start" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl p-3.5 max-w-xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#FAF9F5] border border-[#EAE8DF] text-stone-800 font-medium"
                    : "bg-[#0D332A]/5 text-[#0D332A] border border-[#0D332A]/10"
                }`}
              >
                <p>{msg.text}</p>
                {msg.note && (
                  <span className="text-[10px] text-stone-400 block mt-1 italic">
                    {msg.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Field matching Page 4 */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Ask about your report"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            className="flex-1 px-4 py-2.5 rounded-full border border-[#DEDBCF] bg-[#FAF9F5] text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20"
          />
          <button
            onClick={() => handleSendChat()}
            className="bg-[#0D332A] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#15463A] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-stone-400 text-center pt-1">
          Informational assessment only. Not a lender decision.
        </p>
      </div>
    </div>
  );
}

