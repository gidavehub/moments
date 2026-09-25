import { StyleSheet, View } from 'react-native';

import { useSurfaceTone, type SurfaceTone } from './surface-tone';

/**
 * Drop inside any non-paper surface (first child, parent positioned) and the system bars
 * will treat that surface's box as `tone` whenever it slides under the status or home bar.
 */
export function SurfaceMark({ tone = 'dark', priority = 1 }: { tone?: SurfaceTone; priority?: number }) {
  const ref = useSurfaceTone(tone, priority);
  return <View ref={ref} collapsable={false} style={styles.fill} />;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
});
