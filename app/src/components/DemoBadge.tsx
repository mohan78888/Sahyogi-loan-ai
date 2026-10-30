import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme/theme';

interface DemoBadgeProps {
  label?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ label = 'Demo data' }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Theme.colors.warningTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.chip,
    alignSelf: 'flex-start',
  },
  text: {
    color: Theme.colors.warningText,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DemoBadge;

