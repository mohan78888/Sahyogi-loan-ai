import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/theme';

interface MetricTileProps {
  label: string;
  value: string;
  style?: ViewStyle;
}

export const MetricTile: React.FC<MetricTileProps> = ({ label, value, style }) => {
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.card,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  label: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
});

export default MetricTile;

