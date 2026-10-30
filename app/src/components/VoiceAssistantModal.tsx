import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';
import { formatRupee } from '../utils/finance';

interface VoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenManualEntry: () => void;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  action?: 'doc_prompt' | 'demo_loaded' | 'schemes_info';
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  visible,
  onClose,
  onOpenManualEntry,
}) => {
  const router = useRouter();
  const {
    source,
    inputs,
    calculations,
    hasData,
    loadDemo,
  } = useFinance();

  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const scrollViewRef = useRef<any>(null);

  // Animated visualizer bars for Gemini-like live equalizer
  const barHeights = useRef([
    new Animated.Value(8),
    new Animated.Value(14),
    new Animated.Value(22),
    new Animated.Value(30),
    new Animated.Value(22),
    new Animated.Value(14),
    new Animated.Value(8),
  ]).current;

  const income = inputs.income || (source === 'demo' ? 60000 : 0);
  const existingEmi = inputs.existingEmi || (source === 'demo' ? 16500 : 0);
  const monthlySurplus = calculations.monthlySurplus ?? (source === 'demo' ? 18500 : 0);
  const emiPct = calculations.emiToIncomePct ?? (source === 'demo' ? 27.5 : 0);

  // Initialize with initial greeting when opened
  useEffect(() => {
    if (visible && messages.length === 0) {
      const initialGreeting: ChatMsg = {
        id: 'greet-1',
        sender: 'ai',
        text: 'Namaste! Main aapka Sahyogi Gemini AI Assistant hoon. Aap bol kar ya likh kar apna loan sawal pooch sakte hain. Jaise: "Loan reject ho jata hai kya karu?" ya "Mera EMI safe hai?"',
        time: 'Just now',
      };
      setMessages([initialGreeting]);
      speakText(initialGreeting.text);
    }
  }, [visible]);

  // Clean up speech on close
  const stopVoice = () => {
    try {
      Speech.stop();
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!visible) {
      stopVoice();
      setInputText('');
    }
  }, [visible]);

  // TTS Speech implementation
  const speakText = (text: string) => {
    if (isMuted) return;
    setIsSpeaking(true);

    const plainText = text.replace(/[*#_~]/g, '');

    // 1. Native Expo-Speech (Android & iOS direct, 100% free)
    try {
      Speech.stop();
      Speech.speak(plainText, {
        language: 'hi-IN',
        pitch: 1.0,
        rate: 0.95,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => {
          try {
            Speech.speak(plainText, {
              language: 'en-IN',
              pitch: 1.0,
              rate: 0.95,
              onStart: () => setIsSpeaking(true),
              onDone: () => setIsSpeaking(false),
              onStopped: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
          } catch {
            setIsSpeaking(false);
          }
        },
      });
      return;
    } catch {
      // fallback
    }

    // 2. Web fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const inVoice = voices.find(
          (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.lang.includes('en-IN')
        );
        if (inVoice) {
          utterance.voice = inVoice;
        }

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
      }
    } else {
      setTimeout(() => {
        setIsSpeaking(false);
      }, 4000);
    }
  };

  // Soundwave animation loop
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isSpeaking) {
      const createBarAnim = (val: Animated.Value, maxH: number) =>
        Animated.sequence([
          Animated.timing(val, {
            toValue: maxH,
            duration: 180 + Math.random() * 120,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: 6 + Math.random() * 8,
            duration: 180 + Math.random() * 120,
            useNativeDriver: false,
          }),
        ]);

      animLoop = Animated.loop(
        Animated.parallel(
          barHeights.map((bar, i) =>
            createBarAnim(bar, i === 3 ? 34 : i === 2 || i === 4 ? 26 : 16)
          )
        )
      );
      animLoop.start();
    } else {
      barHeights.forEach((bar) => {
        Animated.timing(bar, {
          toValue: 8,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isSpeaking]);

  // Generate Intelligent Response based on Gemini / Underwriter Rules
  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputText).trim();
    if (!q) return;

    // Add user message
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    stopVoice();

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const qLower = q.toLowerCase();
    let replyText = '';
    let actionType: 'doc_prompt' | 'demo_loaded' | 'schemes_info' | undefined;

    // Try calling backend /api/ai/chat
    try {
      const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const resp = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          context: {
            income,
            existingEmi,
            foir_pct: emiPct,
            monthly_surplus: monthlySurplus,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.reply) {
          replyText = data.reply;
        }
      }
    } catch {
      // Offline / Local Intelligence fallback
    }

    // If backend did not provide reply, use smart conversational underwriter logic
    if (!replyText) {
      if (qLower.includes('reject') || qLower.includes('rejection') || qLower.includes('nahi mil raha')) {
        replyText =
          'Bank rejection aksar high EMI burden (FOIR > 50%), low CIBIL, ya missing documents ki wajah se hota hai. Aap apna Salary slip ya Bank statement upload karein ya numbers enter karein, taaki hum bank data connect karke exact approval formula nikal sakein.';
        actionType = 'doc_prompt';
      } else if (qLower.includes('mudra') || qLower.includes('scheme') || qLower.includes('yojana') || qLower.includes('subsidy')) {
        replyText =
          'Aapke liye PM Mudra Yojana sabse best hai, jisme bina collateral ke ₹10 Lakhs tak loan milta hai. Jan Samarth portal se aap 13 government schemes me digital approval le sakte hain.';
        actionType = 'schemes_info';
      } else if (qLower.includes('cibil') || qLower.includes('credit score') || qLower.includes('score')) {
        replyText =
          'Safe loan approval ke liye 750+ CIBIL score best hota hai. Kisi bhi EMI ki date miss na karein aur credit card limit ka sirf 30% use karein taaki score jaldi improve ho.';
      } else if (qLower.includes('emi') || qLower.includes('surplus') || qLower.includes('foir') || qLower.includes('burden')) {
        if (income > 0) {
          replyText = `Aapka monthly income ₹${income.toLocaleString('en-IN')} hai aur EMI ₹${existingEmi.toLocaleString('en-IN')} hai (${emiPct}% DTI). Aapka disposable surplus ₹${monthlySurplus.toLocaleString('en-IN')} bachta hai, jo bank ke safe limit me hai.`;
        } else {
          replyText =
            'Indian banks ka rule hota hai ki total EMI aapki income ke 40-50% se kam honi chahiye. Aap apna data enter karein taaki exact ratio nikal sakein.';
          actionType = 'doc_prompt';
        }
      } else if (qLower.includes('kitna loan') || qLower.includes('eligibility') || qLower.includes('limit')) {
        const estLoan = income > 0 ? income * 12 * 3.5 : 500000;
        replyText = `Aapki income ke mutabiq aap lagbhag ₹${Math.round(estLoan).toLocaleString('en-IN')} tak loan ke eligible ho sakte hain agar FOIR 45% ke andar rahe.`;
      } else {
        replyText =
          'Main aapke borrower profile ko evaluate karke bank underwriting guidelines aur government schemes (PM Mudra, Jan Samarth) ke hisaab se best advice de sakta hoon.';
      }
    }

    const aiMsg: ChatMsg = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      time: 'Just now',
      action: actionType,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);

    // AI speaks the reply aloud!
    speakText(replyText);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.aiAvatar}>
                <Feather name="mic" size={17} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.titleText}>Sahyogi Gemini AI Voice</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isSpeaking ? '#10B981' : isThinking ? '#F59E0B' : '#38BDF8' },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {isSpeaking ? 'AI Speaking aloud...' : isThinking ? 'Gemini AI Thinking...' : 'Ready to Speak or Chat'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActionRow}>
              {/* Speaker Mute/Unmute */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  if (isSpeaking) stopVoice();
                  setIsMuted(!isMuted);
                }}
                activeOpacity={0.7}
                accessibilityLabel="Toggle Voice Speaker"
              >
                <Feather
                  name={isMuted ? 'volume-x' : 'volume-2'}
                  size={18}
                  color={isMuted ? Theme.colors.mutedText : Theme.colors.primary}
                />
              </TouchableOpacity>

              {/* Close Sheet */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityLabel="Close Voice Assistant"
              >
                <Feather name="x" size={18} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gemini Live Sound Wave Equalizer Display */}
          <View style={styles.visualizerContainer}>
            <View style={styles.soundWaveRow}>
              {barHeights.map((barH, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.soundBar,
                    {
                      height: barH,
                      backgroundColor: isSpeaking
                        ? idx % 2 === 0
                          ? '#0F5C4D'
                          : '#10B981'
                        : isThinking
                        ? '#F59E0B'
                        : '#94A3B8',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.soundWaveCaption}>
              {isSpeaking
                ? '🔊 Speaking response in voice...'
                : isThinking
                ? '⚡ Processing through Gemini & Underwriter engine...'
                : '🎙️ Speak with keyboard mic or choose prompt below'}
            </Text>
          </View>

          {/* Chat Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.msgWrapper,
                  item.sender === 'user' ? styles.userMsgWrapper : styles.aiMsgWrapper,
                ]}
              >
                {item.sender === 'ai' ? (
                  <View style={styles.aiBubble}>
                    <View style={styles.aiBubbleHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="cpu" size={13} color="#0F5C4D" />
                        <Text style={styles.aiBubbleName}>Sahyogi Gemini AI</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => speakText(item.text)}
                        style={styles.replaySpeakerBtn}
                        activeOpacity={0.7}
                      >
                        <Feather name="volume-2" size={13} color="#0F5C4D" />
                        <Text style={styles.replaySpeakerText}>Replay Voice</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.aiBubbleText}>{item.text}</Text>

                    {/* In-chat interactive action cards */}
                    {item.action === 'doc_prompt' && (
                      <View style={styles.inlineActionBox}>
                        <TouchableOpacity
                          style={styles.inlineActionBtn}
                          onPress={() => {
                            onClose();
                            router.push('/(tabs)/docs' as any);
                          }}
                          activeOpacity={0.8}
                        >
                          <Feather name="upload" size={14} color="#0F5C4D" />
                          <Text style={styles.inlineActionBtnText}>Upload Salary/Bank PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.inlineActionBtn, { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }]}
                          onPress={() => {
                            loadDemo();
                            handleSendMessage('Mera demo data connect karke analysis batao');
                          }}
                          activeOpacity={0.8}
                        >
                          <Feather name="zap" size={14} color="#B45309" />
                          <Text style={[styles.inlineActionBtnText, { color: '#B45309' }]}>
                            1-Tap Demo Profile Load
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {item.action === 'schemes_info' && (
                      <View style={styles.inlineActionBox}>
                        <TouchableOpacity
                          style={styles.inlineActionBtn}
                          onPress={() => {
                            onClose();
                            router.push('/schemes' as any);
                          }}
                          activeOpacity={0.8}
                        >
                          <Feather name="external-link" size={14} color="#0F5C4D" />
                          <Text style={styles.inlineActionBtnText}>Open All Government Schemes</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.userBubble}>
                    <Feather name="mic" size={13} color="#FFFFFF" style={{ marginTop: 2 }} />
                    <Text style={styles.userBubbleText}>{item.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Quick Voice Prompt Suggestions */}
            <View style={styles.quickPromptSection}>
              <Text style={styles.quickPromptHeader}>Quick Voice Prompts (1-Tap):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPillsRow}>
                <TouchableOpacity
                  style={styles.quickPill}
                  onPress={() => handleSendMessage('Yrr mujhe loan lena hai but reject ho jata hai, kya karu?')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickPillText}>"Reject ho jata hai kya karu?"</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickPill}
                  onPress={() => handleSendMessage('Mera EMI burden aur FOIR ratio kitna safe hai?')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickPillText}>"Mera EMI burden safe hai?"</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickPill}
                  onPress={() => handleSendMessage('Kaunsi government scheme se bina collateral loan mil sakta hai?')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickPillText}>"PM Mudra loan kaise milega?"</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickPill}
                  onPress={() => handleSendMessage('CIBIL score 650 se 750 kaise karein?')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickPillText}>"CIBIL score 750 kaise karein?"</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>

          {/* Gemini-Style Voice & Text Input Bar */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask anything or use keyboard mic 🎙️..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage()}
                returnKeyType="send"
              />

              {/* Send / Speak Button */}
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: inputText.trim() ? '#0F5C4D' : '#E2E8F0' },
                ]}
                onPress={() => handleSendMessage()}
                activeOpacity={0.8}
                disabled={!inputText.trim()}
              >
                <Feather
                  name="arrow-up"
                  size={18}
                  color={inputText.trim() ? '#FFFFFF' : '#94A3B8'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 14, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F5C4D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F5C4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizerContainer: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  soundWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    gap: 6,
  },
  soundBar: {
    width: 4.5,
    borderRadius: 3,
  },
  soundWaveCaption: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  scrollContent: {
    maxHeight: 460,
  },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  msgWrapper: {
    width: '100%',
  },
  userMsgWrapper: {
    alignItems: 'flex-end',
  },
  aiMsgWrapper: {
    alignItems: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#0F5C4D',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userBubbleText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    lineHeight: 19,
    fontWeight: '500',
  },
  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    maxWidth: '92%',
  },
  aiBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiBubbleName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F5C4D',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  replaySpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  replaySpeakerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F5C4D',
  },
  aiBubbleText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  inlineActionBox: {
    marginTop: 10,
    gap: 8,
  },
  inlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F5C4D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5C4D',
  },
  quickPromptSection: {
    marginTop: 8,
  },
  quickPromptHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  quickPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPillText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
