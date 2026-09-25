import { StyleSheet, View } from 'react-native';

import { ArrowRight, ICON_STROKE } from '@/components/icons/lucide';
import type { CastName } from '@/components/mascot/cast';
import type { CharacterProp } from '@/components/mascot/character';
import type { PoseName } from '@/components/mascot/poses';
import { ArtPanel } from '@/components/moment/art-panel';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { alpha, tints, type TintName } from '@/theme';

/** A soft prompt card: "Thanksgiving is in 9 weeks — start planning?" */
export function SuggestionCard({
  eyebrow,
  title,
  cta,
  tint,
  cast,
  pose = 'idle',
  prop,
  onPress,
  width = 220,
}: {
  eyebrow: string;
  title: string;
  cta: string;
  tint: TintName;
  cast: CastName;
  pose?: PoseName;
  prop?: CharacterProp;
  onPress: () => void;
  width?: number;
}) {
  const tn = tints[tint];
  return (
    <PressableScale haptics="tap" to={0.97} onPress={onPress} style={[styles.card, { width, backgroundColor: tn.bg }]} accessibilityLabel={title}>
      <ArtPanel tint={tint} cast={cast} pose={pose} prop={prop} castSize={96} style={styles.art} still />
      <View style={styles.body}>
        <Text variant="overline" color={alpha(tn.ink, 0.75)}>
          {eyebrow}
        </Text>
        <Text variant="headline" color={tn.ink} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.cta}>
          <Text variant="callout" color={tn.ink}>
            {cta}
          </Text>
          <ArrowRight size={16} color={tn.ink} strokeWidth={ICON_STROKE} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, overflow: 'hidden', borderCurve: 'continuous' },
  art: { height: 118 },
  body: { padding: 14, gap: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
});
