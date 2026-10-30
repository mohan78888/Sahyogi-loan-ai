import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { formatRupee } from '../../utils/finance';

interface CashFlowBarsProps {
  income?: number | null;
  expenses?: number | null;
  existingEmi?: number | null;
  proposedEmi?: number | null;
  style?: ViewStyle;
}

export const CashFlowBars: React.FC<CashFlowBarsProps> = ({
  income,
  expenses = 0,
  existingEmi = 0,
  proposedEmi,
  style,
}) => {
  const safeIncome = income && income > 0 ? income : 0;

  // Empty state when income is not provided
  if (!safeIncome) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.chartHeader}>
          <Text style={styles.title}>Cash flow comparison</Text>
        </View>
        <View style={styles.emptyContent}>
          <Feather name="bar-chart-2" size={24} color={Theme.colors.mutedText} />
          <Text style={styles.emptyText}>Add confirmed financial numbers to see cash flow bars.</Text>
        </View>
      </View>
    );
  }

  const safeExpenses = expenses ?? 0;
  const safeExistingEmi = existingEmi ?? 0;
  const hasProposed = proposedEmi !== null && proposedEmi !== undefined && proposedEmi > 0;
  const safeProposedEmi = hasProposed ? proposedEmi! : 0;

  const maxVal = Math.max(safeIncome, safeExpenses, safeExistingEmi, safeProposedEmi, 1);

  const bars = [
    {
      label: 'Monthly Income',
      value: safeIncome,
      color: '#0F5C4D',
      widthPct: Math.round((safeIncome / maxVal) * 100),
      isProvided: true,
    },
    {
      label: 'Living Expenses',
      value: safeExpenses,
      color: '#1D4ED8',
      widthPct: Math.round((safeExpenses / maxVal) * 100),
      isProvided: true,
    },
    {
      label: 'Existing EMI',
      value: safeExistingEmi,
      color: '#B45309',
      widthPct: Math.round((safeExistingEmi / maxVal) * 100),
      isProvided: true,
    },
    {
      label: 'Proposed EMI',
      value: safeProposedEmi,
      color: '#7C3AED',
      widthPct: hasProposed ? Math.round((safeProposedEmi / maxVal) * 100) : 0,
      isProvided: hasProposed,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.title}>Cash flow comparison</Text>
        <Text style={styles.caption}>Inflows vs recurring monthly commitments</Text>
      </View>

      {/* Bar List */}
      <View style={styles.barsList}>
        {bars.map((item, idx) => (
          <View key={idx} style={styles.barRow}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={[styles.barValue, !item.isProvided && styles.notProvidedText]}>
                {item.isProvided ? formatRupee(item.value) : 'Not provided'}
              </Text>
            </View>

            <View style={styles.track}>
              {item.isProvided && item.widthPct > 0 ? (
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(4, Math.min(100, item.widthPct))}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              ) : (
                <View style={[styles.barFill, styles.notProvidedFill]} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.card,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyContainer: {
    paddingVertical: Theme.spacing.xl,
  },
  chartHeader: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  caption: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Theme.spacing.md,
  },
  emptyText: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    textAlign: 'center',
  },
  barsList: {
    gap: Theme.spacing.md,
  },
  barRow: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  notProvidedText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.mutedText,
    fontStyle: 'italic',
  },
  track: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  notProvidedFill: {
    width: '15%',
    backgroundColor: '#CBD5E1',
    opacity: 0.5,
  },
});

