import React from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

export default function WelcomeRoute() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)' as any);
  };

  return <WelcomeScreen onGetStarted={handleGetStarted} />;
}

