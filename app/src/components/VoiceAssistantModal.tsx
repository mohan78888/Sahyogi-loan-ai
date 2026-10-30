import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';
import { formatRupee } from '../utils/finance';

interface VoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenManualEntry: () => void;
}

const { width } = Dimensions.get('window');

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

  // Conversation stages: 'prompt' | 'step1_docs' | 'step2_analysis' | 'step3_schemes'
  const [stage, setStage] = useState<'prompt' | 'step1_docs' | 'step2_analysis' | 'step3_schemes'>('prompt');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  // Animated visualizer bars
  const barHeights = useRef([
    new Animated.Value(8),
    new Animated.Value(14),
    new Animated.Value(22),
    new Animated.Value(30),
    new Animated.Value(22),
    new Animated.Value(14),
    new Animated.Value(8),
  ]).current;

  // Stop TTS when closing
  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    setIsSpeaking(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        // Clean markdown asterisks for natural reading
        const plainText = text.replace(/[*#_~]/g, '');
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
      // Simulate speaking animation for 4 seconds on native
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

  // When modal closes, clean up voice
  useEffect(() => {
    if (!visible) {
      stopVoice();
      setStage('prompt');
      setUserQuery('');
    }
  }, [visible]);

  // Handle User Voice Query Trigger
  const handleTriggerVoice = (queryText?: string) => {
    const q = queryText || 'Yrr mujhe loan lena hai but applicant reject ho jata hai, kya karu?';
    setUserQuery(q);
    setStage('step1_docs');

    const step1Speech =
      'Namaste! Fikar mat kijiye. Bank loan rejection aksar high debt burden, low credit score, ya insufficient document verification ki wajah se hota hai. Aap apna Salary Slip ya Bank Statement provide karein ya quick numbers enter karein, taaki hum bank data connect karke exact approval formula nikal sakein.';
    speakText(step1Speech);
  };

  // Handle Loading Demo
  const handleLoadDemoProfile = () => {
    loadDemo();
    setStage('step2_analysis');
    const step2Speech =
      'Aapka profile connect ho gaya hai! Monthly income 60,000 rupaye me se 16,500 EMI me ja raha hai, jo 27.5% EMI burden hai. Aapka monthly surplus 18,500 bachta hai. Bank ke standard guidelines ke anusaar, chaliye dekhte hain kaunse schemes aur tenure se loan approve hoga.';
    speakText(step2Speech);
  };

  // Proceed to Step 3 (Schemes)
  const handleShowSchemes = () => {
    setStage('step3_schemes');
    const step3Speech =
      'Aapke profile ke hisaab se do powerful government schemes aur approval hacks hain: Pehla, PM Mudra Yojana jisme bina collateral ke loan milta hai. Aur doosra, loan tenure badhane se EMI 30% drop ho jayegi aur bank turant approve karega.';
    speakText(step3Speech);
  };

  // Dynamic calculations from context
  const income = inputs.income || (source === 'demo' ? 60000 : 0);
  const existingEmi = inputs.existingEmi || (source === 'demo' ? 16500 : 0);
  const monthlySurplus = calculations.monthlySurplus ?? (source === 'demo' ? 18500 : 0);
  const emiPct = calculations.emiToIncomePct ?? (source === 'demo' ? 27.5 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.aiAvatar}>
                <Feather name="mic" size={17} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.titleText}>Sahyogi Voice AI</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isSpeaking ? '#10B981' : '#38BDF8' },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {isSpeaking ? 'AI Speaking...' : 'NLP Voice Assistant'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActionRow}>
              {/* Voice Mute / Speaker Toggle */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  if (isSpeaking) stopVoice();
                  setIsMuted(!isMuted);
                }}
                activeOpacity={0.7}
                accessibilityLabel="Toggle Voice Audio"
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

          {/* Sound Wave Equalizer Display */}
          <View style={styles.visualizerContainer}>
            <View style={styles.soundWaveRow}>
              {barHeights.map((barH, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.soundBar,
                    {
                      height: barH,
                      backgroundColor: isSpeaking ? '#0F5C4D' : '#94A3B8',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.soundWaveCaption}>
              {isSpeaking
                ? 'Speaking response in Hindi / English...'
                : stage === 'prompt'
                ? 'Tap mic or quick prompt below to speak'
                : 'Tap cards below to proceed'}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {/* STAGE 0: PROMPT SELECTION & BIG MIC */}
            {stage === 'prompt' && (
              <View style={styles.promptStageBox}>
                <TouchableOpacity
                  style={styles.bigMicHero}
                  onPress={() => handleTriggerVoice()}
                  activeOpacity={0.8}
                >
                  <View style={styles.bigMicGlow}>
                    <Feather name="mic" size={38} color="#FFFFFF" />
                  </View>
                  <Text style={styles.bigMicLabel}>Tap to Speak</Text>
                  <Text style={styles.bigMicSub}>or select a question below</Text>
                </TouchableOpacity>

                <View style={styles.promptListContainer}>
                  <Text style={styles.promptListHeading}>Suggested Voice Prompts:</Text>

                  <TouchableOpacity
                    style={styles.promptChip}
                    onPress={() =>
                      handleTriggerVoice(
                        'Yrr mujhe loan lena hai but applicant reject ho jata hai, kya karu?'
                      )
                    }
                    activeOpacity={0.75}
                  >
                    <View style={styles.promptChipIcon}>
                      <Feather name="help-circle" size={16} color="#0F5C4D" />
                    </View>
                    <View style={styles.promptChipTextWrap}>
                      <Text style={styles.promptChipText}>
                        "Yrr mujhe loan lena hai but reject ho jata hai, kya karu?"
                      </Text>
                      <Text style={styles.promptChipMeta}>Rejection diagnosis & scheme advice</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.promptChip}
                    onPress={() =>
                      handleTriggerVoice('Mera EMI burden kitna percent safe hai?')
                    }
                    activeOpacity={0.75}
                  >
                    <View style={styles.promptChipIcon}>
                      <Feather name="percent" size={16} color="#1D4ED8" />
                    </View>
                    <View style={styles.promptChipTextWrap}>
                      <Text style={styles.promptChipText}>
                        "Mera EMI burden kitna percent safe hai?"
                      </Text>
                      <Text style={styles.promptChipMeta}>Debt-to-income threshold check</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.promptChip}
                    onPress={() =>
                      handleTriggerVoice(
                        'Kaunsi government scheme se bina collateral loan mil sakta hai?'
                      )
                    }
                    activeOpacity={0.75}
                  >
                    <View style={styles.promptChipIcon}>
                      <Feather name="award" size={16} color="#B45309" />
                    </View>
                    <View style={styles.promptChipTextWrap}>
                      <Text style={styles.promptChipText}>
                        "Kaunsi government scheme se loan mil sakta hai?"
                      </Text>
                      <Text style={styles.promptChipMeta}>PM Mudra & Jan Samarth schemes</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* USER SPEECH BUBBLE */}
            {stage !== 'prompt' && userQuery ? (
              <View style={styles.userBubble}>
                <View style={styles.userBubbleIcon}>
                  <Feather name="user" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.userBubbleText}>{userQuery}</Text>
              </View>
            ) : null}

            {/* STAGE 1: AI ASKS FOR DOCUMENTS / DATA */}
            {stage === 'step1_docs' && (
              <View style={styles.stepBox}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiBubbleHeader}>
                    <Text style={styles.aiBubbleName}>Sahyogi Voice AI</Text>
                    <TouchableOpacity
                      onPress={() =>
                        speakText(
                          'Namaste! Fikar mat kijiye. Bank loan rejection aksar high debt burden, low credit score, ya insufficient document verification ki wajah se hota hai. Aap apna Salary Slip ya Bank Statement provide karein ya quick numbers enter karein, taaki hum bank data connect karke exact approval formula nikal sakein.'
                        )
                      }
                      style={styles.replaySpeakerBtn}
                    >
                      <Feather name="volume-2" size={14} color="#0F5C4D" />
                      <Text style={styles.replaySpeakerText}>Listen</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.aiBubbleText}>
                    <Text style={{ fontWeight: '700' }}>Fikar mat kijiye!</Text> Bank rejection
                    aksar <Text style={{ fontWeight: '700' }}>high EMI burden (FOIR &gt; 50%)</Text>,
                    low credit score, ya incomplete income documentation ki wajah se hota hai.
                  </Text>
                  <Text style={[styles.aiBubbleText, { marginTop: 8 }]}>
                    Aap apna <Text style={{ fontWeight: '700' }}>Salary Slip / Bank Statement</Text>{' '}
                    provide karein ya numbers enter karein, taaki hum bank rules se connect karke
                    exact reason aur solution nikal sakein:
                  </Text>
                </View>

                {/* 3 Action Buttons */}
                <View style={styles.actionCardsGroup}>
                  {/* Option A: Upload Document */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                      onClose();
                      router.push('/(tabs)/docs' as any);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionCardIconBox, { backgroundColor: '#E6F4EA' }]}>
                      <Feather name="file-text" size={20} color="#0F5C4D" />
                    </View>
                    <View style={styles.actionCardBody}>
                      <Text style={styles.actionCardTitle}>1. Upload Document (PDF)</Text>
                      <Text style={styles.actionCardDesc}>
                        Salary slip ya bank statement se auto-extract
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Option B: Manual Entry */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                      onClose();
                      onOpenManualEntry();
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionCardIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Feather name="edit-3" size={20} color="#1D4ED8" />
                    </View>
                    <View style={styles.actionCardBody}>
                      <Text style={styles.actionCardTitle}>2. Enter Numbers Manually</Text>
                      <Text style={styles.actionCardDesc}>Income aur EMI enter karein (10 sec)</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Option C: Load Demo Profile (1-Tap for Judges) */}
                  <TouchableOpacity
                    style={[styles.actionCard, styles.actionCardDemo]}
                    onPress={handleLoadDemoProfile}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionCardIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Feather name="zap" size={20} color="#B45309" />
                    </View>
                    <View style={styles.actionCardBody}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.actionCardTitle, { color: '#B45309' }]}>
                          3. Test with Demo Profile
                        </Text>
                        <View style={styles.instantBadge}>
                          <Text style={styles.instantBadgeText}>Instant 1-Tap</Text>
                        </View>
                      </View>
                      <Text style={styles.actionCardDesc}>
                        ₹60k Income, ₹16.5k EMI profile ke saath judge demo dekhein
                      </Text>
                    </View>
                    <Feather name="arrow-right" size={18} color="#B45309" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STAGE 2: CONNECTED DATA ANALYSIS */}
            {stage === 'step2_analysis' && (
              <View style={styles.stepBox}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiBubbleHeader}>
                    <Text style={styles.aiBubbleName}>Sahyogi Voice AI — Bank Data Match</Text>
                    <TouchableOpacity
                      onPress={() =>
                        speakText(
                          `Aapka profile connect ho gaya hai! Monthly income ${income} rupaye me se ${existingEmi} EMI me ja raha hai, jo ${emiPct}% EMI burden hai. Aapka monthly surplus ${monthlySurplus} bachta hai.`
                        )
                      }
                      style={styles.replaySpeakerBtn}
                    >
                      <Feather name="volume-2" size={14} color="#0F5C4D" />
                      <Text style={styles.replaySpeakerText}>Listen</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.aiBubbleText}>
                    <Text style={{ fontWeight: '700', color: '#0F5C4D' }}>
                      Data successfully connected!
                    </Text>{' '}
                    Aapka current financial health score calculate ho gaya hai:
                  </Text>

                  {/* Metric snapshot tiles */}
                  <View style={styles.metricGrid}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Monthly Income</Text>
                      <Text style={styles.metricValue}>{formatRupee(income)}</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Existing EMI</Text>
                      <Text style={styles.metricValue}>{formatRupee(existingEmi)}</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Debt-to-Income (FOIR)</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          { color: emiPct > 40 ? '#B45309' : '#0F5C4D' },
                        ]}
                      >
                        {emiPct}%
                      </Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Monthly Surplus</Text>
                      <Text style={[styles.metricValue, { color: '#0F5C4D' }]}>
                        {formatRupee(monthlySurplus)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.diagnosisBox}>
                    <Feather name="alert-circle" size={16} color="#B45309" />
                    <Text style={styles.diagnosisText}>
                      <Text style={{ fontWeight: '700' }}>Rejection Risk Diagnosis:</Text> Direct
                      unsecured personal loan apply karne par naye proposed EMI se FOIR 45% cross ho
                      sakta hai. Lekin subsidized government schemes se approval chances 90%+ ho
                      jate hain.
                    </Text>
                  </View>
                </View>

                {/* Continue button to Step 3 */}
                <TouchableOpacity
                  style={styles.primaryNextBtn}
                  onPress={handleShowSchemes}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryNextBtnText}>
                    See Recommended Schemes & Approval Hacks →
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STAGE 3: SCHEMES & STRATEGY */}
            {stage === 'step3_schemes' && (
              <View style={styles.stepBox}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiBubbleHeader}>
                    <Text style={styles.aiBubbleName}>Sahyogi Voice AI — Bank Approval Roadmap</Text>
                    <TouchableOpacity
                      onPress={() =>
                        speakText(
                          'Aapke profile ke hisaab se do powerful government schemes hain: PM Mudra Yojana jisme bina collateral ke loan milta hai, aur loan tenure badhane se EMI 30% drop ho jayegi.'
                        )
                      }
                      style={styles.replaySpeakerBtn}
                    >
                      <Feather name="volume-2" size={14} color="#0F5C4D" />
                      <Text style={styles.replaySpeakerText}>Listen</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.aiBubbleText}>
                    In schemes aur loan structuring se bank aapka loan reject nahi karega:
                  </Text>
                </View>

                {/* Scheme Card 1: PM Mudra */}
                <View style={styles.schemeCard}>
                  <View style={styles.schemeCardTop}>
                    <View style={styles.schemeBadge}>
                      <Text style={styles.schemeBadgeText}>Central Govt Scheme</Text>
                    </View>
                    <Text style={styles.schemeApprovalRate}>High Approval Rate</Text>
                  </View>
                  <Text style={styles.schemeTitle}>1. PM Mudra Yojana (PMMY)</Text>
                  <Text style={styles.schemeDesc}>
                    Bina kisi collateral (security) ke ₹10 Lakhs tak loan milta hai. Kishore
                    (₹50k-₹5L) category me processing fees 0% hoti hai.
                  </Text>
                  <View style={styles.schemeTagRow}>
                    <View style={styles.schemeTag}>
                      <Text style={styles.schemeTagText}>Zero Collateral</Text>
                    </View>
                    <View style={styles.schemeTag}>
                      <Text style={styles.schemeTagText}>Subsidized Rate</Text>
                    </View>
                  </View>
                </View>

                {/* Scheme Card 2: Jan Samarth */}
                <View style={styles.schemeCard}>
                  <View style={styles.schemeCardTop}>
                    <View style={[styles.schemeBadge, { backgroundColor: '#EFF6FF' }]}>
                      <Text style={[styles.schemeBadgeText, { color: '#1D4ED8' }]}>
                        Direct Subsidy
                      </Text>
                    </View>
                    <Text style={styles.schemeApprovalRate}>JanSamarth Portal</Text>
                  </View>
                  <Text style={styles.schemeTitle}>2. Jan Samarth Credit Portal</Text>
                  <Text style={styles.schemeDesc}>
                    Ek hi application me 13 government credit schemes se digital approval milta hai.
                    Bank verification direct Aadhaar & PAN se hota hai.
                  </Text>
                </View>

                {/* Underwriter Hack: Tenure Extension */}
                <View style={styles.hackCard}>
                  <View style={styles.hackCardHeader}>
                    <Feather name="check-circle" size={17} color="#0F5C4D" />
                    <Text style={styles.hackCardTitle}>Underwriter Approval Hack</Text>
                  </View>
                  <Text style={styles.hackCardDesc}>
                    • <Text style={{ fontWeight: '700' }}>Tenure badhayein:</Text> 3 saal ki jagah
                    5 saal tenure lene par proposed EMI ~35% kam ho jayegi, jisse FOIR bank ke safe
                    limit (&lt;40%) me aa jayega.
                  </Text>
                  <Text style={[styles.hackCardDesc, { marginTop: 6 }]}>
                    • <Text style={{ fontWeight: '700' }}>Co-Applicant add karein:</Text> Family
                    member ki income jodkar FOIR aur surplus strong ho jata hai.
                  </Text>
                </View>

                {/* Final Navigation Buttons */}
                <View style={styles.footerNavCol}>
                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() => {
                      onClose();
                      router.push('/simulator' as any);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="sliders" size={15} color="#0F5C4D" />
                    <Text style={styles.actionOutlineBtnText}>Test in What-If Simulator</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionTextBtn}
                    onPress={() => {
                      setStage('prompt');
                      setUserQuery('');
                      stopVoice();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionTextBtnText}>← Ask another question</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
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
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  soundWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
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
    maxHeight: 520,
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  promptStageBox: {
    alignItems: 'center',
    paddingTop: 6,
  },
  bigMicHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bigMicGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F5C4D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F5C4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  bigMicLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  bigMicSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  promptListContainer: {
    width: '100%',
    gap: 10,
  },
  promptListHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  promptChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  promptChipTextWrap: {
    flex: 1,
  },
  promptChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
  },
  promptChipMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5C4D',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
    gap: 8,
    marginBottom: 14,
  },
  userBubbleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  stepBox: {
    gap: 14,
  },
  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  aiBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiBubbleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5C4D',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  replaySpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  replaySpeakerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F5C4D',
  },
  aiBubbleText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  actionCardsGroup: {
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 13,
    gap: 12,
  },
  actionCardDemo: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  actionCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardBody: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionCardDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  instantBadge: {
    backgroundColor: '#B45309',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  instantBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  diagnosisBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  diagnosisText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
    flex: 1,
  },
  primaryNextBtn: {
    backgroundColor: '#0F5C4D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0F5C4D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryNextBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 6,
  },
  schemeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  schemeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F5C4D',
  },
  schemeApprovalRate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  schemeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  schemeDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  schemeTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  schemeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schemeTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  hackCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
  },
  hackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  hackCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  hackCardDesc: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 18,
  },
  footerNavCol: {
    gap: 10,
    marginTop: 4,
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F5C4D',
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5C4D',
  },
  actionTextBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionTextBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
