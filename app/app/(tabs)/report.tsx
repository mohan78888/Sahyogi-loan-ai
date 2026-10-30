import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Theme } from '../../src/theme/theme';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { DemoBadge } from '../../src/components/DemoBadge';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ManualEntrySheet } from '../../src/components/ManualEntrySheet';
import { useFinance } from '../../src/context/FinanceContext';
import { formatRupee } from '../../src/utils/finance';
import { IncomeSplitChart } from '../../src/components/charts';

interface Recommendation {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  why: string;
  timeframe: string;
}

export default function ReportScreen() {
  const router = useRouter();
  const {
    source,
    inputs,
    calculations,
    hasData,
    aiReport,
    isBackendConnected,
    documents,
    loadDemo,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);

  // Pure deterministic calculations
  const income = inputs.income || 0;
  const expenses = inputs.expenses || 0;
  const existingEmi = inputs.existingEmi || 0;
  const proposedEmi = inputs.proposedEmi || 0;
  const monthlySurplus = calculations.monthlySurplus ?? (income - expenses - existingEmi);
  const emiPct = calculations.emiToIncomePct ?? (income > 0 ? Math.round((existingEmi / income) * 1000) / 10 : 0);
  const surplusAfterProposed = calculations.surplusAfterNewEmi ?? (monthlySurplus - proposedEmi);

  // Deterministic summary text
  const summaryText = aiReport?.summary || (
    hasData
      ? `Your confirmed monthly income of ${formatRupee(income)} against ${formatRupee(expenses)} living expenses leaves an operating surplus of ${formatRupee(monthlySurplus)}. Existing obligations consume ${emiPct}% of monthly earnings. ${
          proposedEmi > 0
            ? surplusAfterProposed >= 0
              ? `After accounting for the proposed ${formatRupee(proposedEmi)} EMI, your projected buffer is ${formatRupee(surplusAfterProposed)}/month.`
              : `The proposed new EMI of ${formatRupee(proposedEmi)} exceeds your monthly surplus by ${formatRupee(Math.abs(surplusAfterProposed))}.`
            : 'No new EMI is proposed yet; you can test affordability in the what-if simulator.'
        }`
      : 'No confirmed financial details to display.'
  );

  // Deterministic strengths
  const strengthsText = aiReport?.financial_strengths?.length
    ? aiReport.financial_strengths.join(' ')
    : emiPct < 35
    ? `Existing EMI-to-income ratio of ${emiPct}% is well within the healthy 35% threshold. Positive net operating buffer of ${formatRupee(monthlySurplus)} per month.`
    : `Confirmed regular monthly income of ${formatRupee(income)}. Positive cash flow buffer before new obligations.`;

  // Deterministic risks
  const riskText = aiReport?.risk_indicators?.length
    ? aiReport.risk_indicators.join(' ')
    : proposedEmi > 0 && surplusAfterProposed < 0
    ? `Proposed new EMI of ${formatRupee(proposedEmi)} turns net surplus negative (${formatRupee(surplusAfterProposed)}/mo), posing cash flow risk.`
    : emiPct >= 40
    ? `Current EMI burden is ${emiPct}%, exceeding the 40% recommended safe limit.`
    : monthlySurplus < 10000
    ? `Monthly buffer of ${formatRupee(monthlySurplus)} leaves limited absorption room for unexpected medical or household contingencies.`
    : 'Maintain a 2-month reserve before committing to any long-term debt obligation.';

  // Deterministic missing info
  const missingItems: string[] = [];
  if (!inputs.creditScore) missingItems.push('Credit score not confirmed');
  if (!inputs.loanAmount) missingItems.push('Target loan amount not specified');
  const confirmedDocs = documents.filter((d) => d.status === 'confirmed').length;
  if (confirmedDocs < 3) missingItems.push(`${5 - confirmedDocs} verification document slots remaining`);

  const missingText = aiReport?.missing_information?.length
    ? aiReport.missing_information.join(' ')
    : missingItems.length > 0
    ? missingItems.join(' · ') + '. Adding these strengthens reliability.'
    : 'All primary financial inputs and verification documents confirmed.';

  // Deterministic recommendations
  const recommendations: Recommendation[] = aiReport?.recommendations?.length
    ? aiReport.recommendations.map((rec, i) => ({
        id: `rec-live-${i}`,
        title: rec.title,
        priority: (rec.priority ? rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1) : 'Medium') as 'High' | 'Medium' | 'Low',
        description: rec.action,
        why: rec.reason,
        timeframe: rec.timeframe || 'Within 30 days',
      }))
    : [
        ...(proposedEmi > 0 && surplusAfterProposed < 0
          ? [
              {
                id: 'rec-1',
                title: 'Rightsize proposed EMI to preserve surplus',
                priority: 'High' as const,
                description: `Consider lowering the loan amount or extending tenure so the new EMI stays comfortably below ${formatRupee(monthlySurplus)}.`,
                why: 'A negative surplus creates immediate vulnerability to missed payments.',
                timeframe: 'Immediate',
              },
            ]
          : emiPct > 35
          ? [
              {
                id: 'rec-1',
                title: 'Prepay or consolidate high-rate debt',
                priority: 'High' as const,
                description: `Paying down existing EMIs to bring your burden below 35% will substantially increase borrowing safety.`,
                why: 'Reduces monthly cash outflow and lowers debt servicing stress.',
                timeframe: 'Within 30 days',
              },
            ]
          : [
              {
                id: 'rec-1',
                title: 'Build a dedicated emergency reserve',
                priority: 'Medium' as const,
                description: `Set aside at least 1-2 months of living expenses (${formatRupee(expenses * 1.5)}) before taking new loans.`,
                why: 'Provides a cushion against temporary cash flow disruptions.',
                timeframe: 'Within 30 days',
              },
            ]),
        {
          id: 'rec-2',
          title: 'Preserve surplus headroom in simulator',
          priority: 'Medium' as const,
          description: 'Use the what-if simulator to test interest rate shifts (+1% to +2%) on your monthly budget.',
          why: 'Ensures you remain solvent even if inflation or rate revisions increase monthly expenses.',
          timeframe: 'Within 60 days',
        },
        {
          id: 'rec-3',
          title: 'Document 3 consecutive surplus cycles',
          priority: 'Low' as const,
          description: 'Keep regular bank records demonstrating positive monthly balance without debit returns.',
          why: 'Verifiable repayment discipline is the strongest indicator of sustainable borrowing.',
          timeframe: 'Within 90 days',
        },
      ];

  // Roadmap plan
  const roadmapSteps = [
    {
      period: '30 DAYS',
      action: `Audit discretionary expenses to safeguard your ${formatRupee(monthlySurplus)} surplus. Confirm salary slips or bank statements.`,
    },
    {
      period: '60 DAYS',
      action: `Test safe EMI ranges in the what-if simulator. Ensure total obligations do not cross 40% of income.`,
    },
    {
      period: '90 DAYS',
      action: `Maintain 3 straight months of positive surplus and clean bank balance before finalizing loan agreements.`,
    },
  ];

  const badgeLabel = source === 'demo' ? 'Demo data' : isBackendConnected && aiReport ? 'Live AI report' : hasData ? 'Your data' : 'Empty';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Demo Badge */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.title}>AI report</Text>
            <DemoBadge label={badgeLabel} />
          </View>
          <Text style={styles.subtitle}>
            Personalized advice based on your confirmed numbers and historical patterns.
          </Text>
        </View>

        {!hasData ? (
          /* Empty / Fresh State Card */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="file-text" size={28} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No confirmed financial details</Text>
            <Text style={styles.emptySubtitle}>
              Add your monthly income, living expenses, and existing EMIs to generate your personalized financial health audit, risk indicators, and 30·60·90 day roadmap.
            </Text>

            <View style={styles.emptyActionRow}>
              <PrimaryButton
                title="Enter manually (10s)"
                onPress={() => setManualSheetVisible(true)}
                style={styles.emptyBtn}
              />
              <PrimaryButton
                title="Upload document"
                variant="outline"
                onPress={() => router.navigate('/(tabs)/docs' as any)}
                style={styles.emptyBtn}
              />
            </View>

            <TouchableOpacity
              onPress={async () => {
                await loadDemo();
              }}
              style={styles.demoLinkBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.demoLinkText}>Or load demo profile →</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Teal Summary Card */}
            <Card variant="teal" style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>SUMMARY</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </Card>

            {/* Income Split Chart */}
            <IncomeSplitChart
              income={inputs.income}
              expenses={inputs.expenses}
              existingEmi={inputs.existingEmi}
              monthlySurplus={calculations.monthlySurplus}
              style={{ marginBottom: Theme.spacing.xl }}
            />

            {/* 3 Callout Cards: Strengths, Risk indicators, Missing info */}
            <View style={styles.calloutsContainer}>
              {/* Strengths */}
              <View style={[styles.calloutCard, styles.strengthBox]}>
                <View style={styles.calloutHeader}>
                  <Feather name="check-circle" size={16} color={Theme.colors.success} />
                  <Text style={[styles.calloutTitle, { color: Theme.colors.success }]}>
                    Strengths
                  </Text>
                </View>
                <Text style={styles.calloutBody}>{strengthsText}</Text>
              </View>

              {/* Risk indicators */}
              <View style={[styles.calloutCard, styles.riskBox]}>
                <View style={styles.calloutHeader}>
                  <Feather name="alert-circle" size={16} color={Theme.colors.warning} />
                  <Text style={[styles.calloutTitle, { color: Theme.colors.warningText }]}>
                    Risk indicators
                  </Text>
                </View>
                <Text style={styles.calloutBody}>{riskText}</Text>
              </View>

              {/* Missing information */}
              <View style={[styles.calloutCard, styles.missingBox]}>
                <View style={styles.calloutHeader}>
                  <Feather name="help-circle" size={16} color={Theme.colors.info} />
                  <Text style={[styles.calloutTitle, { color: Theme.colors.infoText }]}>
                    Missing information
                  </Text>
                </View>
                <Text style={styles.calloutBody}>{missingText}</Text>
              </View>
            </View>

            {/* Recommendations Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <Text style={styles.sectionSubtitle}>
                Specific actions to improve your buffer before taking on new debt.
              </Text>
            </View>

            <View style={styles.recommendationsList}>
              {recommendations.map((rec) => (
                <Card key={rec.id} style={styles.recCard}>
                  <View style={styles.recHeaderRow}>
                    <Text style={styles.recTitle}>{rec.title}</Text>
                    <Chip
                      label={rec.priority}
                      variant={rec.priority === 'High' ? 'danger' : 'warning'}
                    />
                  </View>

                  <Text style={styles.recDescription}>{rec.description}</Text>

                  <View style={styles.recMetaBox}>
                    <Text style={styles.recWhyText}>
                      <Text style={styles.recWhyLabel}>Why: </Text>
                      {rec.why}
                    </Text>
                    <View style={styles.recTimeframeRow}>
                      <Feather name="clock" size={13} color={Theme.colors.mutedText} />
                      <Text style={styles.recTimeframeText}>{rec.timeframe}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            {/* Roadmap Plan Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your 30 · 60 · 90 day plan</Text>
              <Text style={styles.sectionSubtitle}>
                Step-by-step milestones to prepare your finances.
              </Text>
            </View>

            <Card style={styles.roadmapCard}>
              {roadmapSteps.map((step, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.roadmapRow,
                    idx > 0 && styles.roadmapBorderTop,
                  ]}
                >
                  <View style={styles.roadmapBadge}>
                    <Text style={styles.roadmapBadgeText}>{step.period}</Text>
                  </View>
                  <Text style={styles.roadmapActionText}>{step.action}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Informational assessment disclaimer */}
        <View style={styles.disclaimerBox}>
          <Feather name="info" size={13} color={Theme.colors.mutedText} />
          <Text style={styles.disclaimerText}>
            Informational assessment only. Not a lender decision.
          </Text>
        </View>
      </ScrollView>

      {/* Manual Entry Sheet Modal */}
      <ManualEntrySheet
        visible={manualSheetVisible}
        onClose={() => setManualSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    lineHeight: 18,
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  emptyBtn: {
    flex: 1,
  },
  demoLinkBtn: {
    paddingVertical: Theme.spacing.xs,
  },
  demoLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  summaryCard: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primaryLight,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '500',
  },
  calloutsContainer: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  calloutCard: {
    borderRadius: Theme.radius.card,
    padding: Theme.spacing.md,
    borderWidth: 1,
  },
  strengthBox: {
    backgroundColor: Theme.colors.successTint,
    borderColor: '#C2E7CE',
  },
  riskBox: {
    backgroundColor: Theme.colors.warningBox,
    borderColor: Theme.colors.warningBorder,
  },
  missingBox: {
    backgroundColor: Theme.colors.infoTint,
    borderColor: '#C3D4FC',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  calloutBody: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  recommendationsList: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  recCard: {
    padding: Theme.spacing.lg,
  },
  recHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  recDescription: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  recMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.sm,
    gap: 4,
  },
  recWhyText: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    lineHeight: 16,
  },
  recWhyLabel: {
    fontWeight: '700',
    color: Theme.colors.text,
  },
  recTimeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  recTimeframeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.mutedText,
  },
  roadmapCard: {
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  roadmapBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  roadmapBadge: {
    backgroundColor: Theme.colors.primaryTint,
    borderRadius: Theme.radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 74,
    alignItems: 'center',
  },
  roadmapBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  roadmapActionText: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Theme.spacing.sm,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
  },
});
