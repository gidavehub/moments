import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme, type ShadowName } from '@/theme';

const RT = 16; // tab corner
const RB = 24; // body corner
const J = 16; // concave joint

/** One continuous outline: a tab on the top-left that flows into the body through a concave curve. */
export function folderPath(w: number, h: number, tabW: number, tabH: number) {
  const tw = Math.min(tabW, w - RB - J);
  return [
    `M0 ${RT}`,
    `A${RT} ${RT} 0 0 1 ${RT} 0`,
    `H${tw - RT}`,
    `A${RT} ${RT} 0 0 1 ${tw} ${RT}`,
    `V${tabH - J}`,
    `A${J} ${J} 0 0 0 ${tw + J} ${tabH}`,
    `H${w - RB}`,
    `A${RB} ${RB} 0 0 1 ${w} ${tabH + RB}`,
    `V${h - RB}`,
    `A${RB} ${RB} 0 0 1 ${w - RB} ${h}`,
    `H${RB}`,
    `A${RB} ${RB} 0 0 1 0 ${h - RB}`,
    'Z',
  ].join(' ');
}

/**
 * The S2S folder-tab card (landing `landing-cutout-card`): a white body with a label tab.
 * Depth comes from two shadow plates under the outline (tab + body) so it works on every platform.
 */
export function FolderCard({
  tab,
  children,
  tabWidth = 120,
  tabHeight = 34,
  fill,
  elevation = 'float',
  style,
  contentStyle,
}: {
  tab?: ReactNode;
  children?: ReactNode;
  tabWidth?: number;
  tabHeight?: number;
  fill?: string;
  elevation?: ShadowName;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  const bg = fill ?? t.color.surface;

  return (
    <View onLayout={onLayout} style={style}>
      {size.w > 0 && (
        <>
          <View
            style={[{ pointerEvents: 'none' }, styles.plate, { top: tabHeight, borderRadius: RB, boxShadow: t.shadow[elevation], backgroundColor: bg }]}
          />
          <View
            style={[
              { pointerEvents: 'none' },
              styles.tabPlate,
              { width: Math.min(tabWidth, size.w - RB - J), height: tabHeight + RT, borderRadius: RT, boxShadow: t.shadow.plate, backgroundColor: bg },
            ]}
          />
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={size.w} height={size.h}>
            <Path d={folderPath(size.w, size.h, tabWidth, tabHeight)} fill={bg} />
          </Svg>
        </>
      )}
      <View style={[styles.tab, { width: tabWidth, height: tabHeight }]}>{tab}</View>
      <View style={[styles.body, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  tabPlate: { position: 'absolute', top: 0, left: 0 },
  tab: { paddingHorizontal: 14, justifyContent: 'center' },
  body: { padding: 16, paddingTop: 12 },
});
