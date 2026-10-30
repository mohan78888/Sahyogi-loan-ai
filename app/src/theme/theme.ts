/**
 * Single shared theme definition for Sahyogi Loan AI.
 * Design tokens extracted directly from official UI specifications.
 */

export const Theme = {
  colors: {
    // Canvas & Surfaces
    background: '#F3F5F7',
    card: '#FFFFFF',
    border: '#E1E6EC',
    borderLight: '#EDF1F5',
    
    // Typography
    text: '#0F1B2D',
    mutedText: '#5B6776',
    white: '#FFFFFF',
    
    // Primary Brand (Deep Teal)
    primary: '#0F5C4D',
    primaryDark: '#0A4338',
    primaryTint: '#E3F1EE',
    primaryLight: '#CDE8E2',
    lightTealText: '#CDE8E2',
    
    // Semantic States
    info: '#1D4ED8',
    infoBlue: '#1D4ED8',
    infoTint: '#E8EEFF',
    infoText: '#1D3FA8',
    
    warning: '#B45309',
    warningAmber: '#B45309',
    warningTint: '#FFF1DC',
    warningText: '#8A4B00',
    warningBox: '#FFF8EC',
    warningSoftBox: '#FFF8EC',
    warningBorder: '#F3D9A8',
    
    success: '#0B5A2E',
    successText: '#0B5A2E',
    successTint: '#E1F5E8',
    
    danger: '#A32525',
    dangerText: '#A32525',
    dangerTint: '#FDECEC',
    
    // Cash Flow Chart Colors
    chartIncome: '#0F5C4D',      // Deep Teal
    chartExpenses: '#1D4ED8',    // Blue
    chartExistingEmi: '#B45309', // Amber / Orange
    chartProposedEmi: '#7C3AED', // Purple
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    hero: 20,
    card: 16,
    button: 12,
    input: 12,
    chip: 999,
  },
  
  typography: {
    heroAmount: {
      fontSize: 34,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: '#0F1B2D',
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '400' as const,
      color: '#5B6776',
      lineHeight: 18,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#0F1B2D',
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#0F1B2D',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#5B6776',
    },
  },
};

export default Theme;
