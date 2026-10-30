import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { formatRupee } from '../../utils/finance';

interface IncomeSplitChartProps {
  income?: number | null;
  expenses?: number | null;
  existingEmi?: number | null;
  monthlySurplus?: number | null;
  style?: ViewStyle;
}

export const IncomeSplitChart: React.FC<IncomeSplitChartProps> = ({
  income,
  expenses = 0,
  existingEmi = 0,
  monthlySurplus,
  style,
}) => {
  const safeIncome = income && income > 0 ? income : 0;
  const safeExpenses = expenses ?? 0;
  const safeEmi = existingEmi ?? 0;

  // Empty state when income is missing or zero
  if (!safeIncome) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.chartHeader}>
          <Text style={styles.title}>Income split</Text>
        </View>
        <View style={styles.emptyContent}>
          <Feather name="pie-chart" size={24} color={Theme.colors.mutedText} />
          <Text style={styles.emptyText}>Add your monthly income to view your income split.</Text>
        </View>
      </View>
    );
  }

  const surplus =
    monthlySurplus !== undefined && monthlySurplus !== null
      ? monthlySurplus
      : safeIncome - safeExpenses - safeEmi;

  const isDeficit = surplus < 0;

  // Percentages clamped to sensible visual proportions
  const expensePct = Math.round((safeExpenses / safeIncome) * 1000) / 10;
  const emiPct = Math.round((safeEmi / safeIncome) * 1000) / 10;
  const surplusPct = Math.round((surplus / safeIncome) * 1000) / 10;

  // Visual bar segments (ensures total doesn't exceed 100%)
  const totalOutflow = safeExpenses + safeEmi;
  const expenseBarWidth = Math.min(100, Math.max(0, (safeExpenses / Math.max(safeIncome, totalOutflow)) * 100));
  const emiBarWidth = Math.min(100 - expenseBarWidth, Math.max(0, (safeEmi / Math.max(safeIncome, totalOutflow)) * 100));
  const surplusBarWidth = isDeficit
    ? 0
    : Math.max(0, 100 - expenseBarWidth - emiBarWidth);

  return (
    <View style={[styles.container, style]}>
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.title}>Income split</Text>
        <Text style={styles.caption}>Where your confirmed monthly earnings go</Text>
      </View>

      {/* Negative Surplus / Deficit Warning Banner */}
      {isDeficit && (
        <View style={styles.deficitBanner}>
          <Feather name="alert-triangle" size={14} color={Theme.colors.danger} />
          <Text style={styles.deficitText}>
            Spending is higher than income by {formatRupee(Math.abs(surplus))}/mo
          </Text>
        </View>
      )}

      {/* Stacked Horizontal Bar */}
      <View style={styles.barTrack}>
        {expenseBarWidth > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${expenseBarWidth}%`, backgroundColor: '#1D4ED8' },
            ]}
          />
        )}
        {emiBarWidth > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${emiBarWidth}%`, backgroundColor: '#B45309' },
            ]}
          />
        )}
        {!isDeficit && surplusBarWidth > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${surplusBarWidth}%`, backgroundColor: '#0F5C4D' },
            ]}
          />
        )}
      </View>

      {/* Breakdown Legend with Rupee amounts and percentages */}
      <View style={styles.legendContainer}>
        {/* Expenses Legend */}
        <View style={styles.legendItem}>
          <View style={styles.legendLabelRow}>
            <View style={[styles.colorDot, { backgroundColor: '#1D4ED8' }]} />
            <Text style={styles.legendLabel}>Expenses</Text>
          </View>
          <Text style={styles.legendValue}>{formatRupee(safeExpenses)}</Text>
          <Text style={styles.legendPct}>{expensePct}%</Text>
        </View>

        {/* Existing EMI Legend */}
        <View style={styles.legendItem}>
          <View style={styles.legendLabelRow}>
            <View style={[styles.colorDot, { backgroundColor: '#B45309' }]} />
            <Text style={styles.legendLabel}>Existing EMI</Text>
          </View>
          <Text style={styles.legendValue}>{formatRupee(safeEmi)}</Text>
          <Text style={styles.legendPct}>{emiPct}%</Text>
        </View>

        {/* Surplus Legend */}
        <View style={styles.legendItem}>
          <View style={styles.legendLabelRow}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: isDeficit ? Theme.colors.danger : '#0F5C4D' },
              ]}
            />
            <Text style={styles.legendLabel}>{isDeficit ? 'Deficit' : 'Surplus'}</Text>
          </View>
          <Text
            style={[
              styles.legendValue,
              isDeficit && { color: Theme.colors.danger },
            ]}
          >
            {formatRupee(surplus)}
          </Text>
          <Text
            style={[
              styles.legendPct,
              isDeficit && { color: Theme.colors.danger },
            ]}
          >
            {surplusPct}%
          </Text>
        </View>
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
  deficitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.dangerTint,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.md,
  },
  deficitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.danger,
    flex: 1,
  },
  barTrack: {
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.xs,
  },
  legendItem: {
    flex: 1,
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  legendPct: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    marginTop: 1,
  },
});

