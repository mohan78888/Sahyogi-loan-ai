import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Calculator,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Sliders,
  DollarSign,
  AlertCircle,
  Printer
} from "lucide-react";

export default function FintechDashboard({ lang, t }) {
  // Demo Personas
  const DEMO_PERSONAS = [
    {
      id: "priya",
      name: "Priya Sharma",
      role: "Salaried Tech (₹55k Net)",
      income: 55000,
      expenses: 22000,
      existingEmis: 11000,
      loanAmount: 600000,
      tenure: 60,
      rate: 10.5,
      docType: "salary_slip",
      employer: "TCS Enterprise Pvt Ltd"
    },
    {
      id: "rahul",
      name: "Rahul Verma",
      role: "Student (₹6L Education Loan)",
      income: 25000,
      expenses: 9000,
      existingEmis: 0,
      loanAmount: 600000,
      tenure: 84,
      rate: 9.5,
      docType: "form_16",
      employer: "Co-applicant (Father - Salaried)"
    },
    {
      id: "ramesh",
      name: "Ramesh Patel",
      role: "Farmer (KCC Farm Credit)",
      income: 38000,
      expenses: 14000,
      existingEmis: 6000,
      loanAmount: 250000,
      tenure: 48,
      rate: 8.5,
      docType: "bank_statement",
      employer: "Agricultural Crop Income"
    }
  ];

  // State
  const [selectedPersona, setSelectedPersona] = useState(DEMO_PERSONAS[0]);
  const [income, setIncome] = useState(DEMO_PERSONAS[0].income);
  const [expenses, setExpenses] = useState(DEMO_PERSONAS[0].expenses);
  const [existingEmis, setExistingEmis] = useState(DEMO_PERSONAS[0].existingEmis);
  const [loanAmount, setLoanAmount] = useState(DEMO_PERSONAS[0].loanAmount);
  const [tenure, setTenure] = useState(DEMO_PERSONAS[0].tenure);

  // Document Upload State
  const [uploadedDoc, setUploadedDoc] = useState({
    filename: "salary_slip_oct2026.pdf",
    type: "salary_slip",
    status: "verified",
    confidence: 0.94,
    employer: "TCS Enterprise Pvt Ltd"
  });
  const [uploading, setUploading] = useState(false);

  // Analysis Report State
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // What-If Simulator State
  const [simIncome, setSimIncome] = useState(55000);
  const [simExpenses, setSimExpenses] = useState(22000);
  const [simEmis, setSimEmis] = useState(11000);
  const [simAdditionalEmi, setSimAdditionalEmi] = useState(12896);
  const [scenarioResult, setScenarioResult] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Namaste! I am your Sahyogi Loan AI Financial Advisor. Based on your verified documents, your current FOIR is 20.0%, leaving healthy surplus before new loan sanction.",
      time: "Just now"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Load Initial Report
  useEffect(() => {
    fetchComprehensiveReport();
  }, [income, expenses, existingEmis, loanAmount, tenure]);

  // Run Simulator on change
  useEffect(() => {
    runSimulator();
  }, [simIncome, simExpenses, simEmis, simAdditionalEmi]);

  const loadPersona = (p) => {
    setSelectedPersona(p);
    setIncome(p.income);
    setExpenses(p.expenses);
    setExistingEmis(p.existingEmis);
    setLoanAmount(p.loanAmount);
    setTenure(p.tenure);
    setSimIncome(p.income);
    setSimExpenses(p.expenses);
    setSimEmis(p.existingEmis);
    setUploadedDoc({
      filename: `${p.id}_financial_statement.pdf`,
      type: p.docType,
      status: "verified",
      confidence: 0.92,
      employer: p.employer
    });
  };

  const fetchComprehensiveReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch("/api/analysis/comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_income: Number(income),
          monthly_expenses: Number(expenses),
          existing_emis: Number(existingEmis),
          target_loan_amount: Number(loanAmount),
          tenure_months: Number(tenure),
          annual_rate_pct: 10.5,
          documents_provided: ["salary_slip", "bank_statement"]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setSimAdditionalEmi(data.proposed_emi);
      }
    } catch (err) {
      console.error("Report fetch error", err);
    } finally {
      setLoadingReport(false);
    }
  };

  const runSimulator = async () => {
    try {
      const res = await fetch("/api/scenarios/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_income: Number(income),
          base_expenses: Number(expenses),
          base_emis: Number(existingEmis),
          new_income: Number(simIncome),
          new_expenses: Number(simExpenses),
          new_emis: Number(simEmis),
          additional_emi: Number(simAdditionalEmi)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setScenarioResult(data);
      }
    } catch (err) {
      console.error("Scenario simulation error", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const doc = data.document || data;
        if (doc) {
          setUploadedDoc({
            filename: doc.filename || file.name,
            type: doc.document_type || doc.doc_type || "financial_document",
            status: "verified",
            confidence: doc.confidence_income || doc.confidence || 0.85,
            employer: doc.employer_name || doc.employer || "Extracted Organization"
          });
          if (doc.extracted_income) {
            setIncome(doc.extracted_income);
          } else if (doc.extracted_data?.net_salary) {
            setIncome(doc.extracted_data.net_salary);
          }
          if (doc.extracted_emis !== undefined) {
            setExistingEmis(doc.extracted_emis);
          } else if (doc.extracted_data?.existing_emis !== undefined) {
            setExistingEmis(doc.extracted_data.existing_emis);
          }
        }
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || chatLoading) return;

    const userMsg = { sender: "user", text: query, time: "Just now" };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          context: {
            income,
            existingEmis,
            foir: report?.projected_foir_pct,
            proposed_emi: report?.proposed_emi
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg = { sender: "ai", text: data.reply, time: "Just now" };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Demo Switcher */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Deterministic Underwriting Engine Active
              </span>
              <span className="text-xs text-slate-400">Model: RBI Lending Norms 2026</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Financial Readiness & AI Document Intelligence
            </h1>
            <p className="text-sm text-slate-400">
              Verify income proofs, simulate stress cases, and audit debt obligations before lender submission.
            </p>
          </div>

          {/* 1-Click Demo Profiles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              ⚡ Demo Profiles:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPersona(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    selectedPersona.id === p.id
                      ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  {p.name} ({p.id === "priya" ? "Salaried" : p.id === "rahul" ? "Student" : "Farmer"})
                </button>
              ))}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition shadow-sm ml-1"
                title="Print or export report to PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Document Center, KPI Gauges, What-If Simulator */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Document Extraction Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Document Intelligence Center</h3>
                  <p className="text-xs text-slate-400">Upload PDF salary slips, bank statements, or Form 16</p>
                </div>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload New PDF</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading ? (
              <div className="p-6 border border-dashed border-blue-500/40 rounded-xl bg-blue-500/5 text-center">
                <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-300">Extracting text & parsing financial fields with PyPDF...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Verified Document
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5 truncate">{uploadedDoc.filename}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OCR Confidence: {(uploadedDoc.confidence * 100).toFixed(0)}%</span>
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Extracted Net Salary
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-bold text-emerald-400">₹{income.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Monthly</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{uploadedDoc.employer}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Detected Active EMIs
                  </span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">₹{existingEmis.toLocaleString("en-IN")}/mo</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Cross-verified against banking entries</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium block mb-1">Financial Health</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{report ? report.health_score : "--"}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold ${
                report?.health_badge === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : report?.health_badge === "warning"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {report ? report.health_status : "Evaluating"}
              </span>
            </div>

            {/* Projected FOIR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium block mb-1">Projected FOIR</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${
                  (report?.projected_foir_pct || 0) <= 40 ? "text-emerald-400" : (report?.projected_foir_pct || 0) <= 50 ? "text-amber-400" : "text-rose-400"
                }`}>
                  {report ? `${report.projected_foir_pct}%` : "--%"}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full ${
                    (report?.projected_foir_pct || 0) <= 40 ? "bg-emerald-400" : (report?.projected_foir_pct || 0) <= 50 ? "bg-amber-400" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(report?.projected_foir_pct || 0, 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Cap: 45-50% in Indian Banks</span>
            </div>

            {/* Disposable Surplus */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium block mb-1">Post-EMI Surplus</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${
                  (report?.projected_surplus || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  ₹{report ? report.projected_surplus.toLocaleString("en-IN") : "--"}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">Monthly emergency buffer</span>
            </div>

            {/* Document Completeness */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium block mb-1">Doc Completeness</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-400">{report ? `${report.doc_completeness_pct}%` : "--%"}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${report?.doc_completeness_pct || 0}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Salary + Statement Verified</span>
            </div>
          </div>

          {/* 3. Interactive What-If Scenario Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">What-If Affordability Simulator</h3>
                  <p className="text-xs text-slate-400">Test how income drops, job delays, or fresh EMIs affect your budget</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSimIncome(income * 0.7); // 30% drop
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition"
              >
                ⚠️ Simulate -30% Income Drop
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Hypothetical Monthly Income</span>
                    <span className="font-bold text-white">₹{simIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="150000"
                    step="2000"
                    value={simIncome}
                    onChange={(e) => setSimIncome(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Proposed New Loan EMI</span>
                    <span className="font-bold text-white">₹{simAdditionalEmi.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="40000"
                    step="1000"
                    value={simAdditionalEmi}
                    onChange={(e) => setSimAdditionalEmi(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSimIncome(income);
                      setSimExpenses(expenses);
                      setSimEmis(existingEmis);
                      setSimAdditionalEmi(report?.proposed_emi || 12896);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition"
                  >
                    Reset to Baseline
                  </button>
                </div>
              </div>

              {/* Simulation Comparison Output */}
              {scenarioResult && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Stress Simulation Impact
                    </span>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Baseline Surplus</span>
                        <span className="text-sm font-bold text-white">
                          ₹{scenarioResult.baseline.surplus.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Simulated Surplus</span>
                        <span className={`text-sm font-bold ${
                          scenarioResult.modified.surplus >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          ₹{scenarioResult.modified.surplus.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900">
                      <span className="text-slate-400">Net Surplus Impact:</span>
                      <span className={`font-bold ${scenarioResult.diff.surplus_diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {scenarioResult.diff.surplus_diff >= 0 ? "+" : ""}
                        ₹{scenarioResult.diff.surplus_diff.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Affordability Verdict:</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      scenarioResult.affordability === "Affordable"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : scenarioResult.affordability === "Borderline"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {scenarioResult.affordability}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Actionable 30 / 60 / 90-Day Roadmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Personalized 30 / 60 / 90-Day Improvement Plan</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Steps to strengthen your profile before fresh lender submission</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report?.action_plan?.map((step, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                      {step.timeframe}
                    </span>
                    <h4 className="font-bold text-sm text-white mb-1">{step.phase}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{step.action}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold text-emerald-400">Impact: </span>
                    <span className="text-[10px] text-slate-400">{step.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Report-Aware AI Advisor Chat */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[740px] sticky top-24">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Sahyogi Loan AI Advisor</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Context-aware from live metrics
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="py-2.5 border-b border-slate-800 flex flex-wrap gap-1.5">
              {[
                "Why is my FOIR important?",
                "How can I reduce monthly EMI?",
                "Will a 20% salary cut cause deficit?",
                "What documents should I verify?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-slate-950 font-medium rounded-br-xs"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                    <span
                      className={`block text-[9px] mt-1 ${
                        msg.sender === "user" ? "text-slate-900/60 text-right" : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-2xl flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Analyzing your report parameters...</span>
                  </div>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-3 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask about FOIR, CIBIL, subsidies..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || chatLoading}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                Educational AI advisor. Not a credit bureau or lender.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

