import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Theme } from '../theme/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isOutline && styles.outlineButton,
        isSecondary && styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline ? Theme.colors.primary : Theme.colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              isOutline && styles.outlineText,
              isSecondary && styles.secondaryText,
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    minHeight: 44,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.primaryTint,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  outlineText: {
    color: Theme.colors.text,
  },
  secondaryText: {
    color: Theme.colors.primary,
  },
});

export default PrimaryButton;

