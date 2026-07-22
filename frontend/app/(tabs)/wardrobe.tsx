import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { CATEGORIES, CategoryKey, ITEMS, Item, RARITY } from '@/src/items';
import { useInventory } from '@/src/store/inventory';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';

export default function WardrobeScreen() {
  const inv = useInventory();
  const [tab, setTab] = useState<CategoryKey>('outfit');

  const ownedChars = CHARACTERS.filter((c) => inv.hasChar(c.id));
  const activeChar = ownedChars.find((c) => c.id === inv.activeChar) ?? ownedChars[0] ?? CHARACTERS[0];
  const items = ITEMS.filter((i) => i.category === tab);
  const equippedOutfit = useMemo(() => ITEMS.find((i) => i.id === inv.equipped.outfit), [inv.equipped.outfit]);

  const cycleChar = (dir: 1 | -1) => {
    if (ownedChars.length < 2) return;
    const idx = ownedChars.findIndex((c) => c.id === activeChar.id);
    const next = (idx + dir + ownedChars.length) % ownedChars.length;
    inv.setActiveChar(ownedChars[next].id);
  };

  return (
    <View style={s.root} testID="wardrobe-screen">
      <ImageBackground source={scenes.wardrobe} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.80)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Wardrobe</Text>
            <Text style={s.subtitle}>{inv.ownedItems.length} pieces · {ownedChars.length} friend{ownedChars.length === 1 ? '' : 's'}</Text>
          </View>
          <View style={s.coinsPill}>
            <View style={s.coinsShadow} />
            <View style={s.coinsFace}>
              <Ionicons name="ellipse" size={13} color={colors.onSurface} />
              <Text style={s.coinsText} testID="wardrobe-coins">{inv.coins}</Text>
            </View>
          </View>
        </View>

        {/* Character preview stage */}
        <View style={s.stage} testID="wardrobe-stage">
          <View style={s.stageShadow} />
          <View style={s.stageFace}>
            <Image source={activeChar.image} style={s.stageChar} contentFit="contain" />

            <Pressable
              testID="wardrobe-char-prev"
              onPress={() => cycleChar(-1)}
              style={[s.rotBtn, { left: spacing.md }, ownedChars.length < 2 && { opacity: 0.4 }]}
            >
              <Ionicons name="chevron-back" size={16} color={colors.onSurface} />
            </Pressable>
            <Pressable
              testID="wardrobe-char-next"
              onPress={() => cycleChar(1)}
              style={[s.rotBtn, { right: spacing.md }, ownedChars.length < 2 && { opacity: 0.4 }]}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.onSurface} />
            </Pressable>

            <View style={s.namePlate}>
              <Text style={s.namePlateText}>{activeChar.name}</Text>
            </View>

            <View style={s.wearingChip}>
              <Ionicons name="shirt" size={12} color={colors.onSurface} />
              <Text style={s.wearingText} numberOfLines={1}>
                {equippedOutfit ? equippedOutfit.name : 'nothing on'}
              </Text>
            </View>
          </View>
        </View>

        {/* Category tabs */}
        <View style={s.catRow} testID="wardrobe-cats">
          {CATEGORIES.map((c) => {
            const active = c.key === tab;
            return (
              <Pressable key={c.key} testID={`wardrobe-cat-${c.key}`} onPress={() => setTab(c.key)} style={s.catBtn}>
                <View style={[s.catShadow, { opacity: active ? 0.55 : 0.3 }]} />
                <View style={[s.catFace, active && { backgroundColor: colors.brandYellow }]}>
                  <Text style={s.catEmoji}>{c.emoji}</Text>
                  <Text style={[s.catLabel, active && s.catLabelActive]}>{c.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Item grid */}
        <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false} testID="wardrobe-grid">
          {items.map((it) => {
            const owned = inv.hasItem(it.id);
            return (
              <ItemCard
                key={it.id}
                item={it}
                owned={owned}
                equipped={it.id === inv.equipped[it.category]}
                onPress={() => owned && inv.equip(it.category, it.id)}
              />
            );
          })}
          {items.length === 0 && <Text style={s.emptyText}>nothing here yet — go pull in Gacha!</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ItemCard({ item, owned, equipped, onPress }: { item: Item; owned: boolean; equipped: boolean; onPress: () => void }) {
  const r = RARITY[item.rarity];
  return (
    <Pressable
      testID={`wardrobe-item-${item.id}`}
      onPress={onPress}
      style={({ pressed }) => [s.cardWrap, pressed && owned && { transform: [{ translateY: 2 }] }]}
    >
      <View style={s.cardShadow} />
      <View style={[s.cardFace, equipped && { borderColor: colors.brandSecondary, borderWidth: 3 }]}>
        <View style={[s.ribbon, { backgroundColor: r.ring }]}>
          <Text style={s.ribbonText}>{r.label}</Text>
        </View>

        <View style={[s.slot, { backgroundColor: r.tint, borderColor: r.ring, borderWidth: r.border }]}>
          <View style={s.slotInner}>
            <Text style={s.slotEmoji}>{item.emoji}</Text>
          </View>
          {owned ? (
            <View style={s.ownedBadge}>
              <Ionicons name="checkmark" size={12} color={colors.onSurface} />
            </View>
          ) : (
            <View style={s.lockBadge}>
              <Ionicons name="lock-closed" size={11} color={colors.onSurfaceInverse} />
            </View>
          )}
        </View>

        <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>

        <View style={[s.cardCta, equipped && { backgroundColor: colors.brandSecondary }]}>
          {owned ? (
            <Text style={s.cardCtaText}>{equipped ? '✓ Wearing' : 'Wear'}</Text>
          ) : (
            <Text style={s.cardCtaText}>locked</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  title: { fontFamily: typography.display, fontSize: 30, color: colors.onSurface, letterSpacing: -0.3 },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.onSurfaceTertiary, fontWeight: '600' },
  coinsPill: { position: 'relative' },
  coinsShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.pill, opacity: 0.4,
  },
  coinsFace: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    backgroundColor: colors.brandYellow, borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  coinsText: { fontFamily: typography.display, fontSize: 14, color: colors.onSurface },

  stage: { marginHorizontal: spacing.lg, position: 'relative' },
  stageShadow: {
    position: 'absolute', top: 6, left: 4, right: -4, bottom: -6,
    backgroundColor: colors.borderInk, borderRadius: radius.xl, opacity: 0.4,
  },
  stageFace: {
    height: 250, backgroundColor: 'rgba(255,251,240,0.85)', borderRadius: radius.xl,
    borderWidth: 2.5, borderColor: colors.borderInk,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  stageChar: { width: '80%', height: '95%' },
  rotBtn: {
    position: 'absolute', top: '46%', width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.borderInk,
  },
  namePlate: {
    position: 'absolute', top: 14, backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  namePlateText: { fontFamily: typography.display, fontSize: 15, color: colors.onSurface },
  wearingChip: {
    position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5,
    maxWidth: '80%', backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  wearingText: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface },

  catRow: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  catBtn: { flex: 1, position: 'relative' },
  catShadow: {
    position: 'absolute', top: 4, left: 2, right: -2, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md,
  },
  catFace: {
    alignItems: 'center', paddingVertical: 8, backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md, borderWidth: 2, borderColor: colors.borderInk,
  },
  catEmoji: { fontSize: 18 },
  catLabel: { fontFamily: typography.display, fontSize: 11, color: colors.onSurfaceTertiary, marginTop: 2 },
  catLabelActive: { color: colors.onSurface },

  grid: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl,
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  cardWrap: { width: '30.5%', position: 'relative' },
  cardShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md, opacity: 0.4,
  },
  cardFace: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderInk, padding: 6, alignItems: 'center', overflow: 'hidden',
  },
  ribbon: {
    alignSelf: 'stretch', marginTop: -6, marginHorizontal: -6, marginBottom: 6,
    paddingVertical: 2, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.borderInk,
  },
  ribbonText: { fontFamily: typography.display, fontSize: 9, color: colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
  slot: { width: '100%', aspectRatio: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  slotInner: {
    width: '78%', height: '78%', borderRadius: radius.sm - 2,
    borderWidth: 1.5, borderColor: 'rgba(74,50,25,0.35)', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  slotEmoji: { fontSize: 32 },
  ownedBadge: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.brandSecondary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  lockBadge: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.surfaceInverse, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  cardName: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface, marginBottom: 4 },
  cardCta: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary, borderWidth: 1.5, borderColor: colors.borderInk,
  },
  cardCtaText: { fontFamily: typography.display, fontSize: 11, color: colors.onSurface },
  emptyText: {
    flex: 1, textAlign: 'center', color: colors.onSurfaceTertiary, fontSize: 13,
    marginTop: spacing.xxl, fontWeight: '600',
  },
});
