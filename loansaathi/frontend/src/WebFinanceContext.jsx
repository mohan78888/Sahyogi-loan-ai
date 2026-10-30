import React, { createContext, useContext, useState, useMemo } from "react";

const WebFinanceContext = createContext(null);

export const DEMO_BASELINE = {
  income: 60000,
  expenses: 25000,
  existingEmi: 16500,
  proposedEmi: 12300,
  creditScore: 720,
  loanAmount: 400000,
  documentsConfirmed: 3,
};

const INITIAL_INPUTS = {
  income: null,
  expenses: null,
  existingEmi: null,
  proposedEmi: null,
  creditScore: null,
  loanAmount: null,
};

export function WebFinanceProvider({ children }) {
  const [source, setSource] = useState("none"); // "none" | "demo" | "manual" | "document"
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "landing" | "overview" | "documents" | "prediction" | "simulator" | "report"

  const hasData = useMemo(() => {
    return source !== "none" && inputs.income !== null && inputs.income > 0;
  }, [source, inputs.income]);

  const confirmedDocsCount = useMemo(() => {
    if (source === "demo") return DEMO_BASELINE.documentsConfirmed;
    return documents.filter((d) => d.status === "confirmed").length;
  }, [source, documents]);

  // Pure deterministic calculations
  const calculations = useMemo(() => {
    const inc = inputs.income || 0;
    const exp = inputs.expenses || 0;
    const emi = inputs.existingEmi || 0;
    const propEmi = inputs.proposedEmi || 0;

    const surplus = hasData ? inc - exp - emi : null;
    const emiPct = hasData && inc > 0 ? Math.round((emi / inc) * 1000) / 10 : null;
    const surplusAfter = surplus !== null ? surplus - propEmi : null;
    const docPct = Math.min(100, Math.round((confirmedDocsCount / 5) * 100));

    return {
      monthlySurplus: surplus,
      emiToIncomePct: emiPct,
      surplusAfterNewEmi: surplusAfter,
      docCompletenessPct: docPct,
    };
  }, [inputs, hasData, confirmedDocsCount]);

  // Actions
  const loadDemo = () => {
    setSource("demo");
    setInputs({
      income: DEMO_BASELINE.income,
      expenses: DEMO_BASELINE.expenses,
      existingEmi: DEMO_BASELINE.existingEmi,
      proposedEmi: DEMO_BASELINE.proposedEmi,
      creditScore: DEMO_BASELINE.creditScore,
      loanAmount: DEMO_BASELINE.loanAmount,
    });
    setDocuments([
      { id: "doc-1", name: "Salary slip.pdf", status: "confirmed", detail: "Verified by you" },
      { id: "doc-2", name: "Bank statement.pdf", status: "confirmed", detail: "Verified by you" },
      { id: "doc-3", name: "EMI statement.pdf", status: "confirmed", detail: "Verified by you" },
    ]);
  };

  const resetToFresh = () => {
    setSource("none");
    setInputs(INITIAL_INPUTS);
    setDocuments([]);
  };

  const saveManual = (values) => {
    setSource("manual");
    setInputs((prev) => ({
      ...prev,
      ...values,
      income: values.income !== undefined ? Number(values.income) : prev.income,
      expenses: values.expenses !== undefined ? Number(values.expenses) : prev.expenses,
      existingEmi: values.existingEmi !== undefined ? Number(values.existingEmi) : prev.existingEmi,
      proposedEmi: values.proposedEmi !== undefined ? Number(values.proposedEmi) : prev.proposedEmi,
    }));
  };

  const confirmExtracted = (values) => {
    setSource("document");
    setInputs((prev) => ({
      ...prev,
      ...values,
      income: values.income !== undefined ? Number(values.income) : prev.income,
      expenses: values.expenses !== undefined ? Number(values.expenses) : prev.expenses,
      existingEmi: values.existingEmi !== undefined ? Number(values.existingEmi) : prev.existingEmi,
    }));
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        name: "Uploaded bank statement.pdf",
        status: "confirmed",
        detail: "Confirmed by you",
      },
    ]);
  };

  return (
    <WebFinanceContext.Provider
      value={{
        source,
        inputs,
        setInputs,
        documents,
        hasData,
        calculations,
        activeTab,
        setActiveTab,
        loadDemo,
        resetToFresh,
        saveManual,
        confirmExtracted,
      }}
    >
      {children}
    </WebFinanceContext.Provider>
  );
}

export function useWebFinance() {
  const ctx = useContext(WebFinanceContext);
  if (!ctx) throw new Error("useWebFinance must be used within WebFinanceProvider");
  return ctx;
}

export function formatINR(val) {
  if (val === null || val === undefined) return "—";
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

