import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { colors, radius, scenes, shadow, spacing, typography } from '@/src/theme';

const GLOW = [
  'Used past tense correctly ("Fui a la escuela")',
  'Great pronunciation on "aprendí"',
  'Kept the conversation going with follow-up questions',
];

const GROW = [
  { wrong: 'I went to school', right: 'Fui a la escuela' },
  { wrong: 'plantas biología', right: 'plantas en biología' },
];

const PHRASES = ['pasar el rato', 'me alegra verte', '¿qué tal?'];

export default function SessionSummary() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const character = CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

  return (
    <View style={styles.root} testID="summary-screen">
      <ImageBackground source={scenes.celebration} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.82)' }]} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            testID="summary-close"
            onPress={() => router.replace('/(tabs)/home')}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Ionicons name="close" size={22} color={colors.onSurface} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>session summary</Text>
          <Text style={styles.title}>You did it! 🎉</Text>
          <Text style={styles.subtitle}>
            {character.name} says: “Gracias por practicar conmigo — you’re getting braver every day.”
          </Text>

          {/* Reward strip */}
          <View style={styles.rewardStrip}>
            <RewardCell icon="time-outline" value="4:32" label="time" testID="reward-time" />
            <RewardCell icon="flame" value="+1" label="streak" tint={colors.warning} testID="reward-streak" />
            <RewardCell icon="ellipse" value="+35" label="coins" tint={colors.brandYellow} testID="reward-coins" />
          </View>

          {/* Glow */}
          <View
            style={[styles.section, { backgroundColor: colors.brandPrimary }]}
            testID="section-glow"
          >
            <View style={styles.sectionHead}>
              <Ionicons name="sparkles" size={18} color={colors.onBrandPrimary} />
              <Text style={[styles.sectionTitle, { color: colors.onBrandPrimary }]}>
                Glow Areas
              </Text>
            </View>
            {GLOW.map((g, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: colors.onBrandPrimary }]} />
                <Text style={[styles.bulletText, { color: colors.onBrandPrimary }]}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Grow */}
          <View
            style={[styles.section, { backgroundColor: colors.brandPeach }]}
            testID="section-grow"
          >
            <View style={styles.sectionHead}>
              <Ionicons name="leaf" size={18} color={colors.onSurface} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Grow Areas
              </Text>
            </View>
            {GROW.map((g, i) => (
              <View key={i} style={styles.correctionCard}>
                <Text style={styles.correctionWrong}>{g.wrong}</Text>
                <Text style={styles.correctionRight}>→ {g.right}</Text>
              </View>
            ))}
          </View>

          {/* New phrases */}
          <View
            style={[styles.section, { backgroundColor: colors.brandSecondary }]}
            testID="section-phrases"
          >
            <View style={styles.sectionHead}>
              <Ionicons name="bookmark" size={18} color={colors.onBrandSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.onBrandSecondary }]}>
                New Phrases
              </Text>
            </View>
            <View style={styles.phraseRow}>
              {PHRASES.map((p) => (
                <View
                  key={p}
                  style={[styles.phraseChip, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Text style={styles.phraseText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            testID="summary-again"
            onPress={() => router.replace(`/session/speaking?id=${character.id}`)}
            style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.btnSecondaryText}>Practice again</Text>
          </Pressable>
          <Pressable
            testID="summary-done"
            onPress={() => router.replace('/(tabs)/home')}
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.btnPrimaryText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RewardCell({
  icon,
  value,
  label,
  tint,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tint?: string;
  testID: string;
}) {
  return (
    <View style={styles.rewardCell} testID={testID}>
      <View style={[styles.rewardIcon, { backgroundColor: tint ?? colors.surfaceTertiary }]}>
        <Ionicons name={icon} size={16} color={colors.onSurface} />
      </View>
      <Text style={styles.rewardValue}>{value}</Text>
      <Text style={styles.rewardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, alignItems: 'flex-end' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.soft,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md },
  eyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  title: {
    marginTop: 4,
    fontFamily: 'Fredoka',
    fontSize: 36,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: colors.onSurfaceTertiary,
    lineHeight: 22,
  },
  rewardStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  rewardCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadow.soft,
  },
  rewardIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  rewardValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.heavy,
    color: colors.onSurface,
  },
  rewardLabel: {
    fontSize: typography.size.xs,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  section: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.heavy,
    letterSpacing: -0.2,
  },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { flex: 1, fontSize: typography.size.md, lineHeight: 22 },
  correctionCard: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  correctionWrong: {
    fontSize: typography.size.md,
    color: colors.onSurfaceTertiary,
    textDecorationLine: 'line-through',
  },
  correctionRight: {
    fontSize: typography.size.md,
    color: colors.onSurface,
    fontWeight: typography.weight.bold,
    marginTop: 2,
  },
  phraseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  phraseChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  phraseText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.onSurface,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.borderInk,
    backgroundColor: 'rgba(251,243,222,0.92)',
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
  },
  btnSecondaryText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.onSurface,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.onSurface,
  },
  btnPrimaryText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.onSurfaceInverse,
  },
});
