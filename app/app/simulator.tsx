import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';

import { Theme } from '../src/theme/theme';
import { Card } from '../src/components/Card';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useFinance } from '../src/context/FinanceContext';
import { ManualEntrySheet } from '../src/components/ManualEntrySheet';
import { SimulatorChart } from '../src/components/charts';
import {
  compareScenarios,
  formatRupee,
  formatRupeeDiff,
} from '../src/utils/finance';

export default function SimulatorScreen() {
  const router = useRouter();
  const { inputs, hasData, loadDemo } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);

  // Baseline values strictly from context (no invented numbers)
  const baseIncome = inputs.income ?? 0;
  const baseExpenses = inputs.expenses ?? 0;
  const baseExistingEmi = inputs.existingEmi ?? 0;
  const baseProposedEmi = inputs.proposedEmi ?? 0;

  // Scenario slider values
  const [income, setIncome] = useState(baseIncome);
  const [expenses, setExpenses] = useState(baseExpenses);
  const [existingEmi, setExistingEmi] = useState(baseExistingEmi);
  const [newEmi, setNewEmi] = useState(baseProposedEmi);

  useEffect(() => {
    if (hasData) {
      setIncome(baseIncome);
      setExpenses(baseExpenses);
      setExistingEmi(baseExistingEmi);
      setNewEmi(baseProposedEmi);
    }
  }, [hasData, baseIncome, baseExpenses, baseExistingEmi, baseProposedEmi]);

  // Dynamic calculations
  const comparison = useMemo(() => {
    return compareScenarios(
      {
        income: baseIncome,
        expenses: baseExpenses,
        existingEmi: baseExistingEmi,
        proposedEmi: baseProposedEmi,
      },
      {
        income,
        expenses,
        existingEmi,
        proposedEmi: newEmi,
      }
    );
  }, [income, expenses, existingEmi, newEmi, baseIncome, baseExpenses, baseExistingEmi, baseProposedEmi]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to analysis"
        >
          <Feather name="arrow-left" size={18} color={Theme.colors.primary} />
          <Text style={styles.backButtonText}>Back to analysis</Text>
        </TouchableOpacity>

        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What-if simulator</Text>
          <Text style={styles.subtitle}>
            Change the numbers and compare with your baseline.
          </Text>
        </View>

        {!hasData ? (
          /* Empty State when no data entered */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="sliders" size={28} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Confirmed baseline needed</Text>
            <Text style={styles.emptySubtitle}>
              Please add your confirmed income and existing obligations before running comparative stress simulations.
            </Text>

            <View style={styles.emptyActionRow}>
              <PrimaryButton
                title="Enter numbers (10s)"
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
              <Text style={styles.tryDemoText}>Or test with demo profile (₹60k) →</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          /* Live Sliders & Comparison Table */
          <>
            {/* Sliders Container Card */}
            <Card style={styles.slidersCard}>
              {/* Slider 1: Monthly Income */}
              <View style={styles.sliderGroup}>
                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabel}>Monthly income</Text>
                  <View style={styles.sliderValueWrap}>
                    <Text style={styles.sliderValueText}>{formatRupee(income)}</Text>
                    <Text style={styles.sliderBaselineText}>
                      Baseline {formatRupee(baseIncome)}
                    </Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={20000}
                  maximumValue={150000}
                  step={1000}
                  value={income}
                  onValueChange={setIncome}
                  minimumTrackTintColor={Theme.colors.primary}
                  maximumTrackTintColor={Theme.colors.borderLight}
                  thumbTintColor={Theme.colors.primary}
                />
              </View>

              {/* Slider 2: Monthly Expenses */}
              <View style={[styles.sliderGroup, styles.sliderBorderTop]}>
                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabel}>Monthly expenses</Text>
                  <View style={styles.sliderValueWrap}>
                    <Text style={styles.sliderValueText}>{formatRupee(expenses)}</Text>
                    <Text style={styles.sliderBaselineText}>
                      Baseline {formatRupee(baseExpenses)}
                    </Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={10000}
                  maximumValue={80000}
                  step={500}
                  value={expenses}
                  onValueChange={setExpenses}
                  minimumTrackTintColor={Theme.colors.primary}
                  maximumTrackTintColor={Theme.colors.borderLight}
                  thumbTintColor={Theme.colors.primary}
                />
              </View>

              {/* Slider 3: Existing EMI */}
              <View style={[styles.sliderGroup, styles.sliderBorderTop]}>
                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabel}>Existing EMI</Text>
                  <View style={styles.sliderValueWrap}>
                    <Text style={styles.sliderValueText}>{formatRupee(existingEmi)}</Text>
                    <Text style={styles.sliderBaselineText}>
                      Baseline {formatRupee(baseExistingEmi)}
                    </Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={50000}
                  step={500}
                  value={existingEmi}
                  onValueChange={setExistingEmi}
                  minimumTrackTintColor={Theme.colors.primary}
                  maximumTrackTintColor={Theme.colors.borderLight}
                  thumbTintColor={Theme.colors.primary}
                />
              </View>

              {/* Slider 4: New EMI Hypothetical */}
              <View style={[styles.sliderGroup, styles.sliderBorderTop]}>
                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabel}>New EMI hypothetical</Text>
                  <View style={styles.sliderValueWrap}>
                    <Text style={styles.sliderValueText}>{formatRupee(newEmi)}</Text>
                    <Text style={styles.sliderBaselineText}>
                      Baseline {formatRupee(baseProposedEmi)}
                    </Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={40000}
                  step={500}
                  value={newEmi}
                  onValueChange={setNewEmi}
                  minimumTrackTintColor={Theme.colors.primary}
                  maximumTrackTintColor={Theme.colors.borderLight}
                  thumbTintColor={Theme.colors.primary}
                />
              </View>
            </Card>

            {/* Live Visual Chart: Baseline vs Scenario */}
            <SimulatorChart
              baselineSurplus={comparison.baseline.monthlySurplus}
              scenarioSurplus={comparison.scenario.monthlySurplus}
              baselineEmiPct={comparison.baseline.emiToIncomePct}
              scenarioEmiPct={comparison.scenario.emiToIncomePct}
            />

            {/* Live Comparison Table */}
            <Card style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Baseline vs scenario</Text>

              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.tableColMeasure]}>Measure</Text>
                <Text style={[styles.tableColHeader, styles.tableColVal]}>Baseline</Text>
                <Text style={[styles.tableColHeader, styles.tableColVal]}>Scenario</Text>
                <Text style={[styles.tableColHeader, styles.tableColDiff]}>Diff</Text>
              </View>

              {/* Row 1: EMI-to-income */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableColMeasure, styles.tableCellBold]}>
                  EMI-to-income
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {comparison.baseline.emiToIncomePct}%
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {comparison.scenario.emiToIncomePct}%
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableColDiff,
                    {
                      color:
                        comparison.change.emiToIncomeDiffPts <= 0
                          ? Theme.colors.success
                          : Theme.colors.warning,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {comparison.change.emiToIncomeDiffPts > 0 ? '+' : ''}
                  {comparison.change.emiToIncomeDiffPts} pts
                </Text>
              </View>

              {/* Row 2: Monthly surplus */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableColMeasure, styles.tableCellBold]}>
                  Monthly surplus
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {formatRupee(comparison.baseline.monthlySurplus)}
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {formatRupee(comparison.scenario.monthlySurplus)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableColDiff,
                    {
                      color:
                        comparison.change.monthlySurplusDiff >= 0
                          ? Theme.colors.success
                          : Theme.colors.danger,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {formatRupeeDiff(comparison.change.monthlySurplusDiff)}
                </Text>
              </View>

              {/* Row 3: Surplus after new EMI */}
              <View style={[styles.tableRow, styles.lastTableRow]}>
                <Text style={[styles.tableCell, styles.tableColMeasure, styles.tableCellBold]}>
                  Surplus after new EMI
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {formatRupee(comparison.baseline.surplusAfterNewEmi)}
                </Text>
                <Text style={[styles.tableCell, styles.tableColVal]}>
                  {formatRupee(comparison.scenario.surplusAfterNewEmi)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableColDiff,
                    {
                      color:
                        comparison.change.surplusAfterNewEmiDiff >= 0
                          ? Theme.colors.success
                          : Theme.colors.danger,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {formatRupeeDiff(comparison.change.surplusAfterNewEmiDiff)}
                </Text>
              </View>

              <View style={styles.footnoteDivider} />
              <Text style={styles.footnoteText}>
                All figures are calculated with fixed formulas, not by AI. Scenario values are hypothetical.
              </Text>
            </Card>

            {/* Action Button */}
            <PrimaryButton
              title="See AI advice for this scenario"
              onPress={() => router.push('/(tabs)/report' as any)}
              style={styles.ctaButton}
            />

            <Text style={styles.disclaimerText}>
              Informational assessment only. Not a lender decision.
            </Text>
          </>
        )}
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
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    lineHeight: 18,
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
  slidersCard: {
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
  },
  sliderGroup: {
    paddingVertical: Theme.spacing.md,
  },
  sliderBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  sliderValueWrap: {
    alignItems: 'flex-end',
  },
  sliderValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sliderBaselineText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    marginTop: 1,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  comparisonCard: {
    marginBottom: Theme.spacing.xl,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  tableColHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.mutedText,
  },
  tableColMeasure: {
    flex: 2.2,
  },
  tableColVal: {
    flex: 1.4,
    textAlign: 'right',
  },
  tableColDiff: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
    alignItems: 'center',
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 13,
    color: Theme.colors.text,
  },
  tableCellBold: {
    fontWeight: '600',
  },
  footnoteDivider: {
    height: 1,
    backgroundColor: Theme.colors.borderLight,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  footnoteText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    lineHeight: 16,
  },
  ctaButton: {
    marginBottom: Theme.spacing.lg,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
});
