export type LoanType = 'personal' | 'business' | 'student' | 'farmer' | 'home';

export type EmploymentType =
  | 'salaried'
  | 'self_employed'
  | 'business_owner'
  | 'student'
  | 'farmer';

export type FactorStatus = 'critical' | 'warning' | 'favorable';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface AnalysisInput {
  loan_type: LoanType;
  loan_amount: number;
  monthly_income: number;
  employment_type: EmploymentType;
  existing_emis: number;
  credit_score?: number | null;
  rejection_reason?: string;
  lender_name?: string;
}

export interface RejectionFactor {
  name: string;
  status: FactorStatus;
  metric: string;
  explanation: string;
  suggestion: string;
}

export interface ActionRecommendation {
  step: number;
  title: string;
  timeframe: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface VerificationChecklistItem {
  item: string;
  category: string;
  mandatory: boolean;
}

export interface AnalysisResult {
  summary: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence_text: string;
  foir_percentage: number;
  existing_foir_percentage: number;
  estimated_new_emi: number;
  lti_multiplier: number;
  factors: RejectionFactor[];
  lender_stated_notes: string[];
  recommendations: ActionRecommendation[];
  checklist: VerificationChecklistItem[];
  disclaimer: string;
}

