/**
 * Baseline numbers and sample data matching the 7 design pages.
 * All figures represent illustrative verified or confirmed borrower records.
 */

export const SampleData = {
  // Baseline Financial Figures (From PDFs)
  baseline: {
    income: 60000,
    expenses: 25000,
    monthlyIncome: 60000,
    monthlyExpenses: 25000,
    existingEmi: 16500,
    proposedEmi: 12300,
    creditScore: 720,
    loanAmount: 400000,
    employmentStatus: 'Employed' as const,
    documentsConfirmed: 3,
    documentsTotal: 5,
  },

  // What-If Scenario Default Values (Page 5)
  scenarioDefault: {
    income: 65000,
    expenses: 22000,
    existingEmi: 16500,
    newEmi: 10000,
  },

  // Document Management Records (Page 2)
  documents: [
    {
      id: 'doc-1',
      name: 'Salary slip.pdf',
      detail: 'Text extracted · 3 fields',
      status: 'Confirmed' as const,
    },
    {
      id: 'doc-2',
      name: 'Bank statement.pdf',
      detail: '2 fields need your check',
      status: 'Needs review' as const,
    },
    {
      id: 'doc-3',
      name: 'EMI statement.pdf',
      detail: 'Scanned pages · reading with OCR',
      status: 'Processing' as const,
    },
  ],

  // Extracted Review Fields (Page 2)
  reviewFields: [
    { label: 'Monthly income', value: 60000, status: 'Looks clear' as const },
    { label: 'Existing EMI', value: 16500, status: 'Please check' as const },
    { label: 'Average monthly expenses', value: 25000, status: 'Please check' as const },
  ],

  // Repayment Pattern Check Data (Page 4)
  repaymentPattern: {
    repaidPct: 81,
    notRepaidPct: 19,
    modelVersion: 'v1.0.0 · Trained on 20,000 historical loans',
    influencingFactors: [
      { name: 'Credit score', impact: 'Pushes toward repaid', direction: 'positive' as const, barPct: 85 },
      { name: 'Debt-to-income ratio', impact: 'Pushes toward not repaid', direction: 'negative' as const, barPct: 60 },
      { name: 'Loan amount', impact: 'Pushes toward not repaid', direction: 'negative' as const, barPct: 40 },
      { name: 'Monthly income', impact: 'Pushes toward repaid', direction: 'positive' as const, barPct: 75 },
      { name: 'Past delinquencies', impact: 'Pushes toward repaid', direction: 'positive' as const, barPct: 20 },
    ],
    modelComparison: [
      { model: 'Logistic\nRegression', rocAuc: '—', f1: '—', recall: '—' },
      { model: 'Random Forest', rocAuc: '—', f1: '—', recall: '—' },
    ],
  },

  // AI Report Data (Page 6)
  report: {
    summary:
      'Your income covers expenses and existing EMI with room to spare. Taking on the proposed EMI would leave a much smaller buffer, so a few changes could help.',
    strengths:
      'Positive monthly surplus. EMI-to-income of 27.5% before the new loan.',
    riskIndicators:
      'Surplus after the proposed EMI falls to ₹6,200, about 10% of income.',
    missingInformation:
      'Other income, credit card dues and a second bank statement month.',
    recommendations: [
      {
        id: 'rec-1',
        title: 'Build a larger monthly buffer',
        priority: 'High' as const,
        description: 'Aim to trim expenses so more of the surplus remains after the new EMI.',
        why: 'Projected surplus is small once the new EMI is added.',
        timeframe: 'Within 30 days',
      },
      {
        id: 'rec-2',
        title: 'Add the missing documents',
        priority: 'Medium' as const,
        description: 'Upload a second bank statement month and list any credit card dues.',
        why: 'Two inputs are missing from the analysis.',
        timeframe: 'Within 30 days',
      },
      {
        id: 'rec-3',
        title: 'Review the new EMI size',
        priority: 'Medium' as const,
        description: 'Use the simulator to test a smaller EMI or longer tenure.',
        why: 'The EMI size drives the remaining surplus most.',
        timeframe: 'Within 60 days',
      },
    ],
    roadmap: [
      {
        period: '30 days',
        action: 'Confirm documents, list all dues, and set a monthly expense limit.',
      },
      {
        period: '60 days',
        action: 'Compare EMI options in the simulator and track your surplus.',
      },
      {
        period: '90 days',
        action: 'Recheck your financial health after 3 consecutive months of documented surplus.',
      },
    ],
  },

  // Ask Sahyogi Chat Initial Thread (Page 7)
  initialChatMessages: [
    {
      id: 'm1',
      sender: 'user' as const,
      text: 'Why is my EMI-to-income ratio 27.5%?',
      time: 'Just now',
    },
    {
      id: 'm2',
      sender: 'assistant' as const,
      text:
        'Your existing EMI is ₹16,500 and your monthly income is ₹60,000. Dividing one by the other gives 27.5%.',
      calculationNote: 'Calculated from numbers you confirmed, not estimated by AI.',
      time: 'Just now',
    },
    {
      id: 'm3',
      sender: 'user' as const,
      text: 'How can I raise my surplus?',
      time: 'Just now',
    },
    {
      id: 'm4',
      sender: 'assistant' as const,
      text:
        'Your expenses are the largest part of income at 41.7%. Even a small cut raises your surplus rupee for rupee. You can test it in the simulator.',
      linkAction: 'Open what-if simulator →',
      targetScreen: 'simulator',
      time: 'Just now',
    },
  ],

  // Chat Suggestion Chips (Page 7)
  chatSuggestions: [
    'Explain the pattern check',
    'Which documents are missing?',
    'Make a 90-day plan',
  ],
};

export default SampleData;
