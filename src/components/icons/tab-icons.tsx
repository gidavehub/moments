import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { sparklePath } from '@/components/brand/geometry';

export type TabIconName = 'home' | 'calendar' | 'ideas' | 'you';

/** Bespoke tab glyphs on a 24 grid — outline when idle, filled with a gold accent when focused. */
export const TabIcon = memo(function TabIcon({
  name,
  focused,
  color,
  accent,
  size = 24,
}: {
  name: TabIconName;
  focused: boolean;
  color: string;
  accent: string;
  size?: number;
}) {
  const sw = 2.1;
  const fill = focused ? color : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <>
          <Path
            d="M4 10.4 L11.1 4.3 a1.4 1.4 0 0 1 1.8 0 L20 10.4 V18.6 a1.9 1.9 0 0 1 -1.9 1.9 H15 V15.4 a1.2 1.2 0 0 0 -1.2 -1.2 h-3.6 a1.2 1.2 0 0 0 -1.2 1.2 V20.5 H5.9 A1.9 1.9 0 0 1 4 18.6 Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={fill}
          />
          {focused && <Path d={sparklePath(12, 11, 2.6)} fill={accent} />}
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3.5} y={5.5} width={17} height={15} rx={4} stroke={color} strokeWidth={sw} fill={fill} />
          <Path d="M8 3.5 V7.5 M16 3.5 V7.5" stroke={focused ? accent : color} strokeWidth={sw + 0.2} strokeLinecap="round" />
          {focused ? (
            <Path d={sparklePath(12, 13.5, 3.6)} fill={accent} />
          ) : (
            <Path d="M3.5 10 H20.5" stroke={color} strokeWidth={sw} />
          )}
        </>
      )}
      {name === 'ideas' && (
        <>
          <Path d={sparklePath(10.5, 13, 8)} stroke={color} strokeWidth={sw} strokeLinejoin="round" fill={fill} />
          <Path d={sparklePath(18.5, 5.5, 3.2)} fill={focused ? accent : color} />
        </>
      )}
      {name === 'you' && (
        <>
          <Circle cx={12} cy={8.4} r={3.9} stroke={color} strokeWidth={sw} fill={fill} />
          <Path d="M4.6 20.2 C5.4 16.4 8.4 14.4 12 14.4 C15.6 14.4 18.6 16.4 19.4 20.2" stroke={color} strokeWidth={sw} strokeLinecap="round" fill={fill} />
          {focused && <Circle cx={12} cy={8.4} r={1.3} fill={accent} />}
        </>
      )}
    </Svg>
  );
});
