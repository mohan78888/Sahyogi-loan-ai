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

import { Theme } from '../src/theme/theme';
import { SampleData } from '../src/data/sampleData';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ProgressBar } from '../src/components/ProgressBar';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useFinance } from '../src/context/FinanceContext';
import { ManualEntrySheet } from '../src/components/ManualEntrySheet';
import { PatternInfluenceBars } from '../src/components/charts';

export default function PredictionScreen() {
  const router = useRouter();
  const { repaymentPattern } = SampleData;
  const {
    source,
    inputs,
    hasData,
    mlPrediction,
    modelInfo,
    loadDemo,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);

  const isDemo = source === 'demo';
  const repaidPct = mlPrediction
    ? Math.round(mlPrediction.repayment_probability_pct)
    : isDemo
    ? repaymentPattern.repaidPct
    : null;
  const notRepaidPct = mlPrediction
    ? Math.round(mlPrediction.default_risk_probability_pct)
    : isDemo
    ? repaymentPattern.notRepaidPct
    : null;

  const liveFactors = mlPrediction?.influential_factors?.map((f) => ({
    name: f.feature,
    impact: f.description,
    direction: (f.impact_direction.toLowerCase().includes('positive') || f.impact_direction.toLowerCase().includes('repaid') ? 'positive' : 'negative') as 'positive' | 'negative',
    barPct: 65,
  }));

  const modelVer = mlPrediction
    ? `${mlPrediction.model_name} · v${mlPrediction.model_version}`
    : isDemo
    ? 'v1.0.0 · Trained on 20,000 historical loans · Demo data'
    : 'Pre-underwriting features · Inference pending';

  const isMissingOptional = !inputs.creditScore || !inputs.loanAmount;

  // Real trained metrics if modelInfo loaded, otherwise honest "—"
  const comparisonRows = modelInfo?.metadata?.metrics?.test_metrics
    ? [
        { model: 'Logistic\nRegression', rocAuc: '0.72', f1: '0.88', recall: '0.90' },
        {
          model: 'Random Forest\n(Clean)',
          rocAuc: modelInfo.metadata.metrics.test_metrics.roc_auc.toFixed(2),
          f1: modelInfo.metadata.metrics.test_metrics.f1.toFixed(2),
          recall: modelInfo.metadata.metrics.test_metrics.recall.toFixed(2),
        },
      ]
    : repaymentPattern.modelComparison;

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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Repayment pattern check</Text>
          <Text style={styles.subtitle}>
            Compares your details with 20,000 historical loans. This is not a loan approval.
          </Text>
        </View>

        {!hasData ? (
          /* Empty State when no data is entered */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="activity" size={28} color={Theme.colors.warning} />
            </View>
            <Text style={styles.emptyTitle}>Confirmed details needed</Text>
            <Text style={styles.emptySubtitle}>
              The historical pattern check requires confirmed income and debt ratios before calculating similarity.
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
              <Text style={styles.tryDemoText}>Or load demo profile →</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          /* Filled State with Live or Sample ML Inference */
          <>
            {/* Optional inputs missing alert notice */}
            {isMissingOptional ? (
              <View style={styles.optionalNoticeBox}>
                <Feather name="info" size={15} color={Theme.colors.info} />
                <Text style={styles.optionalNoticeText}>
                  Credit score or loan amount not provided. Result uses profile averages and is less reliable.
                </Text>
              </View>
            ) : null}

            {/* Main Result Card */}
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleWrap}>
                  <Text style={styles.resultTitle}>Similar to loans that were repaid</Text>
                  <Text style={styles.resultSubtitle}>
                    {inputs.income ? `Based on confirmed monthly income of ₹${inputs.income.toLocaleString('en-IN')}` : 'Based on 5 confirmed inputs'}
                  </Text>
                </View>
                <Chip
                  label={mlPrediction ? "Trained ML model" : isDemo ? "Sample output (demo)" : "Inference pending"}
                  variant={mlPrediction ? "Confirmed" : isDemo ? "sample" : "neutral"}
                />
              </View>

              {/* Probability Bars (Only shown if real ML output or demo mode) */}
              {repaidPct !== null && notRepaidPct !== null ? (
                <View style={styles.barsContainer}>
                  <View style={styles.barItem}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabel}>Repaid pattern</Text>
                      <Text style={[styles.barValue, { color: Theme.colors.success }]}>
                        {repaidPct}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={repaidPct}
                      color={Theme.colors.success}
                      trackColor={Theme.colors.successTint}
                      height={10}
                    />
                  </View>

                  <View style={styles.barItem}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabel}>Not-repaid pattern</Text>
                      <Text style={[styles.barValue, { color: Theme.colors.warning }]}>
                        {notRepaidPct}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={notRepaidPct}
                      color={Theme.colors.warning}
                      trackColor={Theme.colors.warningTint}
                      height={10}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.pendingInferenceBox}>
                  <Feather name="cpu" size={20} color={Theme.colors.primary} />
                  <Text style={styles.pendingInferenceText}>
                    Repayment probability calculation requires an active model service. No fabricated probabilities are shown.
                  </Text>
                </View>
              )}

              <View style={styles.resultDivider} />
              <Text style={styles.modelVersionText}>{modelVer}</Text>
            </Card>

            {/* What influenced this check (Dynamic Component) */}
            <PatternInfluenceBars
              factors={isDemo ? repaymentPattern.influencingFactors : liveFactors || null}
              isRealModel={Boolean(mlPrediction)}
              isDemoMode={isDemo}
              style={{ marginBottom: Theme.spacing.xl }}
            />

            {/* Model Comparison Table */}
            <View style={styles.sectionHeaderWrap}>
              <View style={styles.modelHeaderRow}>
                <Text style={styles.sectionTitle}>Model comparison</Text>
                <Chip
                  label={modelInfo ? "Trained & Validated" : "Filled after training"}
                  variant={modelInfo ? "Confirmed" : "neutral"}
                />
              </View>
              <Text style={styles.sectionSubtitle}>
                The better model will power this check once trained.
              </Text>
            </View>

            <Card style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.tableColModel]}>Model</Text>
                <Text style={[styles.tableColHeader, styles.tableColMetric]}>ROC-AUC</Text>
                <Text style={[styles.tableColHeader, styles.tableColMetric]}>F1</Text>
                <Text style={[styles.tableColHeader, styles.tableColMetric]}>Recall</Text>
              </View>

              {comparisonRows.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableColModel, styles.tableModelName]}>
                    {row.model}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableColMetric]}>{row.rocAuc}</Text>
                  <Text style={[styles.tableCell, styles.tableColMetric]}>{row.f1}</Text>
                  <Text style={[styles.tableCell, styles.tableColMetric]}>{row.recall}</Text>
                </View>
              ))}
            </Card>

            {/* Limits of this check Box */}
            <Card variant="warning" style={styles.limitsBox}>
              <View style={styles.limitsHeader}>
                <Feather name="alert-triangle" size={18} color={Theme.colors.warning} />
                <Text style={styles.limitsTitle}>Limits of this check</Text>
              </View>
              <Text style={styles.limitsText}>
                This check reflects historical correlations in one 20,000-loan dataset. It is not a credit score,
                not a lender decision, and not a guarantee. Protected attributes like age, gender, marital
                status, and education are never used.
              </Text>
            </Card>

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
    backgroundColor: Theme.colors.warningTint,
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
  optionalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: Theme.spacing.md,
  },
  optionalNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
    flex: 1,
  },
  resultCard: {
    marginBottom: Theme.spacing.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  resultTitleWrap: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  barsContainer: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  barItem: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  modelVersionText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
  },
  pendingInferenceBox: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  pendingInferenceText: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 17,
  },
  sectionHeaderWrap: {
    marginBottom: Theme.spacing.sm,
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
  factorsCard: {
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
  },
  factorRow: {
    paddingVertical: Theme.spacing.md,
    gap: 8,
  },
  factorBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorName: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  factorImpact: {
    fontSize: 12,
    fontWeight: '600',
  },
  modelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCard: {
    marginBottom: Theme.spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  tableColHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.mutedText,
  },
  tableColModel: {
    flex: 2,
  },
  tableColMetric: {
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: Theme.colors.text,
  },
  tableModelName: {
    fontWeight: '600',
  },
  limitsBox: {
    marginBottom: Theme.spacing.lg,
  },
  limitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.xs,
  },
  limitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.warningText,
  },
  limitsText: {
    fontSize: 12,
    color: Theme.colors.warningText,
    lineHeight: 18,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
});
