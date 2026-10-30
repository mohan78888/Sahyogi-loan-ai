import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Theme } from '../../src/theme/theme';
import { useFinance } from '../../src/context/FinanceContext';
import { ApiClient } from '../../src/services/apiClient';
import { formatRupee } from '../../src/utils/finance';
import { DemoBadge } from '../../src/components/DemoBadge';
import { ManualEntrySheet } from '../../src/components/ManualEntrySheet';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  calculationNote?: string;
  linkAction?: string;
  targetScreen?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const {
    source,
    inputs,
    calculations,
    hasData,
    documents,
    loadDemo,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const income = inputs.income || 0;
  const expenses = inputs.expenses || 0;
  const existingEmi = inputs.existingEmi || 0;
  const proposedEmi = inputs.proposedEmi || 0;
  const monthlySurplus = calculations.monthlySurplus ?? (income - expenses - existingEmi);
  const emiPct = calculations.emiToIncomePct ?? (income > 0 ? Math.round((existingEmi / income) * 1000) / 10 : 0);
  const surplusAfterNewEmi = calculations.surplusAfterNewEmi ?? (monthlySurplus - proposedEmi);

  // Initial messages based on user state
  const buildInitialMessages = (): Message[] => {
    if (!hasData) {
      return [
        {
          id: 'welcome-fresh',
          sender: 'assistant',
          text:
            'Hello! I am your Sahyogi Loan AI assistant. You have not added financial numbers yet. Upload a document or enter your numbers manually to get answers customized to your profile.',
          time: 'Just now',
          linkAction: 'Enter numbers manually (10s) →',
          targetScreen: 'manual_entry',
        },
      ];
    }

    if (source === 'demo') {
      return [
        {
          id: 'demo-1',
          sender: 'user',
          text: 'Why is my EMI-to-income ratio 27.5%?',
          time: 'Just now',
        },
        {
          id: 'demo-2',
          sender: 'assistant',
          text:
            'Your existing EMI is ₹16,500 and your monthly income is ₹60,000. Dividing one by the other gives 27.5%.',
          calculationNote: 'Calculated from numbers you confirmed.',
          time: 'Just now',
        },
        {
          id: 'demo-3',
          sender: 'user',
          text: 'How can I raise my surplus?',
          time: 'Just now',
        },
        {
          id: 'demo-4',
          sender: 'assistant',
          text:
            'Your expenses are the largest part of income at 41.7%. Even a small cut raises your surplus rupee for rupee. You can test it in the simulator.',
          calculationNote: 'Calculated from numbers you confirmed.',
          linkAction: 'Open what-if simulator →',
          targetScreen: 'simulator',
          time: 'Just now',
        },
      ];
    }

    // Live / Manual user state
    return [
      {
        id: 'user-confirmed-intro',
        sender: 'assistant',
        text: `Welcome! Based on your confirmed profile: monthly income of ${formatRupee(income)}, existing EMI of ${formatRupee(existingEmi)} (${emiPct}% burden), and monthly surplus of ${formatRupee(monthlySurplus)}. How can I assist you with your financial planning?`,
        calculationNote: 'Calculated from numbers you confirmed.',
        time: 'Just now',
      },
    ];
  };

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);

  // Sync messages if context state switches (e.g., demo loaded or reset)
  useEffect(() => {
    setMessages(buildInitialMessages());
  }, [source, hasData]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    if (text === 'Try the demo profile' || text === 'Load demo profile') {
      await loadDemo();
      return;
    }

    if (text === 'Enter numbers manually' || text === 'Enter my numbers') {
      setManualSheetVisible(true);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInputText('');
    }
    setLoading(true);

    try {
      // If backend is active and user has data, call AI advisor
      if (hasData) {
        const response = await ApiClient.sendChat(text, {
          monthly_income: income,
          monthly_expenses: expenses,
          existing_emis: existingEmi,
          proposed_emi: proposedEmi,
        });

        let linkAction: string | undefined = undefined;
        let targetScreen: string | undefined = undefined;
        const lower = text.toLowerCase();
        if (lower.includes('simulator') || lower.includes('what-if') || lower.includes('emi') || lower.includes('surplus')) {
          linkAction = 'Open what-if simulator →';
          targetScreen = 'simulator';
        } else if (lower.includes('pattern') || lower.includes('check')) {
          linkAction = 'Open pattern check →';
          targetScreen = 'prediction';
        } else if (lower.includes('document')) {
          linkAction = 'Upload documents →';
          targetScreen = 'docs';
        }

        const botReply: Message = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: response.reply,
          time: 'Just now',
          calculationNote: 'Calculated from numbers you confirmed.',
          linkAction,
          targetScreen,
        };

        setMessages((prev) => [...prev, botReply]);
        return;
      }
    } catch (err) {
      // Fall through to deterministic fallback
    } finally {
      setLoading(false);
    }

    // Pure deterministic fallback logic (Works 100% offline, never uses AI for numbers)
    let replyText = '';
    let note: string | undefined = undefined;
    let linkAction: string | undefined = undefined;
    let targetScreen: string | undefined = undefined;

    const lower = text.toLowerCase();

    if (!hasData) {
      replyText =
        'I do not have your confirmed financial details yet. Please enter your income and expenses or try our 1-click demo profile to receive personalized calculations.';
      linkAction = 'Enter numbers manually (10s) →';
      targetScreen = 'manual_entry';
    } else if (lower.includes('why') && (lower.includes('ratio') || lower.includes('emi'))) {
      replyText = `Your existing EMI is ${formatRupee(existingEmi)} and your monthly income is ${formatRupee(income)}. Dividing one by the other gives exactly ${emiPct}%.`;
      note = 'Calculated from numbers you confirmed.';
    } else if (lower.includes('afford') || lower.includes('surplus') || lower.includes('raise') || lower.includes('buffer')) {
      const expensePct = income > 0 ? Math.round((expenses / income) * 1000) / 10 : 0;
      replyText = `Your current monthly surplus is ${formatRupee(monthlySurplus)}. Living expenses take up ${expensePct}% of your earnings (${formatRupee(expenses)}). ${
        proposedEmi > 0
          ? `With your proposed EMI of ${formatRupee(proposedEmi)}, your net remaining buffer is ${formatRupee(surplusAfterNewEmi)}.`
          : 'You can test different EMI values and tenures in the what-if simulator.'
      }`;
      note = 'Calculated from numbers you confirmed.';
      linkAction = 'Open what-if simulator →';
      targetScreen = 'simulator';
    } else if (lower.includes('pattern') || lower.includes('check') || lower.includes('repay')) {
      replyText = `The repayment pattern check compares your confirmed numbers (debt ratio ${emiPct}%, surplus ${formatRupee(monthlySurplus)}) with historical borrower performance. It is a historical check, not loan approval.`;
      note = 'Calculated from numbers you confirmed.';
      linkAction = 'Open pattern check →';
      targetScreen = 'prediction';
    } else if (lower.includes('document') || lower.includes('missing') || lower.includes('upload')) {
      const confirmedDocs = documents.filter((d) => d.status === 'confirmed').length;
      replyText = `You currently have ${confirmedDocs} of 5 confirmed documents (${calculations.documentCompletenessPct}% verified). Adding a 3-month bank statement or salary slip improves assessment completeness.`;
      linkAction = 'Upload documents →';
      targetScreen = 'docs';
    } else if (lower.includes('plan') || lower.includes('90') || lower.includes('roadmap')) {
      replyText = `Your 90-day plan targets: Month 1: Audit discretionary expenses to safeguard your ${formatRupee(monthlySurplus)} surplus. Month 2: Test stress levels in the simulator. Month 3: Maintain 3 consecutive months of documented surplus.`;
      linkAction = 'View full 90-day plan →';
      targetScreen = 'report';
    } else {
      replyText = `Based on your confirmed monthly income of ${formatRupee(income)} and surplus of ${formatRupee(monthlySurplus)}, maintaining an EMI-to-income ratio below 35% ensures the safest buffer against financial shocks.`;
      note = 'Calculated from numbers you confirmed.';
    }

    const botReply: Message = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      time: 'Just now',
      calculationNote: note,
      linkAction,
      targetScreen,
    };

    setMessages((prev) => [...prev, botReply]);
  };

  const handleActionLink = (target?: string) => {
    if (!target) return;
    if (target === 'manual_entry') {
      setManualSheetVisible(true);
    } else if (target === 'simulator') {
      router.push('/simulator' as any);
    } else if (target === 'prediction') {
      router.push('/prediction' as any);
    } else if (target === 'docs') {
      router.navigate('/(tabs)/docs' as any);
    } else if (target === 'report') {
      router.navigate('/(tabs)/report' as any);
    }
  };

  const suggestionChips = !hasData
    ? [
        'Enter numbers manually',
        'Try the demo profile',
        'How is surplus calculated?',
        'What documents are required?',
      ]
    : [
        'Why is my EMI-to-income ratio ' + emiPct + '%?',
        'Can I afford my proposed EMI?',
        'Explain the pattern check',
        'Which documents are missing?',
        'Make a 90-day plan',
      ];

  const badgeLabel = source === 'demo' ? 'Demo data' : hasData ? 'Your data' : 'Empty';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Ask Sahyogi</Text>
          <Text style={styles.headerSubtitle}>Answers use your confirmed report</Text>
        </View>
        <DemoBadge label={badgeLabel} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Scroll Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userRow : styles.assistantRow,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.assistantMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Deterministic calculation subtext */}
                  {msg.calculationNote && (
                    <View style={styles.noteBox}>
                      <Feather name="check" size={12} color={Theme.colors.primary} />
                      <Text style={styles.noteText}>{msg.calculationNote}</Text>
                    </View>
                  )}

                  {/* Screen Navigation Link Action */}
                  {msg.linkAction && (
                    <TouchableOpacity
                      style={styles.actionLinkButton}
                      onPress={() => handleActionLink(msg.targetScreen)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionLinkText}>{msg.linkAction}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestionChips.map((suggestion, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Ask a question about your finances..."
            placeholderTextColor={Theme.colors.mutedText}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[
              styles.sendButton,
              inputText.trim().length > 0 && styles.sendButtonActive,
            ]}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() ? '#FFFFFF' : Theme.colors.mutedText}
            />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimerText}>
          Informational assessment only. Not a lender decision.
        </Text>
      </KeyboardAvoidingView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    gap: Theme.spacing.md,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: Theme.radius.card,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  userBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: Theme.colors.text,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  noteText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    fontStyle: 'italic',
    flex: 1,
  },
  actionLinkButton: {
    marginTop: Theme.spacing.sm,
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  suggestionsContainer: {
    paddingVertical: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    backgroundColor: Theme.colors.background,
  },
  suggestionsContent: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.chip,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.chip,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    color: Theme.colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: Theme.colors.card,
  },
});
