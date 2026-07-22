import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerButton } from '@/src/components/Sticker';
import { GACHA_BANNERS, ITEMS, RARITY } from '@/src/items';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';

export default function ShopScreen() {
  const [bi, setBi] = useState(0);
  const banner = GACHA_BANNERS[bi];
  // Showcase what's inside the banner (no purchase — pulling only).
  const pool = ITEMS.filter((i) => i.rarity !== 'common').slice(0, 6);

  return (
    <View style={s.root} testID="shop-screen">
      <ImageBackground source={scenes.shop} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.82)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Gacha</Text>
            <Text style={s.subtitle}>pull cute friends & goodies</Text>
          </View>
          <View style={s.hudRow}>
            <View style={s.hudPill}>
              <View style={s.hudShadow} />
              <View style={[s.hudFace, { backgroundColor: colors.brandYellow }]}>
                <Ionicons name="ellipse" size={12} color={colors.onSurface} />
                <Text style={s.hudText}>240</Text>
              </View>
            </View>
            <View style={s.hudPill}>
              <View style={s.hudShadow} />
              <View style={[s.hudFace, { backgroundColor: colors.brandTertiary }]}>
                <Ionicons name="diamond" size={12} color={colors.onSurface} />
                <Text style={s.hudText}>16</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
          {/* Flat, crafted banner (no gradient) */}
          <View style={s.bannerWrap} testID="shop-banner">
            <View style={s.bannerShadow} />
            <View style={[s.banner, { backgroundColor: banner.tint }]}>
              <View style={s.newBadge}>
                <Text style={s.newBadgeText}>NEW BANNER</Text>
              </View>

              <View style={s.bannerBody}>
                <View style={s.emojiDisc}>
                  <Text style={s.bannerEmoji}>{banner.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bannerTitle}>{banner.title}</Text>
                  <Text style={s.bannerSub}>{banner.subtitle}</Text>
                </View>
              </View>

              <View style={s.pullRow}>
                <View style={{ flex: 1 }}>
                  <StickerButton testID="shop-pull-1" label={`Pull 1 · ${banner.price1}`} icon="diamond" variant="ghost" small fullWidth />
                </View>
                <View style={{ flex: 1.15 }}>
                  <StickerButton testID="shop-pull-10" label={`Pull 10 · ${banner.price10}`} icon="sparkles" variant="primary" small fullWidth />
                </View>
              </View>
            </View>
          </View>

          <View style={s.dotsRow}>
            {GACHA_BANNERS.map((_, i) => (
              <Pressable key={i} onPress={() => setBi(i)} testID={`shop-banner-dot-${i}`} style={[s.dot, i === bi && s.dotActive]} />
            ))}
          </View>

          {/* What's inside — showcase pool with rarity frames */}
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>What's inside</Text>
            <Text style={s.sectionMeta}>featured drops ✿</Text>
          </View>
          <View style={s.grid}>
            {pool.map((it) => {
              const r = RARITY[it.rarity];
              return (
                <View key={it.id} style={s.itemWrap} testID={`shop-item-${it.id}`}>
                  <View style={s.itemShadow} />
                  <View style={s.itemFace}>
                    <View style={[s.itemRibbon, { backgroundColor: r.ring }]}>
                      <Text style={s.itemRibbonText}>{r.label}</Text>
                    </View>
                    <View style={[s.itemThumb, { backgroundColor: r.tint, borderColor: r.ring, borderWidth: r.border }]}>
                      <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
                    </View>
                    <Text style={s.itemName} numberOfLines={1}>{it.name}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Odds */}
          <View style={s.oddsWrap} testID="shop-odds">
            <View style={s.oddsShadow} />
            <View style={s.oddsFace}>
              <View style={s.oddsHead}>
                <Ionicons name="information-circle" size={16} color={colors.onSurface} />
                <Text style={s.oddsTitle}>Drop odds</Text>
                <Text style={s.oddsMeta}>always shown ✿</Text>
              </View>
              {banner.odds.map((o) => (
                <View key={o.rarity} style={s.oddsRow}>
                  <View style={[s.rarityDot, { backgroundColor: o.color }]} />
                  <Text style={s.oddsRarity}>{o.rarity}</Text>
                  <Text style={s.oddsChance}>{o.chance}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Earn */}
          <View style={s.earnWrap}>
            <View style={s.earnShadow} />
            <View style={[s.earnFace, { backgroundColor: colors.brandSecondary }]}>
              <View style={s.oddsHead}>
                <Ionicons name="cash-outline" size={16} color={colors.onSurface} />
                <Text style={s.oddsTitle}>Earn gems by chatting</Text>
              </View>
              <EarnRow icon="mic" label="Complete a speaking session" reward="+35" />
              <EarnRow icon="flame" label="Keep your streak alive" reward="+10/day" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function EarnRow({ icon, label, reward }: { icon: keyof typeof Ionicons.glyphMap; label: string; reward: string }) {
  return (
    <View style={s.earnRow}>
      <View style={s.earnIcon}>
        <Ionicons name={icon} size={14} color={colors.onSurface} />
      </View>
      <Text style={s.earnLabel}>{label}</Text>
      <View style={s.earnReward}>
        <Ionicons name="ellipse" size={10} color={colors.onSurface} />
        <Text style={s.earnRewardText}>{reward}</Text>
      </View>
    </View>
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
  hudRow: { flexDirection: 'row', gap: 6 },
  hudPill: { position: 'relative' },
  hudShadow: {
    position: 'absolute', top: 3, left: 2, right: -2, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.pill, opacity: 0.4,
  },
  hudFace: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  hudText: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface },

  bannerWrap: { marginHorizontal: spacing.lg, position: 'relative' },
  bannerShadow: {
    position: 'absolute', top: 6, left: 4, right: -4, bottom: -5,
    backgroundColor: colors.borderInk, borderRadius: radius.xl, opacity: 0.5,
  },
  banner: {
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 2.5, borderColor: colors.borderInk,
  },
  newBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderInk, marginBottom: spacing.md,
  },
  newBadgeText: { fontFamily: typography.display, fontSize: 10, color: colors.onSurface, letterSpacing: 1.2 },
  bannerBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emojiDisc: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,251,240,0.9)',
    borderWidth: 2.5, borderColor: colors.borderInk,
    alignItems: 'center', justifyContent: 'center',
  },
  bannerEmoji: { fontSize: 42 },
  bannerTitle: { fontFamily: typography.display, fontSize: 24, color: colors.onSurface },
  bannerSub: { fontSize: 12, color: colors.onSurface, opacity: 0.8, marginTop: 2, fontWeight: '600' },
  pullRow: { flexDirection: 'row', gap: 6, marginTop: spacing.lg },

  dotsRow: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginTop: spacing.md, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.borderStrong },
  dotActive: { width: 22, backgroundColor: colors.brandDeepRose, borderColor: colors.borderInk },

  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily: typography.display, fontSize: 18, color: colors.onSurface },
  sectionMeta: { fontSize: 11, color: colors.onSurfaceTertiary, fontWeight: '600' },
  grid: { paddingHorizontal: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  itemWrap: { width: '31.5%', position: 'relative' },
  itemShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md, opacity: 0.4,
  },
  itemFace: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderInk, padding: 6, alignItems: 'center', overflow: 'hidden',
  },
  itemRibbon: {
    alignSelf: 'stretch', marginTop: -6, marginHorizontal: -6, marginBottom: 6,
    paddingVertical: 2, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.borderInk,
  },
  itemRibbonText: { fontFamily: typography.display, fontSize: 9, color: colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
  itemThumb: {
    width: '100%', aspectRatio: 1, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  itemName: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface, marginBottom: 2 },

  oddsWrap: { marginHorizontal: spacing.lg, marginTop: spacing.lg, position: 'relative' },
  oddsShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -4,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.4,
  },
  oddsFace: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk, padding: spacing.md,
  },
  oddsHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  oddsTitle: { fontFamily: typography.display, fontSize: 14, color: colors.onSurface },
  oddsMeta: { flex: 1, textAlign: 'right', fontSize: 10, color: colors.onSurfaceTertiary, fontWeight: '600' },
  oddsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 5,
    borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed',
  },
  rarityDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderInk },
  oddsRarity: { flex: 1, fontFamily: typography.display, fontSize: 13, color: colors.onSurface },
  oddsChance: { fontFamily: typography.display, fontSize: 13, color: colors.onSurface, fontVariant: ['tabular-nums'] },

  earnWrap: { marginHorizontal: spacing.lg, marginTop: spacing.lg, position: 'relative' },
  earnShadow: {
    position: 'absolute', top: 5, left: 3, right: -3, bottom: -4,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.4,
  },
  earnFace: {
    backgroundColor: colors.brandSecondary, borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk, padding: spacing.md,
  },
  earnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed',
  },
  earnIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.borderInk,
  },
  earnLabel: { flex: 1, fontSize: 12, color: colors.onSurface, fontWeight: '600' },
  earnReward: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
    backgroundColor: colors.brandYellow, borderWidth: 1.5, borderColor: colors.borderInk,
  },
  earnRewardText: { fontFamily: typography.display, fontSize: 11, color: colors.onSurface },
});
