import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'hero' | 'dashed' | 'softBox' | 'teal' | 'warning';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  let variantStyle: ViewStyle = styles.default;
  if (variant === 'hero' || variant === 'teal') variantStyle = styles.hero;
  else if (variant === 'dashed') variantStyle = styles.dashed;
  else if (variant === 'softBox' || variant === 'warning') variantStyle = styles.softBox;

  return <View style={[styles.base, variantStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    padding: Theme.spacing.lg,
  },
  default: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  hero: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.hero,
  },
  dashed: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.card,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softBox: {
    backgroundColor: Theme.colors.warningSoftBox,
    borderRadius: Theme.radius.card,
    borderWidth: 1,
    borderColor: Theme.colors.warningBorder,
  },
});

export default Card;
