import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { formatRupee } from '../../utils/finance';

interface BeforeAfterEmiChartProps {
  currentSurplus?: number | null;
  surplusAfterProposed?: number | null;
  proposedEmi?: number | null;
  style?: ViewStyle;
}

export const BeforeAfterEmiChart: React.FC<BeforeAfterEmiChartProps> = ({
  currentSurplus = 0,
  surplusAfterProposed,
  proposedEmi,
  style,
}) => {
  const hasProposed = proposedEmi !== null && proposedEmi !== undefined && proposedEmi > 0;

  // Empty state if proposed EMI is not entered
  if (!hasProposed) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.chartHeader}>
          <Text style={styles.title}>Before vs after proposed EMI</Text>
        </View>
        <View style={styles.emptyContent}>
          <Feather name="sliders" size={24} color={Theme.colors.mutedText} />
          <Text style={styles.emptyText}>
            Enter a proposed new EMI to preview your before vs after surplus buffer.
          </Text>
        </View>
      </View>
    );
  }

  const safeCurrent = currentSurplus ?? 0;
  const safeAfter =
    surplusAfterProposed !== undefined && surplusAfterProposed !== null
      ? surplusAfterProposed
      : safeCurrent - (proposedEmi ?? 0);

  const isAfterDeficit = safeAfter < 0;
  const maxVal = Math.max(Math.abs(safeCurrent), Math.abs(safeAfter), 1);

  const currentBarWidth = Math.max(8, Math.round((Math.max(0, safeCurrent) / maxVal) * 100));
  const afterBarWidth = Math.max(8, Math.round((Math.abs(safeAfter) / maxVal) * 100));

  return (
    <View style={[styles.container, style]}>
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.title}>Before vs after proposed EMI</Text>
        <Text style={styles.caption}>
          Impact of adding a {formatRupee(proposedEmi)}/month commitment
        </Text>
      </View>

      {/* Warning if deficit occurs */}
      {isAfterDeficit && (
        <View style={styles.deficitBanner}>
          <Feather name="alert-circle" size={14} color={Theme.colors.danger} />
          <Text style={styles.deficitBannerText}>
            Spending is higher than income with this proposed EMI
          </Text>
        </View>
      )}

      {/* Comparison Bars */}
      <View style={styles.barsContainer}>
        {/* Bar 1: Current Monthly Surplus */}
        <View style={styles.barItem}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Current surplus</Text>
            <Text style={[styles.barAmount, { color: safeCurrent >= 0 ? '#0F5C4D' : Theme.colors.danger }]}>
              {formatRupee(safeCurrent)}/mo
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${currentBarWidth}%`,
                  backgroundColor: safeCurrent >= 0 ? '#0F5C4D' : Theme.colors.danger,
                },
              ]}
            />
          </View>
        </View>

        {/* Bar 2: Surplus After Proposed EMI */}
        <View style={styles.barItem}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>After new EMI</Text>
            <Text
              style={[
                styles.barAmount,
                { color: isAfterDeficit ? Theme.colors.danger : '#0F5C4D' },
              ]}
            >
              {formatRupee(safeAfter)}/mo
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${afterBarWidth}%`,
                  backgroundColor: isAfterDeficit ? Theme.colors.danger : '#0F5C4D',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Diff Pill */}
      <View style={styles.summaryFooter}>
        <Text style={styles.footerCaption}>
          Monthly buffer reduction: <Text style={styles.footerBold}>−{formatRupee(proposedEmi)}</Text>
        </Text>
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
  deficitBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.danger,
    flex: 1,
  },
  barsContainer: {
    gap: Theme.spacing.md,
  },
  barItem: {
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
  barAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  summaryFooter: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  footerCaption: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  footerBold: {
    fontWeight: '700',
    color: Theme.colors.text,
  },
});

