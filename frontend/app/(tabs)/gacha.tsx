import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerButton } from '@/src/components/Sticker';
import { CHARACTERS } from '@/src/data';
import { GACHA_BANNERS, ITEMS, Rarity, RARITY } from '@/src/items';
import { useInventory } from '@/src/store/inventory';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';

type PullResult = {
  kind: 'character' | 'item';
  id: string;
  name: string;
  emoji?: string;
  image?: any;
  rarity: Rarity;
  isNew: boolean;
};

function rollRarity(odds: { rarity: string; chance: string }[]): Rarity {
  const weights = odds.map((o) => ({ r: o.rarity.toLowerCase() as Rarity, w: parseFloat(o.chance) }));
  const total = weights.reduce((a, b) => a + b.w, 0);
  let x = Math.random() * total;
  for (const it of weights) {
    if (x < it.w) return it.r;
    x -= it.w;
  }
  return 'common';
}

export default function ShopScreen() {
  const [bi, setBi] = useState(0);
  const banner = GACHA_BANNERS[bi];
  const inv = useInventory();
  const pool = ITEMS.filter((i) => i.rarity !== 'common').slice(0, 6);

  const [reveal, setReveal] = useState<PullResult[] | null>(null);
  const [noGems, setNoGems] = useState(false);

  const doPull = (count: number) => {
    const cost = count === 1 ? banner.price1 : banner.price10;
    if (inv.gems < cost) {
      setNoGems(true);
      return;
    }
    inv.spendGems(cost);

    // local mirrors so a multi-pull doesn't hand out the same "new" twice
    const localChars = new Set(inv.ownedChars);
    const localItems = new Set(inv.ownedItems);

    const results: PullResult[] = [];
    for (let n = 0; n < count; n++) {
      const rarity = rollRarity(banner.odds);
      const unownedChars = CHARACTERS.filter((c) => !localChars.has(c.id));
      const wantChar = (rarity === 'legendary' || rarity === 'epic') && unownedChars.length > 0;

      if (wantChar) {
        const match = unownedChars.find((c) => c.rarity === rarity) || unownedChars[0];
        localChars.add(match.id);
        results.push({ kind: 'character', id: match.id, name: match.name, image: match.image, rarity: match.rarity, isNew: true });
      } else {
        const sameRarity = ITEMS.filter((i) => i.rarity === rarity);
        const src = sameRarity.length ? sameRarity : ITEMS.filter((i) => i.rarity === 'common');
        // prefer clothes / backgrounds
        const preferred = src.filter((i) => i.category === 'outfit' || i.category === 'room');
        const chooseFrom = preferred.length ? preferred : src;
        const item = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
        const isNew = !localItems.has(item.id);
        if (isNew) localItems.add(item.id);
        results.push({ kind: 'item', id: item.id, name: item.name, emoji: item.emoji, rarity: item.rarity, isNew });
      }
    }

    const newChars = results.filter((r) => r.kind === 'character' && r.isNew).map((r) => r.id);
    const newItems = results.filter((r) => r.kind === 'item' && r.isNew).map((r) => r.id);
    const dupes = results.filter((r) => !r.isNew).length;
    if (newChars.length) inv.addChars(newChars);
    if (newItems.length) inv.addItems(newItems);
    if (dupes) inv.addCoins(dupes * 50);

    setReveal(results);
  };

  return (
    <View style={s.root} testID="shop-screen">
      <ImageBackground source={scenes.shop} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.82)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Gacha</Text>
            <Text style={s.subtitle}>pull to meet new friends</Text>
          </View>
          <View style={s.hudRow}>
            <View style={s.hudPill}>
              <View style={s.hudShadow} />
              <View style={[s.hudFace, { backgroundColor: colors.brandYellow }]}>
                <Ionicons name="ellipse" size={12} color={colors.onSurface} />
                <Text style={s.hudText} testID="gacha-coins">{inv.coins}</Text>
              </View>
            </View>
            <View style={s.hudPill}>
              <View style={s.hudShadow} />
              <View style={[s.hudFace, { backgroundColor: colors.brandTertiary }]}>
                <Ionicons name="diamond" size={12} color={colors.onSurface} />
                <Text style={s.hudText} testID="gacha-gems">{inv.gems}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
          {/* Flat, crafted banner */}
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
                  <StickerButton testID="shop-pull-1" label={`Pull 1 · ${banner.price1}`} icon="diamond" variant="ghost" small fullWidth onPress={() => doPull(1)} />
                </View>
                <View style={{ flex: 1.15 }}>
                  <StickerButton testID="shop-pull-10" label={`Pull 10 · ${banner.price10}`} icon="sparkles" variant="primary" small fullWidth onPress={() => doPull(10)} />
                </View>
              </View>
            </View>
          </View>

          <View style={s.dotsRow}>
            {GACHA_BANNERS.map((_, i) => (
              <Pressable key={i} onPress={() => setBi(i)} testID={`shop-banner-dot-${i}`} style={[s.dot, i === bi && s.dotActive]} />
            ))}
          </View>

          {/* What's inside */}
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
                <Text style={s.oddsMeta}>epic+ can be a new friend ✿</Text>
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

      {/* Reveal modal */}
      <Modal transparent animationType="fade" visible={!!reveal} onRequestClose={() => setReveal(null)}>
        <View style={s.revealBackdrop}>
          <Text style={s.revealTitle}>✦ your pulls ✦</Text>
          <ScrollView contentContainerStyle={s.revealGrid} showsVerticalScrollIndicator={false}>
            {reveal?.map((r, i) => (
              <RevealCard key={i} result={r} index={i} single={reveal.length === 1} />
            ))}
          </ScrollView>
          <View style={s.revealBtn}>
            <StickerButton testID="reveal-collect" label="Collect ✿" variant="primary" fullWidth onPress={() => setReveal(null)} />
          </View>
        </View>
      </Modal>

      {/* Not enough gems */}
      <Modal transparent animationType="fade" visible={noGems} onRequestClose={() => setNoGems(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setNoGems(false)}>
          <Pressable style={s.modalWrap} onPress={() => {}}>
            <View style={s.modalShadow} />
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Not enough gems 💎</Text>
              <Text style={s.modalBody}>Earn gems by finishing speaking sessions and keeping your streak, then come back to pull!</Text>
              <View style={{ marginTop: spacing.lg }}>
                <StickerButton testID="nogems-ok" label="Okay" variant="primary" small fullWidth onPress={() => setNoGems(false)} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function RevealCard({ result, index, single }: { result: PullResult; index: number; single: boolean }) {
  const r = RARITY[result.rarity];
  const scale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 110),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 90 }),
    ]).start();
    if (result.rarity === 'epic' || result.rarity === 'legendary') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ]),
      ).start();
    }
  }, [index, scale, glow, result.rarity]);

  const shadowColor = glow.interpolate({ inputRange: [0, 1], outputRange: [r.ring, colors.brandDeepRose] });

  return (
    <Animated.View
      testID={`reveal-card-${result.id}`}
      style={[
        single ? rv.single : rv.cell,
        { transform: [{ scale }] },
      ]}
    >
      <Animated.View
        style={[
          rv.card,
          { backgroundColor: r.tint, borderColor: r.ring, borderWidth: r.border + 1, shadowColor, shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
        ]}
      >
        <View style={[rv.ribbon, { backgroundColor: r.ring }]}>
          <Text style={rv.ribbonText}>{r.label}</Text>
        </View>
        <View style={rv.art}>
          {result.kind === 'character' ? (
            <Image source={result.image} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          ) : (
            <Text style={{ fontSize: single ? 64 : 40 }}>{result.emoji}</Text>
          )}
        </View>
        <Text style={rv.name} numberOfLines={1}>{result.name}</Text>
        <View style={[rv.tag, { backgroundColor: result.isNew ? colors.brandSecondary : colors.surfaceTertiary }]}>
          <Text style={rv.tagText}>
            {result.kind === 'character' ? 'NEW FRIEND ✦' : result.isNew ? 'NEW ✿' : '+50 coins'}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
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

const rv = StyleSheet.create({
  single: { width: '64%', marginBottom: spacing.md },
  cell: { width: '30%', marginBottom: spacing.md },
  card: {
    borderRadius: radius.lg, padding: 8, alignItems: 'center', overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  ribbon: {
    alignSelf: 'stretch', marginTop: -8, marginHorizontal: -8, marginBottom: 8,
    paddingVertical: 3, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.borderInk,
  },
  ribbonText: { fontFamily: typography.display, fontSize: 9, color: colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
  art: {
    width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,251,240,0.5)', borderRadius: radius.sm, marginBottom: 6,
  },
  name: { fontFamily: typography.display, fontSize: 13, color: colors.onSurface, marginBottom: 4 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  tagText: { fontFamily: typography.display, fontSize: 9, color: colors.onSurface, letterSpacing: 0.5 },
});

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
  banner: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 2.5, borderColor: colors.borderInk },
  newBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderInk, marginBottom: spacing.md,
  },
  newBadgeText: { fontFamily: typography.display, fontSize: 10, color: colors.onSurface, letterSpacing: 1.2 },
  bannerBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emojiDisc: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,251,240,0.9)',
    borderWidth: 2.5, borderColor: colors.borderInk, alignItems: 'center', justifyContent: 'center',
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

  // reveal
  revealBackdrop: {
    flex: 1, backgroundColor: 'rgba(74,50,25,0.75)',
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  revealTitle: {
    fontFamily: typography.display, fontSize: 22, color: colors.onSurfaceInverse,
    textAlign: 'center', letterSpacing: 1, marginBottom: spacing.lg,
  },
  revealGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  revealBtn: { marginTop: spacing.md },

  modalBackdrop: {
    flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalWrap: { width: '100%', position: 'relative' },
  modalShadow: {
    position: 'absolute', top: 6, left: 4, right: -4, bottom: -4,
    backgroundColor: colors.borderInk, borderRadius: radius.xl, opacity: 0.5,
  },
  modalCard: {
    backgroundColor: colors.surfaceSecondary, padding: spacing.xl, borderRadius: radius.xl,
    borderWidth: 2.5, borderColor: colors.borderInk,
  },
  modalTitle: { fontFamily: typography.display, fontSize: 20, color: colors.onSurface },
  modalBody: { marginTop: spacing.sm, fontSize: 14, color: colors.onSurfaceTertiary, lineHeight: 20, fontWeight: '500' },
});
