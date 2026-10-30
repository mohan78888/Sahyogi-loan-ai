import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { RejectionFactor } from '../types/analysis';

interface FactorCardProps {
  factor: RejectionFactor;
}

export const FactorCard: React.FC<FactorCardProps> = ({ factor }) => {
  const getIconName = () => {
    switch (factor.status) {
      case 'critical':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'favorable':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (factor.status) {
      case 'critical':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'favorable':
        return Colors.success;
      default:
        return Colors.info;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Ionicons
            name={getIconName()}
            size={20}
            color={getIconColor()}
            style={styles.icon}
          />
          <Text style={styles.title}>{factor.name}</Text>
        </View>
        <Badge label={factor.metric} status={factor.status} />
      </View>

      <Text style={styles.explanation}>{factor.explanation}</Text>

      {factor.suggestion ? (
        <View style={styles.suggestionBox}>
          <Ionicons name="bulb-outline" size={16} color={Colors.primaryDark} style={styles.bulbIcon} />
          <Text style={styles.suggestionText}>{factor.suggestion}</Text>
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  explanation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  suggestionBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  bulbIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  suggestionText: {
    ...Typography.bodySmall,
    color: '#854D0E',
    flex: 1,
    fontWeight: '500',
  },
});

export default FactorCard;

