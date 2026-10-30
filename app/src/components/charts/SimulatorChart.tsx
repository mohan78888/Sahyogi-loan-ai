import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { formatRupee, formatRupeeDiff } from '../../utils/finance';

interface SimulatorChartProps {
  baselineSurplus: number;
  scenarioSurplus: number;
  baselineEmiPct: number;
  scenarioEmiPct: number;
  style?: ViewStyle;
}

export const SimulatorChart: React.FC<SimulatorChartProps> = ({
  baselineSurplus,
  scenarioSurplus,
  baselineEmiPct,
  scenarioEmiPct,
  style,
}) => {
  const isScenarioDeficit = scenarioSurplus < 0;
  const surplusDiff = scenarioSurplus - baselineSurplus;
  const emiDiffPts = Math.round((scenarioEmiPct - baselineEmiPct) * 10) / 10;

  const maxSurplus = Math.max(Math.abs(baselineSurplus), Math.abs(scenarioSurplus), 1);
  const baselineBarWidth = Math.max(8, Math.round((Math.max(0, baselineSurplus) / maxSurplus) * 100));
  const scenarioBarWidth = Math.max(8, Math.round((Math.abs(scenarioSurplus) / maxSurplus) * 100));

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.title}>Live scenario simulation</Text>
        <Text style={styles.caption}>Compares your current baseline against slider adjustments</Text>
      </View>

      {/* Warning banner if scenario drops into deficit */}
      {isScenarioDeficit && (
        <View style={styles.deficitBanner}>
          <Feather name="alert-triangle" size={14} color={Theme.colors.danger} />
          <Text style={styles.deficitText}>
            Spending is higher than income under this scenario ({formatRupee(scenarioSurplus)}/mo)
          </Text>
        </View>
      )}

      {/* Surplus Comparison Bars */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionLabel}>Monthly Surplus</Text>

        {/* Baseline Bar */}
        <View style={styles.barItem}>
          <View style={styles.barRowLabel}>
            <Text style={styles.barTitle}>Baseline</Text>
            <Text style={styles.barValue}>{formatRupee(baselineSurplus)}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${baselineBarWidth}%`,
                  backgroundColor: baselineSurplus >= 0 ? '#0F5C4D' : Theme.colors.danger,
                },
              ]}
            />
          </View>
        </View>

        {/* Scenario Bar */}
        <View style={styles.barItem}>
          <View style={styles.barRowLabel}>
            <Text style={styles.barTitle}>Scenario</Text>
            <View style={styles.valWithDiff}>
              <Text
                style={[
                  styles.barValue,
                  isScenarioDeficit && { color: Theme.colors.danger },
                ]}
              >
                {formatRupee(scenarioSurplus)}
              </Text>
              <Text
                style={[
                  styles.diffPill,
                  {
                    color: surplusDiff >= 0 ? Theme.colors.success : Theme.colors.danger,
                  },
                ]}
              >
                ({formatRupeeDiff(surplusDiff)})
              </Text>
            </View>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${scenarioBarWidth}%`,
                  backgroundColor: isScenarioDeficit ? Theme.colors.danger : '#1D4ED8',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* EMI Burden Comparison Meter */}
      <View style={[styles.sectionWrap, styles.borderTop]}>
        <View style={styles.barRowLabel}>
          <Text style={styles.sectionLabel}>EMI Burden %</Text>
          <Text
            style={[
              styles.diffPill,
              {
                color: emiDiffPts <= 0 ? Theme.colors.success : Theme.colors.warning,
                fontWeight: '700',
              },
            ]}
          >
            {emiDiffPts > 0 ? `+${emiDiffPts} pts` : `${emiDiffPts} pts`}
          </Text>
        </View>

        <View style={styles.dualMeterRow}>
          <View style={styles.halfMeter}>
            <Text style={styles.meterSubtext}>Baseline: {baselineEmiPct}%</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, Math.max(0, baselineEmiPct))}%`,
                    backgroundColor: baselineEmiPct > 40 ? Theme.colors.danger : '#B45309',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.halfMeter}>
            <Text style={styles.meterSubtext}>Scenario: {scenarioEmiPct}%</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, Math.max(0, scenarioEmiPct))}%`,
                    backgroundColor: scenarioEmiPct > 40 ? Theme.colors.danger : '#B45309',
                  },
                ]}
              />
            </View>
          </View>
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
    marginBottom: Theme.spacing.lg,
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
  sectionWrap: {
    gap: 10,
  },
  borderTop: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  barItem: {
    gap: 4,
  },
  barRowLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barTitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  valWithDiff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diffPill: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  dualMeterRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  halfMeter: {
    flex: 1,
    gap: 4,
  },
  meterSubtext: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    fontWeight: '500',
  },
});

