import React, { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useWebFinance } from "../WebFinanceContext";

export default function DocumentsView() {
  const {
    inputs,
    confirmExtracted,
    setActiveTab,
  } = useWebFinance();

  const [incomeVal, setIncomeVal] = useState(inputs.income ? String(inputs.income) : "60000");
  const [expensesVal, setExpensesVal] = useState(inputs.expenses ? String(inputs.expenses) : "25000");
  const [emiVal, setEmiVal] = useState(inputs.existingEmi ? String(inputs.existingEmi) : "16500");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(3); // 0=Uploaded, 1=Text read, 2=Extracting fields, 3=Your review
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a PDF document only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds maximum allowed size of 10 MB.");
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setUploadStep(1);

    // Simulated stepped OCR parsing
    setTimeout(() => {
      setUploadStep(2);
      setTimeout(() => {
        setUploadStep(3);
        setIsProcessing(false);
        setIncomeVal("55000");
        setExpensesVal("22000");
        setEmiVal("11000");
        setNotice("Values extracted from PDF. Please verify and edit below before confirming.");
      }, 700);
    }, 600);
  };

  const handleConfirm = () => {
    const inc = Number(incomeVal) || 0;
    const exp = Number(expensesVal) || 0;
    const emi = Number(emiVal) || 0;

    confirmExtracted({
      income: inc,
      expenses: exp,
      existingEmi: emi,
    });

    setActiveTab("overview");
  };

  const steps = [
    { label: "Uploaded", done: uploadStep >= 0 },
    { label: "Text read", done: uploadStep >= 1 },
    { label: "Extracting fields", done: uploadStep >= 2 },
    { label: "Your review", done: uploadStep >= 3 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header matching Page 2 */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0D332A] tracking-tight">
          Upload your bank statement
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          PDF only. Stored privately and deletable anytime.
        </p>
      </div>

      {/* Dashed Drag & Drop Box matching Page 2 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#D5D1C3] hover:border-[#0D332A] bg-white/70 hover:bg-white rounded-3xl p-12 text-center transition-all cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EAE8DF] flex items-center justify-center text-[#0D332A] group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0D332A]">
              Drop a PDF here
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              or choose a file. Max size 10 MB
            </p>
          </div>
          <button
            type="button"
            className="mt-2 bg-[#0D332A] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#15463A] transition-colors"
          >
            {selectedFile ? selectedFile.name : "Choose file"}
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-[#FBF6E9] border border-[#EEDB9F] rounded-2xl p-4 text-xs text-[#7A5B18] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#B45309]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Processing Stepper Card matching Page 2 */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2DFD4] shadow-xs">
        <h4 className="text-sm font-bold text-[#0D332A] mb-4">Processing</h4>
        <div className="grid grid-cols-4 gap-3">
          {steps.map((st, i) => (
            <div key={i} className="space-y-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  st.done ? "bg-[#0D332A]" : "bg-stone-200"
                }`}
              />
              <span
                className={`text-xs block font-medium ${
                  st.done ? "text-[#0D332A]" : "text-stone-400"
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Extracted Values Card matching Page 2 */}
      <div className="bg-white rounded-3xl p-7 border border-[#E2DFD4] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-lg font-bold text-[#0D332A]">
            Confirm extracted values
          </h4>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FBF6E9] text-[#7A5B18] border border-[#EEDB9F]">
            Read by OCR, not bank-verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Monthly Income */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Monthly income
            </label>
            <input
              type="number"
              value={incomeVal}
              onChange={(e) => setIncomeVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#DEDBCF] bg-[#FAF9F5] text-sm font-semibold text-[#0D332A] focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20"
            />
          </div>

          {/* Monthly Expenses */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Monthly expenses
            </label>
            <input
              type="number"
              value={expensesVal}
              onChange={(e) => setExpensesVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#DEDBCF] bg-[#FAF9F5] text-sm font-semibold text-[#0D332A] focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20"
            />
          </div>

          {/* Existing EMI */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Existing EMI
            </label>
            <input
              type="number"
              value={emiVal}
              onChange={(e) => setEmiVal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#DEDBCF] bg-[#FAF9F5] text-sm font-semibold text-[#0D332A] focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20"
            />
            <span className="text-[11px] text-[#B45309] font-medium block mt-1">
              Low confidence. Please check.
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleConfirm}
            className="bg-[#0D332A] text-white text-xs md:text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#15463A] transition-colors shadow-sm"
          >
            Confirm and calculate
          </button>
        </div>
      </div>
    </div>
  );
}

