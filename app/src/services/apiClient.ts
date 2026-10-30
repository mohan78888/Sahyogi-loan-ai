import { Config } from '../../constants/Config';

export interface MLPredictionData {
  predicted_outcome: string;
  predicted_class: number;
  repayment_probability_pct: number;
  default_risk_probability_pct: number;
  risk_tier: string;
  confidence_level: number;
  model_name: string;
  model_version: string;
  influential_factors: Array<{
    feature: string;
    impact_direction: string;
    description: string;
  }>;
  limitations_disclaimer: string;
}

export interface ModelInfoData {
  metadata: {
    best_model_name: string;
    algorithm: string;
    metrics?: {
      test_metrics?: {
        accuracy: number;
        roc_auc: number;
        f1: number;
        recall: number;
      };
    };
  };
  comparison?: any;
  is_loaded: boolean;
}

export interface AIReportData {
  summary: string;
  financial_strengths: string[];
  risk_indicators: string[];
  missing_information: string[];
  recommendations: Array<{
    title: string;
    reason: string;
    action: string;
    priority: string;
    timeframe: string;
  }>;
  disclaimer: string;
}

export interface DocumentUploadResponse {
  status: string;
  document_id: string;
  filename: string;
  confidence: number;
  doc_type: string;
  extracted_data: {
    net_salary?: number;
    gross_salary?: number;
    existing_emis?: number;
    employer?: string;
  };
}

export const ApiClient = {
  /**
   * Uploads a document to the backend parser
   */
  async uploadDocument(file: { uri: string; name: string; mimeType?: string }): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    
    // Web environment supports File / Blob directly
    if (typeof window !== 'undefined' && (file as any).file instanceof File) {
      formData.append('file', (file as any).file);
    } else {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);
    }

    formData.append('doc_type', 'auto');

    const res = await fetch(`${Config.apiBaseUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Calls the trained ML Random Forest model
   */
  async getPrediction(payload: {
    monthly_income: number;
    debt_to_income_ratio: number;
    credit_score: number;
    loan_amount: number;
    loan_term: number;
    delinquencies?: number;
  }): Promise<MLPredictionData> {
    const res = await fetch(`${Config.apiBaseUrl}/api/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthly_income: payload.monthly_income,
        debt_to_income_ratio: payload.debt_to_income_ratio,
        credit_score: payload.credit_score,
        loan_amount: payload.loan_amount,
        loan_term: payload.loan_term,
        num_of_delinquencies: payload.delinquencies ?? 0,
      }),
    });

    if (!res.ok) {
      throw new Error(`ML Prediction failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Fetches real trained model metrics
   */
  async getModelInfo(): Promise<ModelInfoData> {
    const res = await fetch(`${Config.apiBaseUrl}/api/ml/model-info`);
    if (!res.ok) {
      throw new Error(`Model info fetch failed with status ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Generates AI Financial Advisor report
   */
  async generateAIReport(profile: {
    monthly_income: number;
    monthly_expenses: number;
    existing_emis: number;
    proposed_emi: number;
    credit_score: number;
  }): Promise<AIReportData> {
    const res = await fetch(`${Config.apiBaseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      throw new Error(`AI Report failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Sends user question to AI chat with confirmed profile context
   */
  async sendChat(query: string, context?: any): Promise<{ reply: string; suggested_followups: string[] }> {
    const res = await fetch(`${Config.apiBaseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });

    if (!res.ok) {
      throw new Error(`AI Chat failed with status ${res.status}`);
    }

    return await res.json();
  },
};

