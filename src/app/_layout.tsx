import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
    SpaceMono_400Regular,
    SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoginScreen } from '@/components/login-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import HomeScreen from './index';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, accessToken } = useAuth();

  if (isLoading) return null;
  if (!accessToken) return <LoginScreen />;
  return <HomeScreen />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
