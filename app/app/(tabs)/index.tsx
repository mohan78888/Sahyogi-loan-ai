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
import { DemoBadge } from '../../src/components/DemoBadge';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ManualEntrySheet } from '../../src/components/ManualEntrySheet';
import { DemoMenuModal } from '../../src/components/DemoMenuModal';
import { IncomeSplitChart, EmiBurdenMeter } from '../../src/components/charts';
import { VoiceFloatingButton } from '../../src/components/VoiceFloatingButton';
import { VoiceAssistantModal } from '../../src/components/VoiceAssistantModal';

export default function HomeScreen() {
  const router = useRouter();
  const {
    source,
    inputs,
    documents,
    calculations,
    hasData,
    loadDemo,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  const confirmedDocsCount = documents.filter((d) => d.status === 'confirmed').length;
  const totalDocs = 5;

  // Stacked bar percentages (only when hasData is true and income > 0)
  const income = inputs.income || 1;
  const expensePct = hasData ? Math.min(100, Math.round(((inputs.expenses || 0) / income) * 100)) : 0;
  const emiPct = hasData && calculations.emiToIncomePct !== null ? calculations.emiToIncomePct : 0;
  const surplusPct = hasData && calculations.monthlySurplus !== null
    ? Math.max(0, Math.round((calculations.monthlySurplus / income) * 100))
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <View>
              <Text style={styles.appName}>Sahyogi Loan AI</Text>
              <Text style={styles.appTagline}>Your financial snapshot</Text>
            </View>
          </View>

          {/* Top Right Controls: Demo Badge & Demo Menu Trigger */}
          <View style={styles.headerRight}>
            <DemoBadge label={source === 'demo' ? 'Demo data' : hasData ? 'Your data' : 'Evaluation'} />
            <TouchableOpacity
              style={styles.demoControlBtn}
              onPress={() => setDemoModalVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="Open demo evaluation menu"
            >
              <Feather name="sliders" size={15} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD: FRESH STATE vs FILLED STATE */}
        {!hasData ? (
          <Card variant="hero" style={styles.heroCard}>
            <Text style={styles.freshHeroTitle}>Calculate your surplus and EMI burden</Text>
            <Text style={styles.freshHeroSubtitle}>
              Upload a salary slip or bank statement, or enter your numbers in 10 seconds.
            </Text>

            <View style={styles.freshBtnRow}>
              <TouchableOpacity
                style={styles.freshUploadBtn}
                onPress={() => router.push('/(tabs)/docs' as any)}
                activeOpacity={0.85}
              >
                <Feather name="upload" size={15} color="#0F5C4D" />
                <Text style={styles.freshUploadBtnText}>Upload a document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.freshManualBtn}
                onPress={() => setManualSheetVisible(true)}
                activeOpacity={0.85}
              >
                <Feather name="edit-3" size={15} color="#FFFFFF" />
                <Text style={styles.freshManualBtnText}>Enter manually</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.demoLinkWrap}
              onPress={loadDemo}
              activeOpacity={0.7}
            >
              <Text style={styles.demoLinkText}>Try the demo profile →</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <Card variant="hero" style={styles.heroCard}>
            <Text style={styles.heroLabel}>Monthly surplus</Text>
            <Text style={styles.heroAmount}>{formatRupee(calculations.monthlySurplus)}</Text>
            
            <Text style={styles.formulaText}>
              Income {formatRupee(inputs.income)} − expenses {formatRupee(inputs.expenses)} − existing EMI {formatRupee(inputs.existingEmi)}
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroMetricsRow}>
              <View style={styles.heroMetricCol}>
                <Text style={styles.heroSubLabel}>EMI-to-income</Text>
                <Text style={styles.heroSubValue}>
                  {calculations.emiToIncomePct !== null ? `${calculations.emiToIncomePct}%` : '—'}
                </Text>
              </View>
              <View style={styles.heroMetricCol}>
                <Text style={styles.heroSubLabel}>Left after proposed EMI</Text>
                <Text style={styles.heroSubValue}>{formatRupee(calculations.surplusAfterNewEmi)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Two Small Cards: Documents & Repayment Shortcut */}
        <View style={styles.dualCardRow}>
          {/* Card 1: Documents Confirmed */}
          <TouchableOpacity
            style={styles.halfCardWrapper}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/docs' as any)}
          >
            <Card style={styles.halfCard}>
              <Text style={styles.smallCardTitle}>Documents confirmed</Text>
              <Text style={styles.docCountText}>{confirmedDocsCount} of {totalDocs}</Text>
              <ProgressBar
                progress={calculations.documentCompletenessPct}
                color="#0F5C4D"
                backgroundColor="#E5E7EB"
                height={5}
                style={styles.docProgress}
              />
              <Text style={styles.docConfirmNote}>
                {calculations.documentCompletenessPct}% · confirmed by you
              </Text>
            </Card>
          </TouchableOpacity>

          {/* Card 2: Repayment Pattern */}
          <TouchableOpacity
            style={styles.halfCardWrapper}
            activeOpacity={0.8}
            onPress={() => {
              if (hasData) {
                router.push('/prediction' as any);
              } else {
                setManualSheetVisible(true);
              }
            }}
          >
            <Card style={styles.halfCard}>
              <Text style={styles.smallCardTitle}>Repayment pattern</Text>
              {hasData ? (
                <>
                  <Text style={styles.patternBodyText}>
                    Check against{'\n'}historical loans
                  </Text>
                  <Text style={styles.runCheckAction}>Run check →</Text>
                </>
              ) : (
                <>
                  <Text style={styles.patternEmptyText}>
                    Needs confirmed financial details to run check.
                  </Text>
                  <Text style={styles.runCheckAction}>Add details →</Text>
                </>
              )}
            </Card>
          </TouchableOpacity>
        </View>

        {/* 2x2 Quick Actions Grid */}
        <View style={styles.actionGrid}>
          {/* Action 1: Upload a document */}
          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/docs' as any)}
          >
            <Card style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <Feather name="file-text" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Upload a{'\n'}document</Text>
            </Card>
          </TouchableOpacity>

          {/* Action 2: Analyze my finances */}
          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => {
              if (!hasData) {
                setManualSheetVisible(true);
              } else {
                router.push('/(tabs)/analyze' as any);
              }
            }}
          >
            <Card style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <Feather name="bar-chart-2" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Analyze my{'\n'}finances</Text>
            </Card>
          </TouchableOpacity>

          {/* Action 3: What-if simulator */}
          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => {
              if (!hasData) {
                setManualSheetVisible(true);
              } else {
                router.push('/simulator' as any);
              }
            }}
          >
            <Card style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <Feather name="sliders" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>What-if{'\n'}simulator</Text>
            </Card>
          </TouchableOpacity>

          {/* Action 4: Ask Sahyogi */}
          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/chat' as any)}
          >
            <Card style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <Feather name="message-square" size={20} color={Theme.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Ask Sahyogi</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Dynamic Charts: Income Split & EMI Burden */}
        <IncomeSplitChart
          income={inputs.income}
          expenses={inputs.expenses}
          existingEmi={inputs.existingEmi}
          monthlySurplus={calculations.monthlySurplus}
          style={styles.homeChart}
        />

        {hasData && (
          <EmiBurdenMeter
            income={inputs.income}
            existingEmi={inputs.existingEmi}
            style={styles.homeChart}
          />
        )}

        {/* Legal Disclaimer */}
        <Text style={styles.disclaimerText}>
          Informational assessment only. Not a lender decision.
        </Text>
      </ScrollView>

      {/* Manual Entry Bottom Sheet */}
      <ManualEntrySheet
        visible={manualSheetVisible}
        onClose={() => setManualSheetVisible(false)}
      />

      {/* Demo Evaluation Menu Modal */}
      <DemoMenuModal
        visible={demoModalVisible}
        onClose={() => setDemoModalVisible(false)}
      />

      {/* Floating Voice Mic Button at bottom-right */}
      <VoiceFloatingButton onPress={() => setVoiceModalVisible(true)} />

      {/* Sahyogi Voice AI Assistant Modal */}
      <VoiceAssistantModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onOpenManualEntry={() => setManualSheetVisible(true)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  appTagline: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  heroCard: {
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  freshHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  freshHeroSubtitle: {
    fontSize: 13,
    color: Theme.colors.lightTealText,
    lineHeight: 18,
    marginBottom: 16,
  },
  freshBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  freshUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  freshUploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  freshManualBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  freshManualBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  demoLinkWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  demoLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.lightTealText,
    textDecorationLine: 'underline',
  },
  heroLabel: {
    fontSize: 13,
    color: Theme.colors.lightTealText,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  formulaText: {
    fontSize: 12,
    color: Theme.colors.lightTealText,
    lineHeight: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: Theme.spacing.md,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroMetricCol: {
    flex: 1,
  },
  heroSubLabel: {
    fontSize: 11,
    color: Theme.colors.lightTealText,
    marginBottom: 2,
  },
  heroSubValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dualCardRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  halfCardWrapper: {
    flex: 1,
  },
  halfCard: {
    padding: Theme.spacing.md,
    height: 118,
    justifyContent: 'space-between',
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.mutedText,
  },
  docCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  docProgress: {
    marginVertical: 4,
  },
  docConfirmNote: {
    fontSize: 11,
    color: Theme.colors.mutedText,
  },
  patternBodyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    lineHeight: 17,
  },
  patternEmptyText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    lineHeight: 15,
  },
  runCheckAction: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  actionCardWrapper: {
    width: '47.5%',
  },
  actionCard: {
    padding: Theme.spacing.md,
    height: 102,
    justifyContent: 'space-between',
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Theme.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    lineHeight: 17,
  },
  homeChart: {
    marginBottom: Theme.spacing.lg,
  },
  incomeBreakdownCard: {
    marginBottom: Theme.spacing.xl,
  },
  incomeSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  stackedBar: {
    marginBottom: Theme.spacing.sm,
  },
  stackedLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  legendText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    fontWeight: '500',
  },
  emptyBreakdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
  },
  emptyBreakdownText: {
    fontSize: 12,
    color: Theme.colors.mutedText,
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
