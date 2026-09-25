import '@/global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DeviceFrame } from '@/components/dev/device-frame';
import { AppKeyboardProvider } from '@/components/providers/keyboard';
import { SystemBars } from '@/components/system-bars/system-bars';
import { fullScreen, sheet } from '@/navigation/presentations';
import { AppThemeProvider, fontFiles, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const t = useTheme();
  return (
    <>
      <SystemBars />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.color.bg },
          animation: 'ios_from_right',
        }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="splash" options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="plan/new" options={fullScreen()} />
        <Stack.Screen name="plan/run" options={fullScreen({ animation: 'fade', gestureEnabled: false })} />
        <Stack.Screen name="moment/[id]/index" />
        <Stack.Screen
          name="moment/[id]/item/[itemId]"
          options={sheet([0.94], { contentStyle: { backgroundColor: t.color.surface } })}
        />
        <Stack.Screen name="moment/[id]/quote" options={sheet([0.92], { contentStyle: { backgroundColor: t.color.surface } })} />
        <Stack.Screen name="idea/[slug]" />
        <Stack.Screen name="review" options={fullScreen({ gestureEnabled: false })} />
        <Stack.Screen name="bin" options={sheet([0.5, 0.92], { contentStyle: { backgroundColor: t.color.surface } })} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="dev/gallery" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontFiles);

  const onLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={styles.fill}>
      <AppKeyboardProvider>
        <AppThemeProvider>
          <View style={styles.fill} onLayout={onLayout}>
            <DeviceFrame>
              <RootStack />
            </DeviceFrame>
          </View>
        </AppThemeProvider>
      </AppKeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
