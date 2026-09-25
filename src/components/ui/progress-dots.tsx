import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { alpha, cssEase, enter, kf, stagger, useTheme } from '@/theme';

export type DotState = 'done' | 'half' | 'todo';

/**
 * A row of check circles — done (ticked), half (in progress, half-filled like the reference),
 * todo (faint). Pops in with a stagger.
 */
export function ProgressDots({
  items,
  size = 22,
  onColor,
  style,
}: {
  items: DotState[];
  size?: number;
  /** When drawn on a coloured header (e.g. ink sheen), pass the foreground. */
  onColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const fg = onColor ?? t.color.text;
  const r = size / 2 - 1.5;
  return (
    <View style={[styles.row, style]}>
      {items.map((s, i) => (
        <Animated.View key={i} style={enter(kf.popIn, 200 + stagger(i, 60), 420, cssEase.spring)}>
          <Svg width={size} height={size}>
            {s === 'todo' ? (
              <Circle cx={size / 2} cy={size / 2} r={r} fill={alpha(fg, 0.14)} />
            ) : (
              <>
                <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fg} strokeWidth={1.6} opacity={0.9} />
                {s === 'done' ? (
                  <Path
                    d={`M${size * 0.3} ${size * 0.52} L${size * 0.44} ${size * 0.65} L${size * 0.71} ${size * 0.37}`}
                    stroke={fg}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ) : (
                  <Path
                    d={`M${size / 2} ${size / 2 - r + 3} A${r - 3} ${r - 3} 0 0 1 ${size / 2} ${size / 2 + r - 3} Z`}
                    fill={fg}
                  />
                )}
              </>
            )}
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 6, alignItems: 'center' } });
