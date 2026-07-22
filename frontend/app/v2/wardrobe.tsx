import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { V2_CATEGORIES, V2_ITEMS, V2_STATE, V2Item, v2Colors, v2Radius, v2Spacing } from '@/src/v2/theme';

export default function V2Wardrobe() {
  const router = useRouter();
  const [tab, setTab] = useState<typeof V2_CATEGORIES[number]['key']>('outfit');
  const [equipped, setEquipped] = useState<string>('i3');
  const luna = CHARACTERS[0];

  const items = V2_ITEMS.filter((i) => i.category === tab);

  return (
    <View style={s.root} testID="v2-wardrobe">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.header}>
          <Pressable testID="v2-wardrobe-back" onPress={() => router.back()} style={s.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={v2Colors.ink} />
          </Pressable>
          <Text style={s.title}>Wardrobe</Text>
          <View style={s.pill}>
            <Ionicons name="ellipse" size={12} color={v2Colors.ink} />
            <Text style={s.pillText}>{V2_STATE.coins}</Text>
          </View>
        </View>

        {/* Character preview stage */}
        <View style={s.stage} testID="v2-stage">
          <View style={s.stageBg} />
          <View style={s.stageFloor} />
          {/* twinkles */}
          <Text style={[s.twinkle, { top: 20, left: 30 }]}>✦</Text>
          <Text style={[s.twinkle, { top: 60, right: 40 }]}>✦</Text>
          <Text style={[s.twinkle, { bottom: 60, left: 20 }]}>✧</Text>

          <Image source={luna.image} style={s.stageCharacter} contentFit="contain" />

          <View style={s.stageName}>
            <Text style={s.stageNameText}>{luna.name}</Text>
          </View>

          {/* rotate buttons */}
          <View style={[s.rotBtn, { left: v2Spacing.md }]}>
            <Ionicons name="chevron-back" size={16} color={v2Colors.ink} />
          </View>
          <View style={[s.rotBtn, { right: v2Spacing.md }]}>
            <Ionicons name="chevron-forward" size={16} color={v2Colors.ink} />
          </View>
        </View>

        {/* Category tabs */}
        <View style={s.tabs} testID="v2-cat-tabs">
          {V2_CATEGORIES.map((c) => {
            const active = c.key === tab;
            return (
              <Pressable
                key={c.key}
                testID={`v2-cat-${c.key}`}
                onPress={() => setTab(c.key)}
                style={[s.tab, active && s.tabActive]}
              >
                <Text style={s.tabIcon}>{c.icon}</Text>
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Item grid */}
        <ScrollView
          contentContainerStyle={s.grid}
          showsVerticalScrollIndicator={false}
          testID="v2-item-grid"
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              equipped={item.id === equipped}
              onEquip={() => setEquipped(item.id)}
            />
          ))}
          {items.length === 0 && (
            <Text style={s.emptyText}>Nothing here yet — check the Shop!</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ItemCard({ item, equipped, onEquip }: { item: V2Item; equipped: boolean; onEquip: () => void }) {
  return (
    <Pressable
      testID={`v2-item-${item.id}`}
      onPress={item.owned ? onEquip : undefined}
      style={({ pressed }) => [s.card, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <View style={[s.cardThumb, { backgroundColor: item.color }]}>
        <Text style={s.cardEmoji}>{item.emoji}</Text>
        {item.owned && (
          <View style={s.ownedBadge}>
            <Ionicons name="checkmark" size={12} color={v2Colors.ink} />
          </View>
        )}
      </View>
      <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
      {item.owned ? (
        <View style={[s.cardBuy, equipped && { backgroundColor: v2Colors.mint }]}>
          <Text style={s.cardBuyText}>{equipped ? 'Wearing' : 'Wear'}</Text>
        </View>
      ) : (
        <View style={s.cardBuy}>
          <Ionicons
            name={item.currency === 'gem' ? 'diamond' : 'ellipse'}
            size={10}
            color={v2Colors.ink}
          />
          <Text style={s.cardBuyText}>{item.price}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: v2Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: v2Spacing.lg, paddingTop: v2Spacing.sm, paddingBottom: v2Spacing.md,
    gap: v2Spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: v2Colors.ink },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: v2Colors.yellow, borderRadius: v2Radius.pill,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  pillText: { fontSize: 13, fontWeight: '800', color: v2Colors.ink },

  stage: {
    marginHorizontal: v2Spacing.lg, height: 280,
    borderRadius: v2Radius.xl, overflow: 'hidden',
    borderWidth: 3, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  stageBg: { position: 'absolute', top: 0, left: 0, right: 0, height: '75%', backgroundColor: v2Colors.pink },
  stageFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', backgroundColor: v2Colors.peach },
  twinkle: { position: 'absolute', fontSize: 20, color: v2Colors.paper, fontWeight: '800' },
  stageCharacter: { width: 200, height: 260, position: 'absolute', bottom: 10 },
  stageName: {
    position: 'absolute', top: 14,
    backgroundColor: v2Colors.paper,
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: v2Radius.pill,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  stageNameText: { fontSize: 14, fontWeight: '800', color: v2Colors.ink },
  rotBtn: {
    position: 'absolute', top: '50%', width: 30, height: 30, borderRadius: 15,
    backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: v2Colors.ink,
  },

  tabs: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
  },
  tab: {
    flex: 1, alignItems: 'center',
    paddingVertical: v2Spacing.sm,
    borderRadius: v2Radius.md,
    borderWidth: 2, borderColor: v2Colors.border,
    backgroundColor: v2Colors.paper,
  },
  tabActive: { borderColor: v2Colors.ink, backgroundColor: v2Colors.yellow },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: v2Colors.inkSoft, marginTop: 2 },
  tabLabelActive: { color: v2Colors.ink },

  grid: {
    paddingHorizontal: v2Spacing.lg, paddingTop: v2Spacing.md, paddingBottom: v2Spacing.xxl,
    flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '30.5%', backgroundColor: v2Colors.paper,
    borderRadius: v2Radius.md,
    borderWidth: 2, borderColor: v2Colors.ink,
    padding: 6, alignItems: 'center',
  },
  cardThumb: {
    width: '100%', aspectRatio: 1,
    borderRadius: v2Radius.sm,
    borderWidth: 1.5, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  cardEmoji: { fontSize: 34 },
  ownedBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: v2Colors.mint,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  cardName: { fontSize: 11, fontWeight: '700', color: v2Colors.ink, marginVertical: 2 },
  cardBuy: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: v2Radius.pill,
    backgroundColor: v2Colors.creamDeep,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  cardBuyText: { fontSize: 11, fontWeight: '800', color: v2Colors.ink },
  emptyText: { flex: 1, textAlign: 'center', color: v2Colors.inkSoft, fontSize: 13, marginTop: v2Spacing.xl },
});
