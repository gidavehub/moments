import { type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { useBarTones } from '@/components/system-bars/surface-tone';

/**
 * Dev-only phone chrome for the web preview. Open any route with `?device=ios` or
 * `?device=android` and the app gets real-device safe-area insets plus a drawn status bar
 * and home bar on top, so anything that would sit under the clock, battery or home
 * indicator shows up in a browser screenshot. `?device=off` clears it.
 */
type Device = 'ios' | 'android';

const INSETS: Record<Device, EdgeInsets> = {
  // iPhone 15/16 (Dynamic Island) and a typical gesture-nav Android phone, edge-to-edge.
  ios: { top: 59, bottom: 34, left: 0, right: 0 },
  android: { top: 36, bottom: 24, left: 0, right: 0 },
};

function readDevice(): Device | null {
  if (Platform.OS !== 'web' || !__DEV__ || typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('device');
    if (q === 'off') window.sessionStorage.removeItem('moments.device');
    else if (q === 'ios' || q === 'android') window.sessionStorage.setItem('moments.device', q);
    const v = window.sessionStorage.getItem('moments.device');
    return v === 'ios' || v === 'android' ? v : null;
  } catch {
    return null;
  }
}

const device = readDevice();

export function DeviceFrame({ children }: { children: ReactNode }) {
  if (!device) return <>{children}</>;
  return (
    <FakeInsets device={device}>
      {children}
      <StatusBarMock device={device} />
      <HomeBarMock device={device} />
    </FakeInsets>
  );
}

function FakeInsets({ device, children }: { device: Device; children: ReactNode }) {
  const real = useSafeAreaInsets();
  const fake = INSETS[device];
  return (
    <SafeAreaInsetsContext.Provider value={{ ...real, top: fake.top, bottom: fake.bottom }}>
      <View style={styles.fill}>{children}</View>
    </SafeAreaInsetsContext.Provider>
  );
}

const DARK = '#0B1B2B';
const LIGHT = '#FFFFFF';

function StatusBarMock({ device }: { device: Device }) {
  const INK = useBarTones().top === 'light' ? LIGHT : DARK;
  const h = INSETS[device].top;
  const ios = device === 'ios';
  return (
    <View style={[styles.top, { height: h, paddingHorizontal: ios ? 34 : 18, paddingTop: ios ? 14 : 6 }]}>
      <Text style={[styles.clock, ios ? styles.clockIos : styles.clockAndroid, { color: INK }]}>9:41</Text>
      {ios && <View style={styles.island} />}
      <Svg width={ios ? 78 : 66} height={14} viewBox="0 0 78 14">
        {/* signal */}
        {[0, 1, 2, 3].map((i) => (
          <Rect key={i} x={i * 5} y={10 - i * 3} width={3.4} height={4 + i * 3} rx={1} fill={INK} />
        ))}
        {/* wifi */}
        <Path d="M30 4.6a9 9 0 0 1 12 0l-1.3 1.4a7.1 7.1 0 0 0-9.4 0Z M32.6 7.4a5.4 5.4 0 0 1 6.8 0L38 8.8a3.5 3.5 0 0 0-4 0Z M36 13l-1.8-2a2.6 2.6 0 0 1 3.6 0Z" fill={INK} />
        {/* battery */}
        <Rect x={50} y={1.5} width={24} height={11} rx={3.4} fill="none" stroke={INK} strokeOpacity={0.4} strokeWidth={1} />
        <Rect x={52} y={3.5} width={17} height={7} rx={1.8} fill={INK} />
        <Rect x={75.2} y={5} width={1.6} height={4} rx={0.8} fill={INK} fillOpacity={0.4} />
      </Svg>
    </View>
  );
}

function HomeBarMock({ device }: { device: Device }) {
  const ink = useBarTones().bottom === 'light' ? LIGHT : DARK;
  const h = INSETS[device].bottom;
  return (
    <View style={[styles.bottom, { height: h }]}>
      <View style={[device === 'ios' ? styles.homeIos : styles.homeAndroid, { backgroundColor: ink }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  clock: { fontWeight: '600' },
  clockIos: { fontSize: 16, marginTop: 1 },
  clockAndroid: { fontSize: 13 },
  island: { position: 'absolute', top: 11, left: '50%', marginLeft: -62, width: 124, height: 36, borderRadius: 18, backgroundColor: '#000' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', zIndex: 9999 },
  homeIos: { width: 134, height: 5, borderRadius: 3, marginBottom: 8 },
  homeAndroid: { width: 108, height: 4, borderRadius: 2, opacity: 0.7, marginBottom: 9 },
});
