import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Theme } from '../src/theme/theme';
import { FinanceProvider } from '../src/context/FinanceContext';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

export default function RootLayout() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <StatusBar style={showWelcome ? 'light' : 'dark'} />
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Theme.colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="prediction" options={{ headerShown: false }} />
            <Stack.Screen name="simulator" options={{ headerShown: false }} />
            <Stack.Screen name="results" options={{ headerShown: false }} />
            <Stack.Screen name="schemes" options={{ headerShown: false }} />
            <Stack.Screen name="calculator" options={{ headerShown: false }} />
          </Stack>

          {showWelcome && (
            <View style={styles.welcomeOverlay}>
              <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />
            </View>
          )}
        </View>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070E1E',
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
