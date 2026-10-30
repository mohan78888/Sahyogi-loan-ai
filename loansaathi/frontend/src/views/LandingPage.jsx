import React from "react";
import { ArrowRight, ShieldCheck, FileText, Sliders, CheckCircle2 } from "lucide-react";
import { useWebFinance, formatINR } from "../WebFinanceContext";

export default function LandingPageView({ onOpenManual }) {
  const {
    source,
    inputs,
    calculations,
    hasData,
    setActiveTab,
    loadDemo,
  } = useWebFinance();

  return (
    <div className="min-h-screen bg-[#F4F3ED] text-[#1E293B] flex flex-col justify-between selection:bg-[#C2A44B]/20">
      {/* Top Navbar matching Page 1 */}
      <header className="border-b border-[#E2DFD4] bg-[#F4F3ED]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#0D332A]">
              Sahyogi <span className="text-[#B45309] italic font-normal">Loan AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <a href="#how-it-works" className="hover:text-[#0D332A] transition-colors">
              How it works
            </a>
            <button
              onClick={() => setActiveTab("simulator")}
              className="hover:text-[#0D332A] transition-colors"
            >
              Tools
            </button>
            <a href="#trust" className="hover:text-[#0D332A] transition-colors">
              Trust
            </a>
          </nav>

          {/* CTA & Demo controls */}
          <div className="flex items-center gap-3">
            {source === "none" && (
              <button
                onClick={loadDemo}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#0D332A] bg-[#E8E4D8] hover:bg-[#DEDBCF] rounded-full transition-colors"
              >
                Try demo profile
              </button>
            )}
            <button
              onClick={() => setActiveTab("overview")}
              className="bg-[#0D332A] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#15463A] transition-all shadow-sm flex items-center gap-2"
            >
              <span>Start free analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section matching Page 1 */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-block px-3 py-1 rounded-full bg-[#EAE7DC] text-[#785C1F] text-xs font-semibold tracking-wide border border-[#D8D4C5]">
              Samjho pehle, loan baad mein
            </div>

            {/* Serif Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#0D332A] leading-[1.15] tracking-tight">
              Know your loan <br />
              readiness before <br />
              the bank does.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Upload a bank statement, see your real cash flow, learn what is holding you back, and get a clear 30-60-90 day plan in simple language.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab("overview")}
                className="px-6 py-3.5 rounded-full bg-[#0D332A] text-white text-sm font-semibold hover:bg-[#15463A] transition-all shadow-sm"
              >
                Analyse my finances
              </button>

              <button
                onClick={() => setActiveTab("simulator")}
                className="px-6 py-3.5 rounded-full bg-white text-[#0D332A] border border-[#D5D1C3] text-sm font-semibold hover:bg-stone-50 transition-all shadow-2xs"
              >
                Try the what-if simulator
              </button>
            </div>

            {/* Plain disclaimer */}
            <p className="text-xs text-stone-500 pt-1">
              Informational assessment only. Not a lender decision.
            </p>
          </div>

          {/* Right Column: Financial Health Snapshot Card matching Page 1 */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2DFD4] shadow-sm space-y-5">
              {/* Snapshot Header with Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700">
                  Financial health snapshot
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  {source === "demo" ? "Demo data" : hasData ? "Your data" : "Evaluation"}
                </span>
              </div>

              {/* Two Metric Tiles in Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE8DF]">
                  <span className="text-xs text-stone-500 block mb-1">
                    EMI-to-income
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#0D332A]">
                    {calculations.emiToIncomePct !== null ? `${calculations.emiToIncomePct}%` : hasData ? "20%" : "—"}
                  </span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE8DF]">
                  <span className="text-xs text-stone-500 block mb-1">
                    Monthly surplus
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#0D332A]">
                    {calculations.monthlySurplus !== null ? formatINR(calculations.monthlySurplus) : hasData ? "₹20,000" : "—"}
                  </span>
                </div>
              </div>

              {/* Document Completeness Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-2">
                  <span className="font-medium">Document completeness</span>
                  <span className="font-semibold text-[#0D332A]">{calculations.docCompletenessPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D332A] rounded-full transition-all duration-500"
                    style={{ width: `${calculations.docCompletenessPct}%` }}
                  />
                </div>
              </div>

              {/* Next Step Amber Box */}
              <div className="bg-[#FBF6E9] border border-[#EEDB9F] rounded-2xl p-4 text-xs text-[#7A5B18] leading-relaxed">
                <span className="font-bold">Next step: </span>
                {hasData
                  ? "Audit consecutive 3-month surplus in report to confirm eligibility buffer."
                  : "Upload a bank statement or enter your numbers manually to populate this snapshot."}
              </div>

              {/* If Fresh, Quick entry shortcuts */}
              {!hasData && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onOpenManual}
                    className="flex-1 py-2 text-xs font-semibold text-[#0D332A] bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-center"
                  >
                    Enter manually (10s)
                  </button>
                  <button
                    onClick={loadDemo}
                    className="flex-1 py-2 text-xs font-semibold text-[#7A5B18] bg-[#FBF6E9] hover:bg-[#F3EACB] rounded-xl transition-colors text-center"
                  >
                    Load demo profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Feature Cards matching Page 1 */}
        <section id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Read my statement */}
          <div
            onClick={() => setActiveTab("documents")}
            className="bg-white rounded-2xl p-6 border border-[#E2DFD4] shadow-xs cursor-pointer hover:shadow-md transition-all group"
          >
            <h3 className="font-serif text-lg font-bold text-[#0D332A] mb-2 group-hover:text-[#B45309] transition-colors">
              Read my statement
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Upload a PDF. We extract income, expenses and EMIs, and flag every uncertain field for you to confirm.
            </p>
          </div>

          {/* Card 2: Explain my risks */}
          <div
            onClick={() => setActiveTab("prediction")}
            className="bg-white rounded-2xl p-6 border border-[#E2DFD4] shadow-xs cursor-pointer hover:shadow-md transition-all group"
          >
            <h3 className="font-serif text-lg font-bold text-[#0D332A] mb-2 group-hover:text-[#B45309] transition-colors">
              Explain my risks
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              A model trained on 20,000 historical loans shows which factors mattered, with plain-language reasons.
            </p>
          </div>

          {/* Card 3: What if I change? */}
          <div
            onClick={() => setActiveTab("simulator")}
            className="bg-white rounded-2xl p-6 border border-[#E2DFD4] shadow-xs cursor-pointer hover:shadow-md transition-all group"
          >
            <h3 className="font-serif text-lg font-bold text-[#0D332A] mb-2 group-hover:text-[#B45309] transition-colors">
              What if I change?
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Move income, expenses or a new EMI and instantly see your surplus and ratio shift.
            </p>
          </div>
        </section>
      </main>

      {/* Dark Green Banner matching Page 1 */}
      <footer id="trust" className="bg-[#0D332A] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#FAF9F5]">
              Honest by design. We never claim bank approval or verification.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-sm text-white/70 leading-relaxed">
              Predictions describe historical repayment patterns, not lender decisions. Your documents stay private and every number is calculated, not guessed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

