import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useDisplayFonts } from '@/src/hooks/use-display-fonts';
import { InventoryProvider } from '@/src/store/inventory';

// Disable logbox errors so users can preview cleanly.
LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();
  const [displayLoaded] = useDisplayFonts();

  useEffect(() => {
    if ((loaded || error) && displayLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, displayLoaded]);

  if ((!loaded && !error) || !displayLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <InventoryProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FCF9F2' } }} />
      </InventoryProvider>
    </SafeAreaProvider>
  );
}
