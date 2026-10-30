export interface Scheme {
  id: string;
  name: string;
  category: 'student' | 'farmer' | 'business' | 'personal';
  max_amount: number;
  rate_pct: number;
  subsidy_summary: string;
  eligibility: string;
  source_url: string;
  sample: boolean;
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium';
}

export interface EmiCalculationResult {
  monthly_emi: number;
  total_interest: number;
  total_payment: number;
  effective_rate_pct: number;
}

