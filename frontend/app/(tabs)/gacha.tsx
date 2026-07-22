import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerButton } from '@/src/components/Sticker';
import { GACHA_BANNERS, ITEMS } from '@/src/items';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';

export default function ShopScreen() {
  const [bi, setBi] = useState(0);
  const banner = GACHA_BANNERS[bi];
  const featured = ITEMS.filter((i) => !i.owned).slice(0, 6);

  return (
    <View style={s.root} testID="shop-screen">
      <ImageBackground source={scenes.shop} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.78)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Shop</Text>
            <Text style={s.subtitle}>pull cute friends & goodies ✿</Text>
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
          {/* Gacha banner */}
          <View style={s.bannerWrap} testID="shop-banner">
            <View style={s.bannerShadow} />
            <LinearGradient
              colors={[banner.tint, colors.brandYellow]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.banner}
            >
              {['✦', '✧', '⋆'].map((t, i) => (
                <Text key={i} style={[s.twinkle, { top: 18 + i * 26, right: 18 + i * 30 }]}>{t}</Text>
              ))}
              <Text style={s.bannerEmoji}>{banner.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={s.newBadge}>
                  <Text style={s.newBadgeText}>NEW</Text>
                </View>
                <Text style={s.bannerTitle}>{banner.title}</Text>
                <Text style={s.bannerSub}>{banner.subtitle}</Text>
                <View style={s.pullRow}>
                  <View style={{ flex: 1 }}>
                    <StickerButton
                      testID="shop-pull-1"
                      label={`Pull 1 · ${banner.price1}`}
                      icon="diamond"
                      variant="ghost"
                      small fullWidth
                    />
                  </View>
                  <View style={{ flex: 1.15 }}>
                    <StickerButton
                      testID="shop-pull-10"
                      label={`Pull 10 · ${banner.price10}`}
                      icon="sparkles"
                      variant="primary"
                      small fullWidth
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={s.dotsRow}>
            {GACHA_BANNERS.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => setBi(i)}
                testID={`shop-banner-dot-${i}`}
                style={[s.dot, i === bi && s.dotActive]}
              />
            ))}
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

          {/* Direct-buy */}
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Or buy directly</Text>
            <Text style={s.sectionMeta}>no random · guaranteed</Text>
          </View>
          <View style={s.grid}>
            {featured.map((it) => (
              <View key={it.id} style={s.itemWrap} testID={`shop-item-${it.id}`}>
                <View style={s.itemShadow} />
                <View style={s.itemFace}>
                  <View style={[s.itemThumb, { backgroundColor: it.color }]}>
                    <Text style={{ fontSize: 30 }}>{it.emoji}</Text>
                  </View>
                  <Text style={s.itemName} numberOfLines={1}>{it.name}</Text>
                  <View style={s.itemPrice}>
                    <Ionicons
                      name={it.currency === 'gem' ? 'diamond' : 'ellipse'}
                      size={11}
                      color={colors.onSurface}
                    />
                    <Text style={s.itemPriceText}>{it.price}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Earn */}
          <View style={s.earnWrap}>
            <View style={s.earnShadow} />
            <View style={[s.earnFace, { backgroundColor: colors.brandSecondary }]}>
              <View style={s.oddsHead}>
                <Ionicons name="cash-outline" size={16} color={colors.onSurface} />
                <Text style={s.oddsTitle}>Earn coins by chatting</Text>
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

function EarnRow({
  icon, label, reward,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; reward: string }) {
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
  title: {
    fontFamily: typography.display, fontSize: 30, color: colors.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2, fontSize: 12, color: colors.onSurfaceTertiary, fontWeight: '600',
  },
  hudRow: { flexDirection: 'row', gap: 6 },
  hudPill: { position: 'relative' },
  hudShadow: {
    position: 'absolute', top: 3, left: 2, right: -2, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.pill, opacity: 0.4,
  },
  hudFace: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  hudText: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface },

  bannerWrap: { marginHorizontal: spacing.lg, position: 'relative' },
  bannerShadow: {
    position: 'absolute', top: 6, left: 4, right: -4, bottom: -5,
    backgroundColor: colors.borderInk, borderRadius: radius.xl, opacity: 0.5,
  },
  banner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 2.5, borderColor: colors.borderInk,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    minHeight: 180, overflow: 'hidden',
  },
  twinkle: {
    position: 'absolute', fontFamily: typography.display, fontSize: 18,
    color: colors.surfaceSecondary,
  },
  bannerEmoji: { fontSize: 68 },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderInk,
    marginBottom: 4,
  },
  newBadgeText: {
    fontFamily: typography.display, fontSize: 10, color: colors.onSurface, letterSpacing: 1.2,
  },
  bannerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.onSurface, marginTop: 2 },
  bannerSub: {
    fontSize: 12, color: colors.onSurface, opacity: 0.75, marginTop: 2, fontWeight: '600',
  },
  pullRow: { flexDirection: 'row', gap: 6, marginTop: spacing.md },

  dotsRow: {
    flexDirection: 'row', gap: 6, alignSelf: 'center',
    marginTop: spacing.md, marginBottom: spacing.xs,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.border,
    borderWidth: 1, borderColor: colors.borderStrong,
  },
  dotActive: { width: 22, backgroundColor: colors.brandDeepRose, borderColor: colors.borderInk },

  oddsWrap: { marginHorizontal: spacing.lg, marginTop: spacing.md, position: 'relative' },
  oddsShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -4,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.4,
  },
  oddsFace: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk,
    padding: spacing.md,
  },
  oddsHead: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm,
  },
  oddsTitle: { fontFamily: typography.display, fontSize: 14, color: colors.onSurface },
  oddsMeta: { flex: 1, textAlign: 'right', fontSize: 10, color: colors.onSurfaceTertiary, fontWeight: '600' },
  oddsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 5, borderTopWidth: 1, borderTopColor: colors.divider,
    borderStyle: 'dashed',
  },
  rarityDot: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  oddsRarity: {
    flex: 1, fontFamily: typography.display, fontSize: 13, color: colors.onSurface,
  },
  oddsChance: {
    fontFamily: typography.display, fontSize: 13, color: colors.onSurface,
    fontVariant: ['tabular-nums'],
  },

  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily: typography.display, fontSize: 18, color: colors.onSurface },
  sectionMeta: { fontSize: 11, color: colors.onSurfaceTertiary, fontWeight: '600' },
  grid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  itemWrap: { width: '31.5%', position: 'relative' },
  itemShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.md, opacity: 0.4,
  },
  itemFace: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderInk,
    padding: 6, alignItems: 'center',
  },
  itemThumb: {
    width: '100%', aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.borderInk,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  itemName: { fontFamily: typography.display, fontSize: 12, color: colors.onSurface, marginBottom: 3 },
  itemPrice: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  itemPriceText: { fontFamily: typography.display, fontSize: 11, color: colors.onSurface },

  earnWrap: { marginHorizontal: spacing.lg, marginTop: spacing.lg, position: 'relative' },
  earnShadow: {
    position: 'absolute', top: 5, left: 3, right: -3, bottom: -4,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.4,
  },
  earnFace: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk,
    padding: spacing.md,
  },
  earnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed',
  },
  earnIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  earnLabel: { flex: 1, fontSize: 12, color: colors.onSurface, fontWeight: '600' },
  earnReward: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
    backgroundColor: colors.brandYellow,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  earnRewardText: { fontFamily: typography.display, fontSize: 11, color: colors.onSurface },
});
