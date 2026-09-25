import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DotGrid, Grain } from '@/components/brand/textures';
import type { CastName } from '@/components/mascot/cast';
import { Character, type CharacterProp } from '@/components/mascot/character';
import type { PoseName } from '@/components/mascot/poses';
import { art } from '@/data/art';
import { absoluteFill, alpha, tints, type TintName } from '@/theme';

/**
 * The illustrated panel behind cards and heroes. Uses the AI clay art when it exists
 * (sitting on its measured background colour), otherwise a cast character on the tint
 * with grain and a soft dot grid — so every surface looks finished before the art lands.
 */
export function ArtPanel({
  artKey,
  tint,
  cast,
  pose = 'idle',
  prop,
  castSize = 150,
  still,
  style,
  children,
}: {
  artKey?: string;
  tint: TintName;
  cast: CastName;
  pose?: PoseName;
  prop?: CharacterProp;
  castSize?: number;
  still?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const a = art(artKey);
  const tn = tints[tint];
  return (
    <View style={[{ backgroundColor: a?.bg ?? tn.bg, overflow: 'hidden' }, style]}>
      {a ? (
        <Image accessibilityLabel="" accessible={false} source={a.source} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      ) : (
        <>
          <DotGrid color={alpha(tn.ink, 0.16)} fade="radial" />
          <View style={styles.center}>
            <Character kind={cast} pose={pose} size={castSize} prop={prop} still={still} />
          </View>
        </>
      )}
      <Grain opacity={0.07} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...absoluteFill, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 },
});
