import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../theme/theme';

export type ChipVariant =
  | 'Confirmed'
  | 'Needs review'
  | 'Processing'
  | 'Looks clear'
  | 'Please check'
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Demo data'
  | 'Sample output'
  | 'sample'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'custom';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  bgColor?: string;
  textColor?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'custom',
  style,
  textStyle,
  bgColor,
  textColor,
}) => {
  let bg = bgColor || Theme.colors.borderLight;
  let fg = textColor || Theme.colors.mutedText;

  switch (variant) {
    case 'Confirmed':
    case 'Looks clear':
      bg = Theme.colors.successTint;
      fg = Theme.colors.successText;
      break;
    case 'Needs review':
    case 'Please check':
    case 'Medium':
    case 'Demo data':
    case 'Sample output':
    case 'sample':
    case 'warning':
      bg = Theme.colors.warningTint;
      fg = Theme.colors.warningText;
      break;
    case 'Processing':
    case 'Low':
      bg = Theme.colors.infoTint;
      fg = Theme.colors.infoText;
      break;
    case 'High':
    case 'danger':
      bg = Theme.colors.dangerTint;
      fg = Theme.colors.dangerText;
      break;
    case 'neutral':
      bg = Theme.colors.borderLight;
      fg = Theme.colors.mutedText;
      break;
  }

  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <Text style={[styles.chipText, { color: fg }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.chip,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Chip;
