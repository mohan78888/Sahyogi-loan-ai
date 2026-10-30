import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing application criteria with AI...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
      </View>
      <Text style={styles.title}>Evaluating Loan Profile</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.stepContainer}>
        <Text style={styles.stepText}>• Checking FOIR & debt-to-income benchmarks</Text>
        <Text style={styles.stepText}>• Parsing credit score cut-offs</Text>
        <Text style={styles.stepText}>• Compiling actionable recovery plan</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  spinnerWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepContainer: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
    borderRadius: 10,
  },
  stepText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
});

export default LoadingState;

