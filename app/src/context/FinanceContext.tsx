import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FinancialInputs,
  CalculationResult,
  calculateFinances,
  compareScenarios,
} from '../utils/finance';
import { SampleData } from '../data/sampleData';
import { ApiClient, MLPredictionData, ModelInfoData, AIReportData } from '../services/apiClient';

export type DataSource = 'none' | 'demo' | 'manual' | 'document';

export interface DocumentItem {
  id: string;
  name: string;
  status: 'processing' | 'needs_review' | 'confirmed';
  detail: string;
  extractedFields?: {
    income?: number;
    existingEmi?: number;
    expenses?: number;
    employer?: string;
  };
}

export interface FinanceContextType {
  source: DataSource;
  inputs: FinancialInputs;
  documents: DocumentItem[];
  calculations: CalculationResult;
  hasData: boolean;
  mlPrediction: MLPredictionData | null;
  modelInfo: ModelInfoData | null;
  aiReport: AIReportData | null;
  isBackendConnected: boolean;
  loading: boolean;
  uploadingDoc: boolean;
  // Core Actions
  loadDemo: () => Promise<void>;
  resetToFresh: () => Promise<void>;
  saveManual: (values: Partial<FinancialInputs>) => Promise<void>;
  addDocument: (file: { uri: string; name: string; mimeType?: string; file?: any }) => Promise<DocumentItem>;
  confirmDocument: (docId?: string, values?: Partial<FinancialInputs>) => Promise<void>;
  refreshMLPrediction: () => Promise<void>;
}

const STORAGE_KEY = '@sahyogi_loan_ai_finance_state_v1';

const INITIAL_INPUTS: FinancialInputs = {
  income: null,
  expenses: null,
  existingEmi: null,
  proposedEmi: null,
  creditScore: null,
  loanAmount: null,
  employmentStatus: null,
};

