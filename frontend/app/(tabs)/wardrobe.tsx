import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { CATEGORIES, CategoryKey, ITEMS, Item } from '@/src/items';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';

export default function WardrobeScreen() {
  const [tab, setTab] = useState<CategoryKey>('outfit');
  const [equippedId, setEquippedId] = useState('i3');
  const luna = CHARACTERS[0];
  const items = ITEMS.filter((i) => i.category === tab);

  return (
    <View style={s.root} testID="wardrobe-screen">
      {/* Illustrated wardrobe scene as backdrop, tinted */}
      <ImageBackground source={scenes.wardrobe} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.72)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Wardrobe</Text>
            <Text style={s.subtitle}>dress up your teahouse friends</Text>
          </View>
          <View style={s.coinsPill}>
            <View style={s.coinsShadow} />
            <View style={s.coinsFace}>
              <Ionicons name="ellipse" size={13} color={colors.onSurface} />
              <Text style={s.coinsText}>240</Text>
            </View>
          </View>
        </View>

        {/* Character preview stage */}
        <View style={s.stage} testID="wardrobe-stage">
          <View style={s.stageShadow} />
          <View style={s.stageFace}>
            {/* twinkles */}
            <Text style={[s.twinkle, { top: 18, left: 22 }]}>✦</Text>
            <Text style={[s.twinkle, { top: 40, right: 26 }]}>✧</Text>
            <Text style={[s.twinkle, { bottom: 40, left: 30 }]}>♡</Text>

            <Image source={luna.image} style={s.stageChar} contentFit="contain" />

            {/* rotate arrows */}
            <View style={[s.rotBtn, { left: spacing.md }]}>
              <Ionicons name="chevron-back" size={16} color={colors.onSurface} />
            </View>
            <View style={[s.rotBtn, { right: spacing.md }]}>
              <Ionicons name="chevron-forward" size={16} color={colors.onSurface} />
            </View>

            {/* name chip */}
            <View style={s.namePlate}>
              <Text style={s.namePlateText}>{luna.name}</Text>
            </View>
          </View>
        </View>

        {/* Category tabs */}
        <View style={s.catRow} testID="wardrobe-cats">
          {CATEGORIES.map((c) => {
            const active = c.key === tab;
            return (
              <Pressable
                key={c.key}
                testID={`wardrobe-cat-${c.key}`}
                onPress={() => setTab(c.key)}
                style={s.catBtn}
              >
                <View style={[
                  s.catShadow,
                  { opacity: active ? 0.55 : 0.3 },
                ]} />
                <View style={[
                  s.catFace,
                  active && { backgroundColor: colors.brandYellow, borderColor: colors.borderInk },
                ]}>
                  <Text style={s.catEmoji}>{c.emoji}</Text>
                  <Text style={[s.catLabel, active && s.catLabelActive]}>{c.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Item grid */}
        <ScrollView
          contentContainerStyle={s.grid}
          showsVerticalScrollIndicator={false}
          testID="wardrobe-grid"
        >
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              equipped={it.id === equippedId}
              onPress={() => it.owned && setEquippedId(it.id)}
            />
          ))}
          {items.length === 0 && (
            <Text style={s.emptyText}>nothing here yet — check the Shop!</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ItemCard({
  item,
  equipped,
  onPress,
}: {
  item: Item;
  equipped: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`wardrobe-item-${item.id}`}
      onPress={onPress}
      style={({ pressed }) => [s.cardWrap, pressed && item.owned && { transform: [{ translateY: 2 }] }]}
    >
      <View style={s.cardShadow} />
      <View style={s.cardFace}>
        <View style={[s.cardThumb, { backgroundColor: item.color }]}>
          <Text style={s.cardEmoji}>{item.emoji}</Text>
          {item.owned && (
            <View style={s.ownedBadge}>
              <Ionicons name="checkmark" size={12} color={colors.onSurface} />
            </View>
          )}
        </View>
        <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
        <View
          style={[
            s.cardBuy,
            equipped && { backgroundColor: colors.brandSecondary, borderColor: colors.borderInk },
          ]}
        >
          {item.owned ? (
            <Text style={s.cardBuyText}>{equipped ? '✓ Wearing' : 'Wear'}</Text>
          ) : (
            <>
              <Ionicons
                name={item.currency === 'gem' ? 'diamond' : 'ellipse'}
                size={11}
                color={colors.onSurface}
              />
              <Text style={s.cardBuyText}>{item.price}</Text>
            </>
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
  title: {
    fontFamily: typography.display, fontSize: 30, color: colors.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2, fontSize: 12, color: colors.onSurfaceTertiary, fontWeight: '600',
  },
  coinsPill: { position: 'relative' },
  coinsShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.pill, opacity: 0.4,
  },
  coinsFace: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    backgroundColor: colors.brandYellow,
    borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  coinsText: { fontFamily: typography.display, fontSize: 14, color: colors.onSurface },

  stage: { marginHorizontal: spacing.lg, position: 'relative' },
  stageShadow: {
    position: 'absolute', top: 6, left: 4, right: -4, bottom: -6,
    backgroundColor: colors.borderInk, borderRadius: radius.xl, opacity: 0.4,
  },
  stageFace: {
    height: 260,
    backgroundColor: 'rgba(255,251,240,0.82)',
    borderRadius: radius.xl,
    borderWidth: 2.5, borderColor: colors.borderInk,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  twinkle: {
    position: 'absolute', fontSize: 18, color: colors.brandDeepRose,
    fontFamily: typography.display,
  },
  stageChar: { width: '80%', height: '95%' },
  rotBtn: {
    position: 'absolute', top: '46%',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.borderInk,
  },
  namePlate: {
    position: 'absolute', top: 14,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  namePlateText: {
    fontFamily: typography.display, fontSize: 15, color: colors.onSurface,
  },

  catRow: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: spacing.lg, marginTop: spacing.md,
  },
  catBtn: { flex: 1, position: 'relative' },
  catShadow: {
    position: 'absolute', top: 4, left: 2, right: -2, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md,
  },
  catFace: {
    alignItems: 'center', paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  catEmoji: { fontSize: 18 },
  catLabel: {
    fontFamily: typography.display, fontSize: 11, color: colors.onSurfaceTertiary, marginTop: 2,
  },
  catLabelActive: { color: colors.onSurface },

  grid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  cardWrap: { width: '30.5%', position: 'relative' },
  cardShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md, opacity: 0.4,
  },
  cardFace: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderInk,
    padding: 6, alignItems: 'center',
  },
  cardThumb: {
    width: '100%', aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.borderInk,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  cardEmoji: { fontSize: 34 },
  ownedBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.brandSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  cardName: {
    fontFamily: typography.display, fontSize: 12, color: colors.onSurface,
    marginBottom: 4,
  },
  cardBuy: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  cardBuyText: {
    fontFamily: typography.display, fontSize: 11, color: colors.onSurface,
  },
  emptyText: {
    flex: 1, textAlign: 'center', color: colors.onSurfaceTertiary, fontSize: 13,
    marginTop: spacing.xxl, fontWeight: '600',
  },
});
