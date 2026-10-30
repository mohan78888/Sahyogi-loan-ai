import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface MetricGaugeProps {
  label: string;
  value: number; // 0 to 100 percentage
  thresholdSafe?: number;
  thresholdModerate?: number;
  unit?: string;
  subtitle?: string;
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  thresholdSafe = 40,
  thresholdModerate = 50,
  unit = '%',
  subtitle,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  const getStatusColor = () => {
    if (clamped <= thresholdSafe) return Colors.success;
    if (clamped <= thresholdModerate) return Colors.warning;
    return Colors.error;
  };

  const color = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueText, { color }]}>
          {value.toFixed(1)}
          {unit}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.benchmarksRow}>
        <Text style={styles.benchmarkLabel}>Safe (&lt;{thresholdSafe}%)</Text>
        <Text style={styles.benchmarkLabel}>Limit ({thresholdModerate}%)</Text>
        <Text style={styles.benchmarkLabel}>High (&gt;{thresholdModerate}%)</Text>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  valueText: {
    ...Typography.h2,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  benchmarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  benchmarkLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

export default MetricGauge;

