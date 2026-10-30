import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';

export interface InfluenceFactor {
  name: string;
  impact: string;
  direction: 'positive' | 'negative';
  barPct: number;
}

interface PatternInfluenceBarsProps {
  factors?: InfluenceFactor[] | null;
  isRealModel: boolean;
  isDemoMode: boolean;
  style?: ViewStyle;
}

export const PatternInfluenceBars: React.FC<PatternInfluenceBarsProps> = ({
  factors,
  isRealModel,
  isDemoMode,
  style,
}) => {
  const hasValidFactors = factors && factors.length > 0 && (isRealModel || isDemoMode);

  // If no real model inference and not demo mode, hide with helpful empty message
  if (!hasValidFactors) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <View style={styles.chartHeader}>
          <Text style={styles.title}>Feature influence</Text>
        </View>
        <View style={styles.emptyContent}>
          <Feather name="bar-chart" size={24} color={Theme.colors.mutedText} />
          <Text style={styles.emptyTitle}>Influence bars available after training</Text>
          <Text style={styles.emptySubtitle}>
            Relative weights are calculated by the trained Random Forest model once connected.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>What influenced this check</Text>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Sample weights</Text>
            </View>
          )}
        </View>
        <Text style={styles.caption}>
          Relative influence of confirmed financial indicators on repayment patterns
        </Text>
      </View>

      {/* Factor Bars List */}
      <View style={styles.factorList}>
        {factors!.map((factor, idx) => {
          const isPositive = factor.direction === 'positive';
          const barColor = isPositive ? '#0F5C4D' : '#B45309';

          return (
            <View key={idx} style={[styles.factorRow, idx > 0 && styles.factorBorder]}>
              <View style={styles.factorHeader}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={[styles.factorImpact, { color: barColor }]}>
                  {factor.impact}
                </Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(100, Math.max(5, factor.barPct))}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
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
  demoBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.radius.chip,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  caption: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Theme.spacing.md,
  },
  factorList: {
    gap: Theme.spacing.sm,
  },
  factorRow: {
    paddingVertical: 6,
    gap: 6,
  },
  factorBorder: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorName: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  factorImpact: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

