import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS, Character } from '@/src/data';
import { DashedRule, Doodles, StickerButton } from '@/src/components/Sticker';
import { useInventory } from '@/src/store/inventory';
import { colors, radius, scenes, shadow, spacing, typography } from '@/src/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.78;
const CARD_H = 430;
const CARD_SPACING = spacing.md;

export default function HomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const inv = useInventory();
  const active = CHARACTERS[activeIndex];
  const activeLocked = !inv.hasChar(active.id);

  return (
    <View style={styles.root} testID="home-screen">
      {/* Subtle bedroom illustration in background, softened */}
      <ImageBackground
        source={scenes.bedroom}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={0}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.85)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header row */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hi}>hi ana ✿</Text>
            <Text style={styles.sub}>who do you want to chat with?</Text>
          </View>
          <View style={styles.pills}>
            <StatPill icon="flame" value="7" tint={colors.warning} testID="home-streak" />
            <StatPill icon="diamond" value={String(inv.gems)} tint={colors.brandTertiary} testID="home-gems" />
            <StatPill icon="ellipse" value={String(inv.coins)} tint={colors.brandYellow} testID="home-coins" />
          </View>
        </View>

        {/* Carousel */}
        <FlatList
          testID="character-carousel"
          data={CHARACTERS}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <CharacterCard character={item} isActive={index === activeIndex} locked={!inv.hasChar(item.id)} />
          )}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {CHARACTERS.map((c, i) => (
            <View key={c.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Active vibe + CTAs — one big sticker card */}
        <View style={styles.actionsCard} testID="home-actions">
          <View style={styles.actionsShadow} />
          <View style={styles.actionsFace}>
            <View style={styles.vibeHead}>
              <Text style={styles.vibeName}>{active.name}</Text>
              <View style={styles.vibeMeta}>
                <Text style={styles.vibeMetaText}>{active.languageEmoji} {active.language}</Text>
                <View style={styles.vibeDot} />
                <Text style={styles.vibeMetaText}>Level {active.level}</Text>
              </View>
            </View>
            <DashedRule />
            <Text style={styles.vibeText}>{active.vibe}</Text>

            <View style={styles.ctaRow}>
              <View style={{ flex: 1 }}>
                {activeLocked ? (
                  <StickerButton
                    testID="home-cta-unlock"
                    label="Pull to Unlock"
                    icon="lock-closed"
                    variant="secondary"
                    small
                    fullWidth
                    onPress={() => router.push('/gacha')}
                  />
                ) : (
                  <StickerButton
                    testID="home-cta-speak"
                    label="Speak Now"
                    icon="mic"
                    variant="primary"
                    small
                    fullWidth
                    onPress={() => router.push(`/session/speaking?id=${active.id}`)}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatPill({
  icon, value, tint, testID,
}: { icon: keyof typeof Ionicons.glyphMap; value: string; tint: string; testID?: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: tint }]} testID={testID}>
      <Ionicons name={icon} size={13} color={colors.onSurface} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function CharacterCard({ character, isActive, locked }: { character: Character; isActive: boolean; locked?: boolean }) {
  return (
    <View
      style={[
        styles.cardWrap,
        !isActive && { transform: [{ scale: 0.94 }], opacity: 0.7 },
      ]}
      testID={`character-card-${character.id}`}
    >
      <View style={styles.cardShadow} />
      <View style={[styles.card, { backgroundColor: character.accent + '55' }]}>
        {/* Illustrated soft frame */}
        <View style={styles.cardImageWrap}>
          <Image source={character.image} style={styles.cardImage} contentFit="contain" />
          {/* twinkles */}
          <Text style={[styles.twinkle, { top: 12, left: 14 }]}>✦</Text>
          <Text style={[styles.twinkle, { top: 30, right: 18 }]}>✧</Text>
          <Text style={[styles.twinkle, { bottom: 30, left: 20 }]}>♡</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardBadgeRow}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{character.languageEmoji} {character.language}</Text>
            </View>
            <View style={[styles.cardBadge, { backgroundColor: character.accent }]}>
              <Text style={styles.cardBadgeText}>{character.level}</Text>
            </View>
          </View>
          <Text style={styles.cardName}>{character.name}</Text>
          <Text style={styles.cardTag}>✿ {character.tagline}</Text>
        </View>
        {locked && (
          <View style={styles.lockOverlay} testID={`character-locked-${character.id}`}>
            <View style={styles.lockPill}>
              <Ionicons name="lock-closed" size={22} color={colors.onSurfaceInverse} />
            </View>
            <Text style={styles.lockText}>Pull to unlock</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  hi: {
    fontFamily: typography.display, fontSize: 26, color: colors.onSurface,
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: 2, fontSize: typography.size.sm, color: colors.onSurfaceTertiary,
    fontWeight: '600',
  },
  pills: { flexDirection: 'row', gap: spacing.sm },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  statValue: {
    fontFamily: typography.display, fontSize: 14, color: colors.onSurface,
  },

  carouselContent: {
    paddingHorizontal: (SCREEN_W - CARD_W) / 2,
    gap: CARD_SPACING,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  cardWrap: { width: CARD_W, height: CARD_H, position: 'relative' },
  cardShadow: {
    position: 'absolute', top: 8, left: 4, right: -4, bottom: -6,
    backgroundColor: colors.borderStrong, borderRadius: radius.xl, opacity: 0.5,
  },
  card: {
    flex: 1, borderRadius: radius.xl,
    borderWidth: 2.5, borderColor: colors.borderInk,
    padding: 10,
    overflow: 'hidden',
  },
  cardImageWrap: {
    flex: 1,
    backgroundColor: 'rgba(255,251,240,0.7)',
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardImage: { width: '100%', height: '100%' },
  twinkle: {
    position: 'absolute', fontFamily: typography.display, fontSize: 18,
    color: colors.brandDeepRose,
  },
  cardFooter: { paddingHorizontal: 4, paddingBottom: 4 },
  cardBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  cardBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderInk,
  },
  cardBadgeText: {
    fontFamily: typography.display, fontSize: 11, color: colors.onSurface,
  },
  cardName: {
    fontFamily: typography.display, fontSize: 24, color: colors.onSurface,
    marginTop: 4, letterSpacing: -0.3,
  },
  cardTag: { fontSize: 13, color: colors.onSurfaceTertiary, fontWeight: '600' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,50,25,0.55)',
    borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  lockPill: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.surfaceInverse,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.onSurfaceInverse,
  },
  lockText: {
    fontFamily: typography.display, fontSize: 15, color: colors.onSurfaceInverse,
    letterSpacing: 0.5,
  },

  dots: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border,
    borderWidth: 1, borderColor: colors.borderStrong,
  },
  dotActive: { width: 22, backgroundColor: colors.brandDeepRose, borderColor: colors.borderInk },

  actionsCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  actionsShadow: {
    position: 'absolute', top: 5, left: 4, right: -4, bottom: -4,
    backgroundColor: colors.borderStrong, borderRadius: radius.lg, opacity: 0.5,
  },
  actionsFace: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk,
    padding: spacing.md,
  },
  vibeHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  vibeName: {
    fontFamily: typography.display, fontSize: 20, color: colors.onSurface,
  },
  vibeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vibeMetaText: { fontSize: 11, color: colors.onSurfaceTertiary, fontWeight: '600' },
  vibeDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.onSurfaceTertiary },
  vibeText: {
    fontSize: 13, color: colors.onSurface, lineHeight: 18, fontWeight: '500',
  },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
