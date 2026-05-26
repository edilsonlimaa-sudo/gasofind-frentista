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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { DatabaseProvider, useDatabase } from '@/contexts/database-context';
import { ShiftProvider } from '@/contexts/shift-context';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isInitialized, error } = useDatabase();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-base p-6">
        <Text className="font-display-bold text-lg text-status-red mb-3 text-center">
          Erro ao inicializar banco de dados
        </Text>
        <Text className="font-sans text-sm text-text-muted text-center">{error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return null; // Keep splash screen visible
  }

  return (
    <ShiftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ShiftProvider>
  );
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
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
