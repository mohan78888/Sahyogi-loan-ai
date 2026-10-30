import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';

interface DocumentCompletenessChartProps {
  confirmedCount?: number;
  totalTarget?: number;
  style?: ViewStyle;
}

export const DocumentCompletenessChart: React.FC<DocumentCompletenessChartProps> = ({
  confirmedCount = 0,
  totalTarget = 5,
  style,
}) => {
  const safeCount = Math.max(0, Math.min(totalTarget, confirmedCount));
  const completionPct = Math.round((safeCount / totalTarget) * 100);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Document completeness</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {safeCount} of {totalTarget} confirmed
            </Text>
          </View>
        </View>
        <Text style={styles.caption}>
          Confirmed documents increase financial health assessment accuracy
        </Text>
      </View>

      {/* Segmented Step Indicator */}
      <View style={styles.segmentRow}>
        {Array.from({ length: totalTarget }).map((_, idx) => {
          const isFilled = idx < safeCount;
          return (
            <View
              key={idx}
              style={[
                styles.segment,
                {
                  backgroundColor: isFilled ? Theme.colors.primary : '#E2E8F0',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Percentage Row & Trust Note */}
      <View style={styles.footerRow}>
        <Text style={styles.pctText}>{completionPct}% verified</Text>
        <View style={styles.trustNoteRow}>
          <Feather name="shield" size={11} color={Theme.colors.mutedText} />
          <Text style={styles.trustNote}>Not bank-verified</Text>
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
  chartHeader: {
    marginBottom: Theme.spacing.md,
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
  countBadge: {
    backgroundColor: Theme.colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.chip,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  caption: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: Theme.spacing.sm,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  trustNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustNote: {
    fontSize: 11,
    color: Theme.colors.mutedText,
  },
});

