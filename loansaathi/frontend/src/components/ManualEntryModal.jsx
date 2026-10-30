import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useWebFinance } from "../WebFinanceContext";

export default function ManualEntryModal({ isOpen, onClose }) {
  const { inputs, saveManual } = useWebFinance();

  const [income, setIncome] = useState(inputs.income ? String(inputs.income) : "");
  const [expenses, setExpenses] = useState(inputs.expenses ? String(inputs.expenses) : "");
  const [existingEmi, setExistingEmi] = useState(inputs.existingEmi ? String(inputs.existingEmi) : "");
  const [proposedEmi, setProposedEmi] = useState(inputs.proposedEmi ? String(inputs.proposedEmi) : "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const inc = Number(income);
    const exp = Number(expenses);
    const emi = Number(existingEmi);
    const prop = proposedEmi ? Number(proposedEmi) : 0;

    if (!income || isNaN(inc) || inc <= 0) {
      setError("Please enter a valid monthly income greater than 0.");
      return;
    }
    if (isNaN(exp) || exp < 0) {
      setError("Monthly living expenses cannot be negative.");
      return;
    }
    if (isNaN(emi) || emi < 0) {
      setError("Existing EMI obligations cannot be negative.");
      return;
    }

    saveManual({
      income: inc,
      expenses: exp,
      existingEmi: emi,
      proposedEmi: prop,
    });
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#E2DFD4] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-[#1E293B]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-xl font-bold text-[#0D332A] mb-1">
          Enter financial numbers
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Enter numbers directly in 10 seconds to calculate live surplus and debt burden.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Monthly net income (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DEDBCF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20 focus:border-[#0D332A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Monthly living expenses (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DEDBCF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20 focus:border-[#0D332A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Existing monthly EMIs (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={existingEmi}
              onChange={(e) => setExistingEmi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DEDBCF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20 focus:border-[#0D332A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Proposed new EMI (₹) <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={proposedEmi}
              onChange={(e) => setProposedEmi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DEDBCF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D332A]/20 focus:border-[#0D332A]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-stone-600 bg-white border border-[#DEDBCF] rounded-xl hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#0D332A] rounded-xl hover:bg-[#133F34] transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm numbers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

