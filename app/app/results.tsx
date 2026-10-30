import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { MetricGauge } from '../components/MetricGauge';
import { FactorCard } from '../components/FactorCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { AnalysisResult, VerificationChecklistItem } from '../types/analysis';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data?: string; input?: string }>();

  let result: AnalysisResult | null = null;
  try {
    if (params.data) {
      result = JSON.parse(params.data);
    }
  } catch (err) {
    console.error('Failed to parse analysis result data', err);
  }

  // Local checklist state so user can tick documents
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const toggleCheck = (index: number) => {
    setCheckedDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Analysis Results" showBack onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No analysis data available</Text>
          <Button
            title="Start New Audit"
            onPress={() => router.replace('/(tabs)/analyze')}
            style={styles.emptyBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleAskFollowUp = () => {
    router.push({
      pathname: '/(tabs)/chat',
      params: {
        query: `Based on my recent analysis (FOIR: ${result.foir_percentage}%, Risk: ${result.risk_level}), what is the quickest way I can improve my profile?`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Diagnostic Report"
        subtitle="AI Rejection Factor Breakdown"
        showBack
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={handleAskFollowUp} style={styles.chatActionBtn}>
            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summarySubtitle}>REJECTION RISK ASSESSMENT</Text>
              <Text style={styles.summaryTitle}>
                {result.risk_level.toUpperCase()} RISK PROFILE
              </Text>
            </View>
            <Badge label={result.risk_level} status={result.risk_level} />
          </View>

          <Text style={styles.summaryDesc}>{result.summary}</Text>
          <Text style={styles.confidenceDesc}>
            <Text style={styles.boldText}>Assessment Confidence: </Text>
            {result.confidence_text}
          </Text>
        </Card>

        {/* Primary Metric: FOIR Ratio */}
        <Text style={styles.sectionHeading}>Financial Capacity Metrics</Text>
        <Card style={styles.metricCard}>
          <MetricGauge
            label="Projected FOIR (Debt-to-Income)"
            value={result.foir_percentage}
            thresholdSafe={40}
            thresholdModerate={50}
            subtitle={`Your existing loans take ${result.existing_foir_percentage}% of income. Adding this loan pushes obligations to ${result.foir_percentage}%.`}
          />

          <View style={styles.miniStatsRow}>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatLabel}>Est. New Monthly EMI</Text>
              <Text style={styles.miniStatVal}>₹{result.estimated_new_emi.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatLabel}>Loan-to-Income Multiplier</Text>
              <Text style={styles.miniStatVal}>{result.lti_multiplier}x Annual</Text>
            </View>
          </View>
        </Card>

        {/* Rejection Factors Breakdown */}
        <Text style={styles.sectionHeading}>Identified Rejection Factors</Text>
        {result.factors.map((factor, idx) => (
          <FactorCard key={idx} factor={factor} />
        ))}

        {/* Actionable Next Steps / 4-Step Recovery Plan */}
        <Text style={styles.sectionHeading}>Recommended Action Plan</Text>
        <Card style={styles.planCard}>
          {result.recommendations.map((rec) => (
            <View key={rec.step} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{rec.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{rec.title}</Text>
                  <Text style={styles.stepTimeframe}>{rec.timeframe}</Text>
                </View>
                <Text style={styles.stepDesc}>{rec.description}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Verification Document Checklist */}
        <Text style={styles.sectionHeading}>Pre-Application Document Verification</Text>
        <Card style={styles.checklistCard}>
          <Text style={styles.checklistHeaderDesc}>
            Verify these documents before submitting your next loan application:
          </Text>
          {result.checklist.map((item: VerificationChecklistItem, idx: number) => {
            const isChecked = !!checkedDocs[idx];
            return (
              <TouchableOpacity
                key={idx}
                style={styles.checkItem}
                onPress={() => toggleCheck(idx)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isChecked ? Colors.success : Colors.textMuted}
                  style={styles.checkIcon}
                />
                <View style={styles.checkTextGroup}>
                  <Text style={[styles.checkItemText, isChecked && styles.checkItemStriked]}>
                    {item.item}
                  </Text>
                  <Text style={styles.checkCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* AI Chat Follow-up CTA */}
        <Card style={styles.chatPromptCard}>
          <View style={styles.chatPromptHeader}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
            <Text style={styles.chatPromptTitle}>Have questions about your report?</Text>
          </View>
          <Text style={styles.chatPromptDesc}>
            Ask LoanSaathi AI how to negotiate with the branch manager, fix CIBIL errors, or qualify for government subsidies.
          </Text>
          <Button
            title="Ask AI Follow-Up Questions"
            variant="primary"
            icon={<Ionicons name="chatbubbles" size={18} color={Colors.textPrimary} />}
            onPress={handleAskFollowUp}
            style={styles.chatBtn}
          />
        </Card>

        <DisclaimerBanner text={result.disclaimer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  chatActionBtn: {
    backgroundColor: Colors.primaryLight,
    padding: 8,
    borderRadius: 10,
  },
  summaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summarySubtitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  summaryTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  summaryDesc: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginTop: 4,
  },
  confidenceDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionHeading: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },
  metricCard: {
    padding: 16,
    marginBottom: 10,
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
    marginTop: 10,
  },
  miniStatItem: {
    flex: 1,
  },
  miniStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  miniStatVal: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  planCard: {
    padding: 16,
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#92400E',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  stepTimeframe: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  stepDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  checklistCard: {
    padding: 16,
    marginBottom: 10,
  },
  checklistHeaderDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checkIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  checkTextGroup: {
    flex: 1,
  },
  checkItemText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  checkItemStriked: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  checkCategory: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chatPromptCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#FDE68A',
    padding: 18,
    marginBottom: 10,
  },
  chatPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatPromptTitle: {
    ...Typography.h3,
    color: '#92400E',
    marginLeft: 8,
  },
  chatPromptDesc: {
    ...Typography.bodySmall,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 14,
  },
  chatBtn: {
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyBtn: {
    minWidth: 160,
  },
});

