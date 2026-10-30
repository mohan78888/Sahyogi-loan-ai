import { request } from './api';
import { AnalysisInput, AnalysisResult } from '../types/analysis';

// In-memory store for recent analyses on mobile session
let _recentAnalyses: Array<{ id: string; date: string; input: AnalysisInput; result: AnalysisResult }> = [];

export const AnalysisService = {
  async submitRejectionAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const payload = {
      loan_type: input.loan_type,
      loan_amount: Number(input.loan_amount),
      monthly_income: Number(input.monthly_income),
      employment_type: input.employment_type,
      existing_emis: Number(input.existing_emis || 0),
      credit_score: input.credit_score ? Number(input.credit_score) : null,
      rejection_reason: input.rejection_reason || null,
      lender_name: input.lender_name || null,
    };

    const result = await request<AnalysisResult>('/api/ai/rejection-analysis', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Store in recent analyses
    const record = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      input,
      result,
    };
    _recentAnalyses = [record, ..._recentAnalyses.slice(0, 4)];

    return result;
  },

  getRecentAnalyses() {
    return _recentAnalyses;
  },

  clearRecentAnalyses() {
    _recentAnalyses = [];
  },

  async getComprehensiveReport(params: {
    monthly_income: number;
    monthly_expenses?: number;
    existing_emis?: number;
    target_loan_amount?: number;
    tenure_months?: number;
    annual_rate_pct?: number;
    documents_provided?: string[];
  }) {
    return await request<any>('/api/analysis/comprehensive', {
      method: 'POST',
      body: JSON.stringify({
        monthly_income: Number(params.monthly_income),
        monthly_expenses: Number(params.monthly_expenses || 0),
        existing_emis: Number(params.existing_emis || 0),
        target_loan_amount: Number(params.target_loan_amount || 500000),
        tenure_months: Number(params.tenure_months || 60),
        annual_rate_pct: Number(params.annual_rate_pct || 10.5),
        documents_provided: params.documents_provided || ['salary_slip', 'bank_statement'],
      }),
    });
  },

  async simulateScenario(params: {
    base_income: number;
    base_expenses: number;
    base_emis: number;
    new_income: number;
    new_expenses: number;
    new_emis: number;
    additional_emi: number;
  }) {
    return await request<any>('/api/scenarios/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

export default AnalysisService;

