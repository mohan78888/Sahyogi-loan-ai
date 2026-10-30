import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';
import { PrimaryButton } from './PrimaryButton';

interface ManualEntrySheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ManualEntrySheet: React.FC<ManualEntrySheetProps> = ({ visible, onClose }) => {
  const { inputs, saveManual } = useFinance();

  // Form states
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [existingEmi, setExistingEmi] = useState('');
  const [proposedEmi, setProposedEmi] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Employed');

  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      setIncome(inputs.income ? String(inputs.income) : '');
      setExpenses(inputs.expenses ? String(inputs.expenses) : '');
      setExistingEmi(inputs.existingEmi !== null && inputs.existingEmi !== undefined ? String(inputs.existingEmi) : '');
      setProposedEmi(inputs.proposedEmi ? String(inputs.proposedEmi) : '');
      setCreditScore(inputs.creditScore ? String(inputs.creditScore) : '');
      setLoanAmount(inputs.loanAmount ? String(inputs.loanAmount) : '');
      setEmploymentStatus(inputs.employmentStatus || 'Employed');
      setErrors({});
    }
  }, [visible, inputs]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // 1. Monthly Income validation (Required, > 0)
    const incVal = Number(income.replace(/,/g, ''));
    if (!income.trim() || isNaN(incVal)) {
      newErrors.income = 'Please enter a valid monthly income.';
    } else if (incVal <= 0) {
      newErrors.income = 'Monthly income must be greater than ₹0.';
    } else if (incVal > 5000000) {
      newErrors.income = 'Income exceeds ₹50 Lakh/month maximum limit.';
    }

    // 2. Monthly Expenses validation (Required, >= 0)
    const expVal = Number(expenses.replace(/,/g, ''));
    if (!expenses.trim() || isNaN(expVal)) {
      newErrors.expenses = 'Please enter monthly living expenses.';
    } else if (expVal < 0) {
      newErrors.expenses = 'Expenses cannot be negative.';
    } else if (expVal > 5000000) {
      newErrors.expenses = 'Expenses exceed maximum sensible limit.';
    }

    // 3. Existing EMI validation (Required, >= 0)
    const emiVal = Number(existingEmi.replace(/,/g, ''));
    if (existingEmi.trim() === '' || isNaN(emiVal)) {
      newErrors.existingEmi = 'Please enter existing EMIs (or 0 if none).';
    } else if (emiVal < 0) {
      newErrors.existingEmi = 'Existing EMI cannot be negative.';
    }

    // Optional Proposed EMI validation
    if (proposedEmi.trim() !== '') {
      const propVal = Number(proposedEmi.replace(/,/g, ''));
      if (isNaN(propVal) || propVal < 0) {
        newErrors.proposedEmi = 'Please enter a valid proposed EMI.';
      }
    }

    // Optional Credit Score validation
    if (creditScore.trim() !== '') {
      const csVal = Number(creditScore);
      if (isNaN(csVal) || csVal < 300 || csVal > 900) {
        newErrors.creditScore = 'Credit score must be between 300 and 900.';
      }
    }

    // Optional Loan Amount validation
    if (loanAmount.trim() !== '') {
      const laVal = Number(loanAmount.replace(/,/g, ''));
      if (isNaN(laVal) || laVal <= 0) {
        newErrors.loanAmount = 'Loan amount must be greater than ₹0.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    await saveManual({
      income: Number(income.replace(/,/g, '')),
      expenses: Number(expenses.replace(/,/g, '')),
      existingEmi: Number(existingEmi.replace(/,/g, '')),
      proposedEmi: proposedEmi.trim() ? Number(proposedEmi.replace(/,/g, '')) : 0,
      creditScore: creditScore.trim() ? Number(creditScore) : null,
      loanAmount: loanAmount.trim() ? Number(loanAmount.replace(/,/g, '')) : null,
      employmentStatus,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Enter your numbers</Text>
              <Text style={styles.sheetSubtitle}>Enter in 10 seconds for instant calculation</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Theme.colors.mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Required Section */}
            <Text style={styles.sectionHeading}>REQUIRED FINANCIAL DETAILS</Text>

            {/* Field: Monthly Income */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Monthly take-home income <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputBox, errors.income && styles.inputBoxError]}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  placeholder="50,000"
                  placeholderTextColor="#94A3B8"
                  value={income}
                  onChangeText={setIncome}
                />
              </View>
              {errors.income ? <Text style={styles.errorText}>{errors.income}</Text> : null}
            </View>

            {/* Field: Monthly Expenses */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Average monthly expenses <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputBox, errors.expenses && styles.inputBoxError]}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  placeholder="20,000"
                  placeholderTextColor="#94A3B8"
                  value={expenses}
                  onChangeText={setExpenses}
                />
              </View>
              {errors.expenses ? <Text style={styles.errorText}>{errors.expenses}</Text> : null}
            </View>

            {/* Field: Existing EMI */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Current total monthly EMIs <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputBox, errors.existingEmi && styles.inputBoxError]}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  placeholder="10,000"
                  placeholderTextColor="#94A3B8"
                  value={existingEmi}
                  onChangeText={setExistingEmi}
                />
              </View>
              {errors.existingEmi ? <Text style={styles.errorText}>{errors.existingEmi}</Text> : null}
            </View>

            {/* Field: Proposed New EMI (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Proposed new EMI (Optional)</Text>
              <View style={[styles.inputBox, errors.proposedEmi && styles.inputBoxError]}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  placeholder="5,000"
                  placeholderTextColor="#94A3B8"
                  value={proposedEmi}
                  onChangeText={setProposedEmi}
                />
              </View>
              {errors.proposedEmi ? <Text style={styles.errorText}>{errors.proposedEmi}</Text> : null}
            </View>

            {/* Optional Section for ML Pattern Check */}
            <View style={styles.divider} />
            <Text style={styles.sectionHeading}>FOR REPAYMENT PATTERN CHECK (OPTIONAL)</Text>

            <View style={styles.twoColRow}>
              {/* Credit Score */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Credit score</Text>
                <View style={[styles.inputBox, errors.creditScore && styles.inputBoxError]}>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    placeholder="720"
                    placeholderTextColor="#94A3B8"
                    value={creditScore}
                    onChangeText={setCreditScore}
                    maxLength={3}
                  />
                </View>
                {errors.creditScore ? <Text style={styles.errorText}>{errors.creditScore}</Text> : null}
              </View>

              {/* Target Loan Amount */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Loan amount</Text>
                <View style={[styles.inputBox, errors.loanAmount && styles.inputBoxError]}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    placeholder="3,00,000"
                    placeholderTextColor="#94A3B8"
                    value={loanAmount}
                    onChangeText={setLoanAmount}
                  />
                </View>
                {errors.loanAmount ? <Text style={styles.errorText}>{errors.loanAmount}</Text> : null}
              </View>
            </View>

            {/* Employment Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employment status</Text>
              <View style={styles.chipRow}>
                {['Employed', 'Self-employed', 'Student', 'Retired'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.choiceChip,
                      employmentStatus === status && styles.choiceChipActive,
                    ]}
                    onPress={() => setEmploymentStatus(status)}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        employmentStatus === status && styles.choiceChipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Disclaimer & Actions */}
            <Text style={styles.helperNote}>
              All figures are stored privately on your device. We never share or sell borrower inputs.
            </Text>

            <PrimaryButton
              title="Confirm & calculate"
              onPress={handleConfirm}
              style={styles.confirmBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 27, 45, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedText,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Theme.colors.danger,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputBoxError: {
    borderColor: Theme.colors.danger,
    backgroundColor: '#FEF2F2',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.mutedText,
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  errorText: {
    fontSize: 11,
    color: Theme.colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderLight,
    marginVertical: 14,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  choiceChipActive: {
    backgroundColor: Theme.colors.primaryTint,
    borderColor: Theme.colors.primary,
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.mutedText,
  },
  choiceChipTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  helperNote: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
  },
});

export default ManualEntrySheet;

