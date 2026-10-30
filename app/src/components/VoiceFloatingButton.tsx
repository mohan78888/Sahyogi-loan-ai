import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme/theme';

interface VoiceFloatingButtonProps {
  onPress: () => void;
}

export const VoiceFloatingButton: React.FC<VoiceFloatingButtonProps> = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Continuous subtle pulsing and ripple animation to draw user's attention
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    const rippleLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rippleAnim, {
            toValue: 1.5,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    rippleLoop.start();

    return () => {
      pulseLoop.stop();
      rippleLoop.stop();
    };
  }, []);

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* Outer Ripple Wave */}
      <Animated.View
        style={[
          styles.rippleRing,
          {
            transform: [{ scale: rippleAnim }],
            opacity: rippleOpacity,
          },
        ]}
      />

      {/* Main Mic Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={onPress}
          activeOpacity={0.85}
          accessibilityLabel="Open Sahyogi Voice AI Assistant"
        >
          <View style={styles.micIconInner}>
            <Feather name="mic" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.badgePill}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.badgeText}>Voice AI</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  rippleRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F5C4D',
  },
  micButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#0F5C4D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F5C4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  micIconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    position: 'absolute',
    top: -9,
    backgroundColor: '#070E1E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  liveGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.3,
  },
});
