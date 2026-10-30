import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { formatRupee } from '../../utils/finance';

export const DEFAULT_CAUTION_THRESHOLD = 40; // Configurable constant (40%)

interface EmiBurdenMeterProps {
  income?: number | null;
  existingEmi?: number | null;
  cautionThreshold?: number;
  style?: ViewStyle;
}

export const EmiBurdenMeter: React.FC<EmiBurdenMeterProps> = ({
  income,
  existingEmi,
  cautionThreshold = DEFAULT_CAUTION_THRESHOLD,
  style,
}) => {
  const safeIncome = income && income > 0 ? income : 0;
  const safeEmi = existingEmi ?? 0;

  // Empty state if income is missing or 0
  if (!safeIncome) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.chartHeader}>
          <Text style={styles.title}>EMI burden meter</Text>
        </View>
        <View style={styles.emptyContent}>
          <Feather name="activity" size={24} color={Theme.colors.mutedText} />
          <Text style={styles.emptyText}>Add income and EMI to view your debt burden meter.</Text>
        </View>
      </View>
    );
  }

  const emiPct = Math.round((safeEmi / safeIncome) * 1000) / 10;
  const clampedFill = Math.min(100, Math.max(0, emiPct));

  // Determine severity tier
  let statusColor = '#0F5C4D';
  let statusText = 'Comfortable';
  if (emiPct > cautionThreshold) {
    statusColor = Theme.colors.danger;
    statusText = 'Elevated';
  } else if (emiPct >= 30) {
    statusColor = '#B45309';
    statusText = 'Moderate';
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>EMI burden meter</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        <Text style={styles.caption}>
          Existing EMI ({formatRupee(safeEmi)}) / Monthly income ({formatRupee(safeIncome)})
        </Text>
      </View>

      {/* Meter Number Display */}
      <View style={styles.valueRow}>
        <Text style={[styles.mainValue, { color: statusColor }]}>{emiPct}%</Text>
        <Text style={styles.subtext}>of monthly earnings committed to debt</Text>
      </View>

      {/* Meter Bar with Caution Threshold Pin */}
      <View style={styles.meterContainer}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${clampedFill}%`, backgroundColor: statusColor },
            ]}
          />
        </View>

        {/* 40% Caution Threshold Pin Indicator */}
        <View style={[styles.cautionPin, { left: `${cautionThreshold}%` }]}>
          <View style={styles.pinLine} />
          <View style={styles.pinLabelWrap}>
            <Text style={styles.pinLabelText}>{cautionThreshold}% caution</Text>
          </View>
        </View>
      </View>

      {/* Mandatory Disclaimer Label */}
      <View style={styles.cautionFooterRow}>
        <Feather name="info" size={12} color={Theme.colors.mutedText} />
        <Text style={styles.cautionDisclaimer}>
          Illustrative level, not a lender rule
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
    marginBottom: Theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.chip,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: Theme.spacing.sm,
  },
  mainValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtext: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  meterContainer: {
    height: 38,
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: Theme.spacing.xs,
  },
  track: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  cautionPin: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
  },
  pinLine: {
    width: 2,
    height: '100%',
    backgroundColor: Theme.colors.mutedText,
  },
  pinLabelWrap: {
    position: 'absolute',
    bottom: -16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  pinLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: Theme.colors.mutedText,
    textAlign: 'center',
  },
  cautionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Theme.spacing.md,
  },
  cautionDisclaimer: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    fontStyle: 'italic',
  },
});