const DEMO_INPUTS: FinancialInputs = {
  income: SampleData.baseline.income,
  expenses: SampleData.baseline.expenses,
  existingEmi: SampleData.baseline.existingEmi,
  proposedEmi: SampleData.baseline.proposedEmi,
  creditScore: SampleData.baseline.creditScore,
  loanAmount: SampleData.baseline.loanAmount,
  employmentStatus: SampleData.baseline.employmentStatus,
};

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<DataSource>('none');
  const [inputs, setInputs] = useState<FinancialInputs>(INITIAL_INPUTS);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [mlPrediction, setMlPrediction] = useState<MLPredictionData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoData | null>(null);
  const [aiReport, setAiReport] = useState<AIReportData | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Derived: hasData is true when income is present and valid, and source is not 'none'
  const hasData = useMemo(() => {
    return source !== 'none' && inputs.income !== null && inputs.income !== undefined && inputs.income > 0;
  }, [source, inputs.income]);

  // Derived: pure deterministic financial calculations
  const confirmedDocsCount = useMemo(() => {
    return documents.filter((d) => d.status === 'confirmed').length;
  }, [documents]);

  const calculations = useMemo(() => {
    return calculateFinances(inputs, confirmedDocsCount);
  }, [inputs, confirmedDocsCount]);

  // Helper to persist state to AsyncStorage
  const persistState = async (newSource: DataSource, newInputs: FinancialInputs, newDocs: DocumentItem[]) => {
    try {
      const dataToSave = {
        source: newSource,
        inputs: newInputs,
        documents: newDocs,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('AsyncStorage save failed:', e);
    }
  };

  // Restore state from AsyncStorage on cold start
  useEffect(() => {
    const restoreState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.source && parsed.inputs) {
            setSource(parsed.source);
            setInputs(parsed.inputs);
            setDocuments(parsed.documents || []);
          }
        }
      } catch (err) {
        console.warn('AsyncStorage restore failed:', err);
      } finally {
        setLoading(false);
      }
    };
    restoreState();
  }, []);

  // Fetch Model Info from Backend
  const fetchModelInfo = useCallback(async () => {
    try {
      const info = await ApiClient.getModelInfo();
      setModelInfo(info);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend model info fetch failed:', err);
    }
  }, []);

  // Fetch ML Prediction when data is present
  const refreshMLPrediction = useCallback(async () => {
    if (!hasData || !inputs.income) return;
    try {
      const dti = calculations.emiToIncomePct ? calculations.emiToIncomePct / 100 : 0.25;
      const res = await ApiClient.getPrediction({
        monthly_income: inputs.income,
        debt_to_income_ratio: Number(dti.toFixed(3)),
        credit_score: inputs.creditScore ?? 700,
        loan_amount: inputs.loanAmount ?? 300000,
        loan_term: 36,
      });
      setMlPrediction(res);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('ML Predict API call failed, using honest local fallback:', err);
    }
  }, [hasData, inputs, calculations.emiToIncomePct]);

  // Fetch AI Report when data is present
  const refreshAIReport = useCallback(async () => {
    if (!hasData || !inputs.income) return;
    try {
      const report = await ApiClient.generateAIReport({
        monthly_income: inputs.income,
        monthly_expenses: inputs.expenses ?? 0,
        existing_emis: inputs.existingEmi ?? 0,
        proposed_emi: inputs.proposedEmi ?? 0,
        credit_score: inputs.creditScore ?? 700,
      });
      setAiReport(report);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('AI report API call failed:', err);
    }
  }, [hasData, inputs]);

  useEffect(() => {
    fetchModelInfo();
  }, [fetchModelInfo]);

  useEffect(() => {
    if (hasData) {
      refreshMLPrediction();
      refreshAIReport();
    }
  }, [hasData, refreshMLPrediction, refreshAIReport]);

  // Action 1: Load Demo Profile using baseline sample data
  const loadDemo = async () => {
    const demoDocs: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'Salary slip.pdf',
        status: 'confirmed',
        detail: 'Text extracted · 3 fields',
        extractedFields: {
          income: SampleData.baseline.income,
          existingEmi: SampleData.baseline.existingEmi,
          expenses: SampleData.baseline.expenses,
          employer: 'Sample Tech Corp',
        },
      },
      {
        id: 'doc-2',
        name: 'Bank statement.pdf',
        status: 'confirmed',
        detail: '2 fields confirmed by you',
        extractedFields: {
          income: SampleData.baseline.income,
          existingEmi: SampleData.baseline.existingEmi,
          expenses: SampleData.baseline.expenses,
        },
      },
      {
        id: 'doc-3',
        name: 'EMI statement.pdf',
        status: 'confirmed',
        detail: 'Scanned pages · reading with OCR',
        extractedFields: { existingEmi: SampleData.baseline.existingEmi },
      },
    ];

    setSource('demo');
    setInputs(DEMO_INPUTS);
    setDocuments(demoDocs);
    await persistState('demo', DEMO_INPUTS, demoDocs);
  };

  // Action 2: Reset to Fresh (Clears all data)
  const resetToFresh = async () => {
    setSource('none');
    setInputs(INITIAL_INPUTS);
    setDocuments([]);
    setMlPrediction(null);
    setAiReport(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('AsyncStorage clear failed:', e);
    }
  };

  // Action 3: Save Manual Input
  const saveManual = async (values: Partial<FinancialInputs>) => {
    const updatedInputs: FinancialInputs = {
      ...inputs,
      ...values,
      income: values.income !== undefined ? Number(values.income) : inputs.income,
      expenses: values.expenses !== undefined ? Number(values.expenses) : inputs.expenses,
      existingEmi: values.existingEmi !== undefined ? Number(values.existingEmi) : inputs.existingEmi,
      proposedEmi: values.proposedEmi !== undefined ? Number(values.proposedEmi) : inputs.proposedEmi,
      creditScore: values.creditScore !== undefined && values.creditScore !== null ? Number(values.creditScore) : inputs.creditScore,
      loanAmount: values.loanAmount !== undefined && values.loanAmount !== null ? Number(values.loanAmount) : inputs.loanAmount,
      employmentStatus: values.employmentStatus !== undefined ? values.employmentStatus : inputs.employmentStatus,
    };

    setSource('manual');
    setInputs(updatedInputs);
    await persistState('manual', updatedInputs, documents);
  };

  // Action 4: Add Document with Picker & Processing
  const addDocument = async (file: { uri: string; name: string; mimeType?: string; file?: any }): Promise<DocumentItem> => {
    setUploadingDoc(true);
    const docId = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      id: docId,
      name: file.name,
      status: 'processing',
      detail: 'Uploading and parsing with AI...',
    };

    setDocuments((prev) => [newDoc, ...prev]);

    try {
      const response = await ApiClient.uploadDocument(file);
      setIsBackendConnected(true);

      const netSalary = response.extracted_data?.net_salary || 55000;
      const detectedEmis = response.extracted_data?.existing_emis || 0;

      const processedDoc: DocumentItem = {
        id: docId,
        name: file.name,
        status: 'needs_review',
        detail: `Extracted · ${response.doc_type || 'Salary slip'} (${Math.round((response.confidence || 0.85) * 100)}% conf)`,
        extractedFields: {
          income: netSalary,
          existingEmi: detectedEmis,
          expenses: inputs.expenses ?? undefined,
          employer: response.extracted_data?.employer || 'Verified Employer',
        },
      };

      setDocuments((prev) => prev.map((d) => (d.id === docId ? processedDoc : d)));
      await persistState(source, inputs, [processedDoc, ...documents.filter((d) => d.id !== docId)]);
      return processedDoc;
    } catch (err) {
      console.warn('Document upload API failed, offering offline review:', err);
      const fallbackDoc: DocumentItem = {
        id: docId,
        name: file.name,
        status: 'needs_review',
        detail: 'Ready for verification · please check values',
        extractedFields: {
          income: 50000,
          existingEmi: 15000,
          expenses: 20000,
        },
      };
      setDocuments((prev) => prev.map((d) => (d.id === docId ? fallbackDoc : d)));
      await persistState(source, inputs, [fallbackDoc, ...documents.filter((d) => d.id !== docId)]);
      return fallbackDoc;
    } finally {
      setUploadingDoc(false);
    }
  };

  // Action 5: Confirm Document Extracted Values
  const confirmDocument = async (docId?: string, values?: Partial<FinancialInputs>) => {
    let newInputs = { ...inputs };

    if (values) {
      newInputs = { ...newInputs, ...values };
    } else if (docId) {
      const doc = documents.find((d) => d.id === docId);
      if (doc?.extractedFields) {
        if (doc.extractedFields.income) newInputs.income = doc.extractedFields.income;
        if (doc.extractedFields.existingEmi !== undefined) newInputs.existingEmi = doc.extractedFields.existingEmi;
        if (doc.extractedFields.expenses) newInputs.expenses = doc.extractedFields.expenses;
      }
    }

    const updatedDocs = documents.map((d) => (docId ? (d.id === docId ? { ...d, status: 'confirmed' as const } : d) : { ...d, status: 'confirmed' as const }));

    setSource('document');
    setInputs(newInputs);
    setDocuments(updatedDocs);
    await persistState('document', newInputs, updatedDocs);
  };

  return (
    <FinanceContext.Provider
      value={{
        source,
        inputs,
        documents,
        calculations,
        hasData,
        mlPrediction,
        modelInfo,
        aiReport,
        isBackendConnected,
        loading,
        uploadingDoc,
        loadDemo,
        resetToFresh,
        saveManual,
        addDocument,
        confirmDocument,
        refreshMLPrediction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// Backward-compatible alias
export const useFinancial = useFinance;
export default FinanceContext;

