import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const slideTitle = useRef(new Animated.Value(24)).current;
  const slideFeatures = useRef(new Animated.Value(20)).current;
  const slideButton = useRef(new Animated.Value(32)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideTitle, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideFeatures, {
        toValue: 0,
        duration: 650,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideButton, {
        toValue: 0,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle gentle pulse for the start button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, []);

  const handlePressGetStarted = () => {
    // Smooth exit transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.95,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGetStarted();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* High-Resolution Financial Banking Background Image */}
      <ImageBackground
        source={require('../../assets/welcome-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Navy Subtle Overlay Layers */}
        <View style={styles.overlayBase} />
        <View style={styles.overlayVignette} />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Top AI Intelligence Pill */}
            <View style={styles.topBadgeContainer}>
              <View style={styles.aiBadgePill}>
                <View style={styles.aiPulseDot} />
                <Text style={styles.aiBadgeText}>AI-POWERED LENDING INTELLIGENCE</Text>
              </View>
            </View>

            {/* Center Brand & Title Section */}
            <View style={styles.centerSection}>
              {/* Glowing Emblem Badge */}
              <Animated.View
                style={[
                  styles.logoWrapper,
                  {
                    transform: [{ scale: logoScale }],
                  },
                ]}
              >
                <View style={styles.logoOuterGlow} />
                <View style={styles.logoBox}>
                  <Text style={styles.logoLetter}>S</Text>
                  <View style={styles.sparkleIconWrap}>
                    <Feather name="trending-up" size={13} color="#10B981" />
                  </View>
                </View>
              </Animated.View>

              {/* App Name and Tagline */}
              <Animated.View
                style={{
                  alignItems: 'center',
                  transform: [{ translateY: slideTitle }],
                }}
              >
                <Text style={styles.appNameTitle}>Sahyogi Loan AI</Text>
                <Text style={styles.appTagline}>Your Trusted AI Loan Assistant</Text>
                
                {/* Decorative Accent Line */}
                <View style={styles.accentLineRow}>
                  <View style={styles.accentLine} />
                  <View style={styles.accentDot} />
                  <View style={styles.accentLine} />
                </View>
              </Animated.View>

              {/* Fintech Trust Points */}
              <Animated.View
                style={[
                  styles.featuresList,
                  {
                    transform: [{ translateY: slideFeatures }],
                  },
                ]}
              >
                <View style={styles.featureItem}>
                  <View style={styles.featureIconWrap}>
                    <Feather name="check" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.featureText}>Smart Cash Flow & Surplus Analysis</Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconWrap}>
                    <Feather name="cpu" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.featureText}>20,000 Loan Historical Repayment Check</Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconWrap}>
                    <Feather name="shield" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.featureText}>Private & Secure Document Intelligence</Text>
                </View>
              </Animated.View>
            </View>

            {/* Bottom Section: Get Started Button & Disclaimers */}
            <Animated.View
              style={[
                styles.bottomSection,
                {
                  transform: [
                    { translateY: slideButton },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.getStartedButton}
                activeOpacity={0.88}
                onPress={handlePressGetStarted}
                accessibilityRole="button"
                accessibilityLabel="Get Started with Sahyogi Loan AI"
              >
                <View style={styles.buttonTextRow}>
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                  <View style={styles.arrowCircle}>
                    <Feather name="arrow-right" size={18} color="#070E1E" />
                  </View>
                </View>
              </TouchableOpacity>

              <Text style={styles.securityFootnote}>
                Bank-grade 256-bit encryption · Unbiased advisory
              </Text>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070E1E',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 14, 30, 0.85)',
  },
  overlayVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 22, 43, 0.50)',
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 20,
  },
  topBadgeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  aiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  aiPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  centerSection: {
    alignItems: 'center',
    marginVertical: 'auto',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoOuterGlow: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#0A182E',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sparkleIconWrap: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#070E1E',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 3,
  },
  appNameTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CDE8E2',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  accentLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    width: 140,
  },
  accentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  accentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  featuresList: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(10, 22, 43, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E2E8F0',
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  getStartedButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#070E1E',
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityFootnote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default WelcomeScreen;
