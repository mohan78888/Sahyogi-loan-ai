import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface DisclaimerBannerProps {
  text?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  text = 'Sahyogi Loan AI is an informational decision-support guide. It is not an approval authority or credit bureau. Always verify terms directly with RBI-regulated lenders.',
}) => {
  return (
    <View style={styles.banner}>
      <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textSecondary} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  text: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});

export default DisclaimerBanner;

