import { StyleSheet, View } from 'react-native';

import { HalfDonut } from '@/components/ui/half-donut';
import { Text } from '@/components/ui/text';
import { spend } from '@/data/store';
import type { BudgetCategory, Moment } from '@/data/types';
import { FX, money, moneyShort } from '@/lib/money';
import { brand, ink, tints, useTheme } from '@/theme';

const LABEL: Record<BudgetCategory, string> = {
  decor: 'Decor',
  food: 'Food and drinks',
  cake: 'Cake',
  venue: 'Venue and rentals',
  people: 'People',
  gifts: 'Gifts and favours',
  other: 'Other',
};

/** Budget gauge: a segmented half donut (the mental-health "weekly mood" meter) plus a legend. */
export function BudgetMeter({ moment }: { moment: Moment }) {
  const t = useTheme();
  const s = spend(moment);
  const budget = moment.budgetUsd * FX.JMD;
  const colors: Record<BudgetCategory, string> = {
    venue: ink[700],
    decor: brand.gold,
    food: tints.babyShower.deep,
    cake: tints.wedding.deep,
    people: tints.dinner.deep,
    gifts: tints.gift.deep,
    other: ink[300],
  };
  const cats = (Object.keys(s.by) as BudgetCategory[]).sort((a, b) => s.by[b] - s.by[a]);
  const over = s.estimate > budget;

  return (
    <View style={{ gap: 18 }}>
      <View style={{ alignItems: 'center' }}>
        <HalfDonut width={250} thickness={22} total={Math.max(budget, s.estimate)} segments={cats.map((c) => ({ key: c, value: s.by[c], color: colors[c] }))}>
          <Text variant="caption" tone="muted">
            Planned, landed
          </Text>
          <Text variant="title1" style={{ fontSize: 28, lineHeight: 32 }}>
            {moneyShort(s.estimate)}
          </Text>
          <Text variant="caption" tone={over ? 'discount' : 'muted'}>
            of {moneyShort(budget)} · US${moment.budgetUsd.toLocaleString()}
          </Text>
        </HalfDonut>
      </View>
      <View style={styles.legend}>
        {cats.map((c) => (
          <View key={c} style={[styles.cell, { backgroundColor: t.color.bgSoft, borderColor: t.color.hairline }]}>
            <View style={[styles.swatch, { backgroundColor: colors[c] }]} />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {LABEL[c]}
              </Text>
              <Text variant="callout">{money(s.by[c])}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text variant="footnote" tone="muted" align="center">
        {money(s.committed)} agreed so far · {over ? 'A little over — ask Keisha for swaps' : `${moneyShort(budget - s.estimate)} to spare`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  swatch: { width: 10, height: 28, borderRadius: 5 },
});
