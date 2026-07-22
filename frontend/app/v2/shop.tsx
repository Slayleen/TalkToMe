import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { V2_ITEMS, V2_STATE, v2Colors, v2Radius, v2Spacing } from '@/src/v2/theme';

const BANNERS = [
  {
    id: 'starter',
    title: 'Teahouse Debut',
    subtitle: 'cozy first pull',
    tint: v2Colors.pink,
    accent: v2Colors.pinkDeep,
    price10: 30,
    price1: 4,
    emoji: '🍵',
    odds: [
      { rarity: 'Common',  chance: '78%', color: v2Colors.mint },
      { rarity: 'Rare',    chance: '18%', color: v2Colors.sky },
      { rarity: 'Epic',    chance: '3.5%', color: v2Colors.pink },
      { rarity: 'Legendary', chance: '0.5%', color: v2Colors.yellow },
    ],
  },
  {
    id: 'meadow',
    title: 'Meadow Picnic',
    subtitle: 'limited · 4d 12h',
    tint: v2Colors.mint,
    accent: v2Colors.mintDeep,
    price10: 40,
    price1: 5,
    emoji: '🌸',
    odds: [
      { rarity: 'Common',  chance: '75%', color: v2Colors.mint },
      { rarity: 'Rare',    chance: '20%', color: v2Colors.sky },
      { rarity: 'Epic',    chance: '4%', color: v2Colors.pink },
      { rarity: 'Legendary', chance: '1%', color: v2Colors.yellow },
    ],
  },
];

