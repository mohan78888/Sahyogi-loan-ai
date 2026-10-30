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
import { formatRupee } from '../../src/utils/finance';
import { useFinance } from '../../src/context/FinanceContext';
import { Card } from '../../src/components/Card';
import { MetricTile } from '../../src/components/MetricTile';
import { DemoBadge } from '../../src/components/DemoBadge';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ManualEntrySheet } from '../../src/components/ManualEntrySheet';
import {
  IncomeSplitChart,
  CashFlowBars,
  EmiBurdenMeter,
  BeforeAfterEmiChart,
} from '../../src/components/charts';

export default function AnalysisScreen() {
  const router = useRouter();
  const {
    source,
    inputs,
    calculations,
    hasData,
    loadDemo,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);

  const income = inputs.income || 1;
  const expensePct = hasData ? Math.min(100, Math.round(((inputs.expenses || 0) / income) * 100)) : 0;
  const emiPct = hasData && calculations.emiToIncomePct !== null ? calculations.emiToIncomePct : 0;
  const proposedEmiPct = hasData && inputs.proposedEmi ? Math.min(100, Math.round((inputs.proposedEmi / income) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.screenTitle}>Financial analysis</Text>
            <Text style={styles.screenSubtitle}>
              Calculated with fixed formulas from the values you confirmed.
            </Text>
          </View>
          <DemoBadge label={source === 'demo' ? 'Demo data' : hasData ? 'Your data' : 'Empty'} />
        </View>

        {!hasData ? (
          /* Empty / Fresh State Card */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="bar-chart-2" size={28} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No confirmed financial details</Text>
            <Text style={styles.emptySubtitle}>
              Add your monthly income, living expenses, and existing EMIs to unlock live cash flow bars and debt burden calculations.
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
                onPress={() => router.push('/(tabs)/docs' as any)}
                style={styles.emptyBtn}
              />
            </View>

            <TouchableOpacity style={styles.tryDemoLink} onPress={loadDemo} activeOpacity={0.7}>
              <Text style={styles.tryDemoText}>Or load demo profile →</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          /* Filled State with Live Data */
          <>
            {/* 3 Metric Tiles in Row */}
            <View style={styles.metricTilesRow}>
              <MetricTile
                label="EMI-to-income"
                value={calculations.emiToIncomePct !== null ? `${calculations.emiToIncomePct}%` : '—'}
              />
              <MetricTile
                label="Monthly surplus"
                value={formatRupee(calculations.monthlySurplus)}
              />
              <MetricTile
                label="After new EMI"
                value={formatRupee(calculations.surplusAfterNewEmi)}
              />
            </View>

            {/* Chart 1: Cash Flow Bars */}
            <CashFlowBars
              income={inputs.income}
              expenses={inputs.expenses}
              existingEmi={inputs.existingEmi}
              proposedEmi={inputs.proposedEmi}
              style={styles.chartSpacing}
            />

            {/* Chart 2: Income Split (Percentages & Rupee breakdown) */}
            <IncomeSplitChart
              income={inputs.income}
              expenses={inputs.expenses}
              existingEmi={inputs.existingEmi}
              monthlySurplus={calculations.monthlySurplus}
              style={styles.chartSpacing}
            />

            {/* Chart 3: EMI Burden Meter with 40% Caution Marker */}
            <EmiBurdenMeter
              income={inputs.income}
              existingEmi={inputs.existingEmi}
              style={styles.chartSpacing}
            />

            {/* Chart 4: Before vs After Proposed EMI */}
            <BeforeAfterEmiChart
              currentSurplus={calculations.monthlySurplus}
              surplusAfterProposed={calculations.surplusAfterNewEmi}
              proposedEmi={inputs.proposedEmi}
              style={styles.chartSpacing}
            />

            {/* Observations Card */}
            <Card style={styles.observationCard}>
              <Text style={styles.cardHeader}>Observations</Text>
              <Text style={styles.observationBody}>
                {calculations.monthlySurplus && calculations.monthlySurplus > 0
                  ? 'Your surplus stays positive even after covering recurring expenses and debt obligations.'
                  : 'Your obligations currently match or exceed monthly earnings, leaving little room for fresh borrowing.'}
              </Text>
              <Text style={[styles.observationBody, { marginTop: Theme.spacing.md }]}>
                Existing EMI takes {calculations.emiToIncomePct}% of monthly income. The illustrative caution level is 40% and can be adjusted in settings.
              </Text>
            </Card>

            {/* Information Still Missing Card (Amber Soft Box) */}
            <Card variant="softBox" style={styles.missingInfoCard}>
              <Text style={styles.missingTitle}>Information still missing</Text>
              <Text style={styles.missingBody}>
                Other income sources, credit card dues, and a second month of bank statement.
              </Text>
            </Card>

            {/* Action Buttons Row */}
            <View style={styles.actionBtnRow}>
              <PrimaryButton
                title="Try what-if"
                onPress={() => router.push('/simulator' as any)}
                style={styles.halfBtn}
              />
              <PrimaryButton
                title="Pattern check"
                variant="outline"
                onPress={() => router.push('/prediction' as any)}
                style={styles.halfBtn}
              />
            </View>
          </>
        )}

        {/* Legal Disclaimer */}
        <Text style={styles.disclaimerText}>
          Informational assessment only. Not a lender decision.
        </Text>
      </ScrollView>

      {/* Manual Entry Sheet */}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    marginTop: 3,
    lineHeight: 18,
  },
  chartSpacing: {
    marginBottom: Theme.spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: Theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionRow: {
    width: '100%',
    gap: 10,
    marginBottom: 12,
  },
  emptyBtn: {
    width: '100%',
  },
  tryDemoLink: {
    paddingVertical: 8,
  },
  tryDemoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
    textDecorationLine: 'underline',
  },
  metricTilesRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  cashFlowCard: {
    marginBottom: Theme.spacing.lg,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  cashFlowItem: {
    marginBottom: Theme.spacing.md,
  },
  cashFlowItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  observationCard: {
    marginBottom: Theme.spacing.lg,
  },
  observationBody: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
  },
  missingInfoCard: {
    marginBottom: Theme.spacing.xl,
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.warningText,
    marginBottom: 4,
  },
  missingBody: {
    fontSize: 12,
    color: Theme.colors.warningText,
    lineHeight: 16,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  halfBtn: {
    flex: 1,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Theme.spacing.md,
  },
});
