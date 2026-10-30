import { useState, useCallback } from 'react';
import { AnalysisInput, AnalysisResult } from '../types/analysis';
import { AnalysisService } from '../services/analysisService';

export function useLoanAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (input: AnalysisInput): Promise<AnalysisResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await AnalysisService.submitRejectionAnalysis(input);
      setResult(data);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to analyze rejection. Please check connection and try again.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    result,
    analyze,
    reset,
  };
}

export default useLoanAnalysis;