export default function V2Shop() {
  const router = useRouter();
  const [bannerIdx, setBannerIdx] = useState(0);
  const banner = BANNERS[bannerIdx];
  const featured = V2_ITEMS.slice(0, 6);

  return (
    <View style={s.root} testID="v2-shop">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={s.header}>
          <Pressable testID="v2-shop-back" onPress={() => router.back()} style={s.iconBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={v2Colors.ink} />
          </Pressable>
          <Text style={s.title}>Shop</Text>
          <View style={s.hudRow}>
            <View style={[s.pill, { backgroundColor: v2Colors.yellow }]}>
              <Ionicons name="ellipse" size={11} color={v2Colors.ink} />
              <Text style={s.pillText}>{V2_STATE.coins}</Text>
            </View>
            <View style={[s.pill, { backgroundColor: v2Colors.sky }]}>
              <Ionicons name="diamond" size={11} color={v2Colors.ink} />
              <Text style={s.pillText}>{V2_STATE.gems}</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: v2Spacing.xxl }}>
          {/* Banner carousel */}
          <View style={s.bannerWrap} testID="v2-banner">
            <LinearGradient
              colors={[banner.tint, banner.accent]}
              style={s.banner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              {/* twinkles */}
              {['✦', '✧', '⋆'].map((t, i) => (
                <Text
                  key={i}
                  style={[s.twinkle, { top: 20 + i * 30, right: 20 + i * 40 }]}
                >{t}</Text>
              ))}
              <Text style={s.bannerEmoji}>{banner.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.bannerBadge}>NEW</Text>
                <Text style={s.bannerTitle}>{banner.title}</Text>
                <Text style={s.bannerSub}>{banner.subtitle}</Text>
                <View style={s.pullRow}>
                  <Pressable
                    testID="v2-pull-1"
                    style={[s.pullBtn, { backgroundColor: v2Colors.paper }]}
                  >
                    <Ionicons name="diamond" size={13} color={v2Colors.ink} />
                    <Text style={s.pullBtnText}>Pull 1 · {banner.price1}</Text>
                  </Pressable>
                  <Pressable
                    testID="v2-pull-10"
                    style={[s.pullBtn, { backgroundColor: v2Colors.ink }]}
                  >
                    <Ionicons name="sparkles" size={13} color={v2Colors.paper} />
                    <Text style={[s.pullBtnText, { color: v2Colors.paper }]}>Pull 10 · {banner.price10}</Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>

            <View style={s.bannerDots}>
              {BANNERS.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setBannerIdx(i)}
                  style={[s.dot, i === bannerIdx && s.dotActive]}
                />
              ))}
            </View>
          </View>

          {/* Odds panel */}
          <View style={s.oddsCard} testID="v2-odds">
            <View style={s.oddsHead}>
              <Ionicons name="information-circle-outline" size={16} color={v2Colors.ink} />
              <Text style={s.oddsTitle}>Drop odds</Text>
              <Text style={s.oddsSub}>every pull, always shown</Text>
            </View>
            {banner.odds.map((o) => (
              <View key={o.rarity} style={s.oddsRow}>
                <View style={[s.rarityDot, { backgroundColor: o.color }]} />
                <Text style={s.oddsRarity}>{o.rarity}</Text>
                <Text style={s.oddsChance}>{o.chance}</Text>
              </View>
            ))}
          </View>

          {/* Direct-buy strip */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Or buy directly</Text>
              <Text style={s.sectionHint}>no random · guaranteed</Text>
            </View>
            <View style={s.directGrid}>
              {featured.map((it) => (
                <View key={it.id} style={s.directCard} testID={`v2-direct-${it.id}`}>
                  <View style={[s.directThumb, { backgroundColor: it.color }]}>
                    <Text style={{ fontSize: 30 }}>{it.emoji}</Text>
                  </View>
                  <Text style={s.directName} numberOfLines={1}>{it.name}</Text>
                  <View style={s.directBuy}>
                    <Ionicons
                      name={it.currency === 'gem' ? 'diamond' : 'ellipse'}
                      size={10}
                      color={v2Colors.ink}
                    />
                    <Text style={s.directBuyText}>{it.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Earn currency */}
          <View style={[s.oddsCard, { backgroundColor: v2Colors.mint }]}>
            <View style={s.oddsHead}>
              <Ionicons name="cash-outline" size={16} color={v2Colors.ink} />
              <Text style={s.oddsTitle}>Earn coins</Text>
            </View>
            <EarnRow icon="mic" label="Complete a speaking session" reward="+35" />
            <EarnRow icon="flame" label="Keep your streak alive" reward="+10/day" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function EarnRow({ icon, label, reward }: any) {
  return (
    <View style={s.earnRow}>
      <View style={s.earnIcon}>
        <Ionicons name={icon} size={14} color={v2Colors.ink} />
      </View>
      <Text style={s.earnLabel}>{label}</Text>
      <View style={s.earnReward}>
        <Ionicons name="ellipse" size={10} color={v2Colors.ink} />
        <Text style={s.earnRewardText}>{reward}</Text>
      </View>
    </View>
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
  hudRow: { flexDirection: 'row', gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: v2Radius.pill,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  pillText: { fontSize: 12, fontWeight: '800', color: v2Colors.ink },

  bannerWrap: { paddingHorizontal: v2Spacing.lg },
  banner: {
    borderRadius: v2Radius.xl, padding: v2Spacing.lg,
    borderWidth: 3, borderColor: v2Colors.ink,
    flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md,
    minHeight: 170, overflow: 'hidden',
  },
  twinkle: { position: 'absolute', fontSize: 18, color: v2Colors.paper, fontWeight: '800' },
  bannerEmoji: { fontSize: 68 },
  bannerBadge: {
    alignSelf: 'flex-start', fontSize: 10, fontWeight: '800',
    color: v2Colors.ink,
    backgroundColor: v2Colors.paper,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: v2Radius.pill,
    borderWidth: 1.5, borderColor: v2Colors.ink,
    letterSpacing: 1,
  },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: v2Colors.ink, marginTop: 6 },
  bannerSub: { fontSize: 12, color: v2Colors.ink, opacity: 0.75, marginTop: 2, fontWeight: '600' },
  pullRow: { flexDirection: 'row', gap: 6, marginTop: v2Spacing.md },
  pullBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: v2Radius.pill,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  pullBtnText: { fontSize: 12, fontWeight: '800', color: v2Colors.ink },

  bannerDots: {
    flexDirection: 'row', gap: 6,
    alignSelf: 'center', marginTop: v2Spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: v2Colors.creamDeep, borderWidth: 1, borderColor: v2Colors.border },
  dotActive: { width: 22, backgroundColor: v2Colors.ink, borderColor: v2Colors.ink },

  oddsCard: {
    marginHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
    backgroundColor: v2Colors.paper,
    borderRadius: v2Radius.lg,
    borderWidth: 2, borderColor: v2Colors.ink,
    padding: v2Spacing.md,
  },
  oddsHead: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: v2Spacing.sm,
  },
  oddsTitle: { fontSize: 14, fontWeight: '800', color: v2Colors.ink },
  oddsSub: { flex: 1, textAlign: 'right', fontSize: 10, color: v2Colors.inkSoft },
  oddsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 5, borderTopWidth: 1, borderTopColor: v2Colors.border,
  },
  rarityDot: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  oddsRarity: { flex: 1, fontSize: 12, fontWeight: '600', color: v2Colors.ink },
  oddsChance: { fontSize: 12, fontWeight: '800', color: v2Colors.ink, fontVariant: ['tabular-nums'] },

  section: { marginTop: v2Spacing.md },
  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: v2Spacing.lg, marginBottom: v2Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: v2Colors.ink },
  sectionHint: { fontSize: 10, color: v2Colors.inkSoft, fontWeight: '600' },
  directGrid: {
    paddingHorizontal: v2Spacing.lg,
    flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm,
  },
  directCard: {
    width: '31.5%', backgroundColor: v2Colors.paper,
    borderRadius: v2Radius.md,
    borderWidth: 2, borderColor: v2Colors.ink,
    padding: 6, alignItems: 'center',
  },
  directThumb: {
    width: '100%', aspectRatio: 1,
    borderRadius: v2Radius.sm,
    borderWidth: 1.5, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  directName: { fontSize: 11, fontWeight: '700', color: v2Colors.ink, marginBottom: 3 },
  directBuy: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: v2Radius.pill,
    backgroundColor: v2Colors.creamDeep,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  directBuyText: { fontSize: 11, fontWeight: '800', color: v2Colors.ink },

  earnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: v2Colors.border,
  },
  earnIcon: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  earnLabel: { flex: 1, fontSize: 12, color: v2Colors.ink, fontWeight: '600' },
  earnReward: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: v2Radius.pill,
    backgroundColor: v2Colors.yellow,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  earnRewardText: { fontSize: 11, fontWeight: '800', color: v2Colors.ink },
});
