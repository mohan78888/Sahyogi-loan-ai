import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SampleData } from '../data/sampleData';
import { calculateFinances, CalculationResult } from '../utils/finance';
import {
  ApiClient,
  MLPredictionData,
  AIReportData,
  ModelInfoData,
} from '../services/apiClient';

interface FinancialProfile {
  income: number;
  expenses: number;
  existingEmi: number;
  proposedEmi: number;
  creditScore: number;
  loanAmount: number;
  loanTerm: number;
  documentsConfirmed: number;
  documentsTotal: number;
}

interface DocumentItem {
  id: string;
  name: string;
  detail: string;
  status: 'Confirmed' | 'Needs review' | 'Processing';
}

interface ReviewField {
  label: string;
  value: number;
  status: 'Looks clear' | 'Please check';
}

interface FinancialContextType {
  profile: FinancialProfile;
  calc: CalculationResult;
  documents: DocumentItem[];
  reviewFields: ReviewField[];
  mlPrediction: MLPredictionData | null;
  modelInfo: ModelInfoData | null;
  aiReport: AIReportData | null;
  isBackendConnected: boolean;
  mlLoading: boolean;
  reportLoading: boolean;
  uploadingDoc: boolean;
  updateProfile: (updates: Partial<FinancialProfile>) => void;
  confirmReviewFields: (newFields?: ReviewField[]) => void;
  uploadDocumentFile: (file: { uri: string; name: string; mimeType?: string; file?: any }) => Promise<void>;
  fetchMLPrediction: () => Promise<void>;
  fetchAIReport: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<FinancialProfile>({
    income: SampleData.baseline.income,
    expenses: SampleData.baseline.expenses,
    existingEmi: SampleData.baseline.existingEmi,
    proposedEmi: SampleData.baseline.proposedEmi,
    creditScore: SampleData.baseline.creditScore,
    loanAmount: 400000,
    loanTerm: 36,
    documentsConfirmed: SampleData.baseline.documentsConfirmed,
    documentsTotal: SampleData.baseline.documentsTotal,
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(SampleData.documents);
  const [reviewFields, setReviewFields] = useState<ReviewField[]>(SampleData.reviewFields);
  const [mlPrediction, setMlPrediction] = useState<MLPredictionData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoData | null>(null);
  const [aiReport, setAiReport] = useState<AIReportData | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Compute live local deterministic finances
  const calc = calculateFinances({
    income: profile.income,
    expenses: profile.expenses,
    existingEmi: profile.existingEmi,
    proposedEmi: profile.proposedEmi,
  });

  // Fetch ML Prediction from Backend
  const fetchMLPrediction = useCallback(async () => {
    try {
      setMlLoading(true);
      const dti = profile.income > 0 ? profile.existingEmi / profile.income : 0.275;
      const res = await ApiClient.getPrediction({
        monthly_income: profile.income,
        debt_to_income_ratio: Number(dti.toFixed(3)),
        credit_score: profile.creditScore,
        loan_amount: profile.loanAmount,
        loan_term: profile.loanTerm,
      });
      setMlPrediction(res);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend ML predict fallback to sample data:', err);
    } finally {
      setMlLoading(false);
    }
  }, [profile]);

  // Fetch Model Info from Backend
  const fetchModelInfo = useCallback(async () => {
    try {
      const info = await ApiClient.getModelInfo();
      setModelInfo(info);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend ModelInfo fallback:', err);
    }
  }, []);

  // Fetch AI Report from Backend
  const fetchAIReport = useCallback(async () => {
    try {
      setReportLoading(true);
      const rep = await ApiClient.generateAIReport({
        monthly_income: profile.income,
        monthly_expenses: profile.expenses,
        existing_emis: profile.existingEmi,
        proposed_emi: profile.proposedEmi,
        credit_score: profile.creditScore,
      });
      setAiReport(rep);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend AI Report fallback:', err);
    } finally {
      setReportLoading(false);
    }
  }, [profile]);

  // Initial fetch on mount
  useEffect(() => {
    fetchModelInfo();
    fetchMLPrediction();
    fetchAIReport();
  }, [fetchModelInfo, fetchMLPrediction, fetchAIReport]);

  const updateProfile = (updates: Partial<FinancialProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Upload Document and extract real entities
  const uploadDocumentFile = async (file: { uri: string; name: string; mimeType?: string; file?: any }) => {
    try {
      setUploadingDoc(true);
      const newDocId = `doc-${Date.now()}`;
      
      // Temporary optimistic entry
      const optimisticDoc: DocumentItem = {
        id: newDocId,
        name: file.name,
        detail: 'Uploading and parsing with AI...',
        status: 'Processing',
      };
      setDocuments((prev) => [optimisticDoc, ...prev]);

      try {
        const response = await ApiClient.uploadDocument(file);
        setIsBackendConnected(true);

        const netSal = response.extracted_data?.net_salary || 0;
        const emis = response.extracted_data?.existing_emis || 0;

        // Update document status
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === newDocId
              ? {
                  ...d,
                  detail: `Extracted · ${response.doc_type || 'Salary slip'} (${Math.round((response.confidence || 0.85) * 100)}% conf)`,
                  status: 'Needs review',
                }
              : d
          )
        );

        // Update Review Fields
        setReviewFields([
          { label: 'Monthly income', value: netSal, status: 'Looks clear' },
          { label: 'Existing EMI', value: emis, status: 'Please check' },
          { label: 'Average monthly expenses', value: profile.expenses, status: 'Please check' },
        ]);
      } catch (uploadErr) {
        console.warn('Upload API error, retaining local review entry:', uploadErr);
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === newDocId
              ? { ...d, detail: 'Parsed offline · 3 fields', status: 'Needs review' }
              : d
          )
        );
      }
    } finally {
      setUploadingDoc(false);
    }
  };

  // User confirms extracted review values
  const confirmReviewFields = (newFields?: ReviewField[]) => {
    const fieldsToUse = newFields || reviewFields;
    setReviewFields(
      fieldsToUse.map((f) => ({ ...f, status: 'Looks clear' as const }))
    );

    // Find updated values
    let inc = profile.income;
    let emi = profile.existingEmi;
    let exp = profile.expenses;

    fieldsToUse.forEach((f) => {
      if (f.label.toLowerCase().includes('income')) inc = f.value;
      if (f.label.toLowerCase().includes('emi')) emi = f.value;
      if (f.label.toLowerCase().includes('expense')) exp = f.value;
    });

    setProfile((prev) => ({
      ...prev,
      income: inc,
      existingEmi: emi,
      expenses: exp,
      documentsConfirmed: Math.min(prev.documentsTotal, prev.documentsConfirmed + 1),
    }));

    setDocuments((prev) =>
      prev.map((d) => (d.status === 'Needs review' ? { ...d, status: 'Confirmed' as const } : d))
    );
  };

  return (
    <FinancialContext.Provider
      value={{
        profile,
        calc,
        documents,
        reviewFields,
        mlPrediction,
        modelInfo,
        aiReport,
        isBackendConnected,
        mlLoading,
        reportLoading,
        uploadingDoc,
        updateProfile,
        confirmReviewFields,
        uploadDocumentFile,
        fetchMLPrediction,
        fetchAIReport,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

