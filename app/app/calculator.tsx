import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { request, formatINR } from '../services/api';

export default function CalculatorScreen() {
  const router = useRouter();

  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('60');
  const [income, setIncome] = useState('50000');
  const [expenses, setExpenses] = useState('20000');

  const [emiResult, setEmiResult] = useState<any>(null);
  const [stressResult, setStressResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculate();
  }, []);

  const calculate = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseInt(tenure, 10);
    const inc = parseFloat(income);
    const exp = parseFloat(expenses);

    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) return;

    setLoading(true);
    try {
      // 1. EMI calculation
      const emiData = await request<any>('/api/emi', {
        method: 'POST',
        body: JSON.stringify({
          principal: p,
          annual_rate_pct: r,
          tenure_months: t,
        }),
      });
      setEmiResult(emiData);

      // 2. Stress Test calculation
      if (!isNaN(inc) && inc > 0 && !isNaN(exp)) {
        const stressData = await request<any>('/api/stress', {
          method: 'POST',
          body: JSON.stringify({
            new_emi: emiData.monthly_emi,
            monthly_income: inc,
            monthly_expenses: exp,
            existing_emis: 0,
            income_drop_pcts: [0, 20, 40],
          }),
        });
        setStressResult(stressData.scenarios);
      }
    } catch (err) {
      console.error('Calculation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="EMI & Stress Simulator"
        subtitle="Simulate repayments under income shocks"
        showBack
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Inputs Card */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Loan Parameters</Text>

            <Input
              label="Loan Amount (Principal)"
              prefixText="₹"
              keyboardType="numeric"
              value={principal}
              onChangeText={setPrincipal}
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Input
                  label="Interest Rate (% p.a.)"
                  placeholder="10.5"
                  keyboardType="numeric"
                  value={rate}
                  onChangeText={setRate}
                />
              </View>
              <View style={styles.halfCol}>
                <Input
                  label="Tenure (Months)"
                  placeholder="60"
                  keyboardType="numeric"
                  value={tenure}
                  onChangeText={setTenure}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Input
                  label="Monthly Income"
                  prefixText="₹"
                  keyboardType="numeric"
                  value={income}
                  onChangeText={setIncome}
                />
              </View>
              <View style={styles.halfCol}>
                <Input
                  label="Monthly Expenses"
                  prefixText="₹"
                  keyboardType="numeric"
                  value={expenses}
                  onChangeText={setExpenses}
                />
              </View>
            </View>

            <Button
              title="Recalculate Stress Scenarios"
              variant="primary"
              loading={loading}
              onPress={calculate}
              style={styles.calcBtn}
            />
          </Card>

          {/* EMI Results Card */}
          {emiResult && (
            <Card style={styles.resultCard}>
              <Text style={styles.resultHeader}>Monthly Installment</Text>
              <Text style={styles.emiHighlight}>{formatINR(emiResult.monthly_emi)}</Text>
              <Text style={styles.emiSubtext}>per month for {tenure} months</Text>

              <View style={styles.divider} />

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Interest Payable</Text>
                <Text style={styles.statVal}>{formatINR(emiResult.total_interest)}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Repayment</Text>
                <Text style={styles.statVal}>{formatINR(emiResult.total_payment)}</Text>
              </View>
            </Card>
          )}

          {/* Stress Scenarios */}
          {stressResult && (
            <>
              <Text style={styles.sectionTitle}>Income Shock Resilience Test</Text>
              <Text style={styles.sectionSubtitle}>
                What happens to your household budget if income suddenly drops?
              </Text>

              {stressResult.map((sc: any, idx: number) => {
                const isNegative = sc.leftover_income < 0;
                return (
                  <Card key={idx} style={styles.scenarioCard}>
                    <View style={styles.scenarioTop}>
                      <Text style={styles.scenarioLabel}>
                        {sc.drop_pct === 0 ? 'Normal Scenario (0% Drop)' : `${sc.drop_pct}% Income Reduction`}
                      </Text>
                      <Badge
                        label={sc.pressure}
                        status={sc.pressure === 'high' ? 'critical' : sc.pressure === 'medium' ? 'warning' : 'favorable'}
                      />
                    </View>

                    <View style={styles.scenarioBody}>
                      <View style={styles.scenarioItem}>
                        <Text style={styles.scenarioSubLabel}>Adjusted Income</Text>
                        <Text style={styles.scenarioVal}>{formatINR(sc.effective_income)}</Text>
                      </View>
                      <View style={styles.scenarioItem}>
                        <Text style={styles.scenarioSubLabel}>Leftover Cash</Text>
                        <Text style={[styles.scenarioVal, isNegative && styles.negativeCash]}>
                          {formatINR(sc.leftover_income)}
                        </Text>
                      </View>
                    </View>

                    {isNegative ? (
                      <Text style={styles.dangerWarning}>
                        Deficit alert: Income will not cover EMI + basic living expenses.
                      </Text>
                    ) : null}
                  </Card>
                );
              })}
            </>
          )}

          <DisclaimerBanner text="Calculations use standard reducing-balance amortization. Actual repayment may vary with bank fees and GST." />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfCol: {
    flex: 1,
  },
  calcBtn: {
    marginTop: 12,
  },
  resultCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#FDE68A',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultHeader: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  emiHighlight: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  emiSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: '#78350F',
  },
  statVal: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 10,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 2,
  },
  scenarioCard: {
    padding: 14,
    marginBottom: 10,
  },
  scenarioTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scenarioLabel: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scenarioBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioItem: {
    flex: 1,
  },
  scenarioSubLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scenarioVal: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  negativeCash: {
    color: Colors.error,
  },
  dangerWarning: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
    marginTop: 8,
  },
});

