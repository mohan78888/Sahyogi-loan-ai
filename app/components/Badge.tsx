import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { FactorStatus, RiskLevel } from '../types/analysis';

interface BadgeProps {
  label: string;
  status?: FactorStatus | RiskLevel | 'info';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, status = 'info', style }) => {
  const getColors = () => {
    switch (status) {
      case 'critical':
      case 'high':
        return { bg: Colors.errorLight, text: Colors.error, border: '#FECACA' };
      case 'warning':
      case 'medium':
        return { bg: Colors.warningLight, text: Colors.warning, border: '#FDE68A' };
      case 'favorable':
      case 'low':
        return { bg: Colors.successLight, text: Colors.success, border: '#A7F3D0' };
      case 'info':
      default:
        return { bg: Colors.infoLight, text: Colors.info, border: '#BFDBFE' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export default Badge;

