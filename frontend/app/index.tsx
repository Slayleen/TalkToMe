import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { Doodles, StickerButton } from '@/src/components/Sticker';
import { colors, radius, scenes, shadow, spacing, typography } from '@/src/theme';

export default function StartPage() {
  const router = useRouter();

  return (
    <View style={styles.root} testID="start-screen">
      <ImageBackground
        source={scenes.teahouse}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {/* Soft cream tint over illustration for text legibility */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.32)' }]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top: title bubble */}
        <View style={styles.headerWrap}>
          <Doodles />
          <View style={styles.bubble}>
            <View style={styles.bubbleShadow} />
            <View style={styles.bubbleFace}>
              <Text style={styles.tagline}>✦ welcome to ✦</Text>
              <Text style={styles.title}>Talk To Me</Text>
              <Text style={styles.subtitle}>your cozy speaking partner</Text>
            </View>
            <View style={styles.bubbleTail} />
            <View style={styles.bubbleTailInk} />
          </View>
        </View>

        {/* Middle: Luna in a soft frame */}
        <View style={styles.heroWrap}>
          <View style={styles.frameShadow} />
          <LinearGradient
            colors={[colors.brandYellow, colors.brandPeach]}
            style={styles.frame}
          >
            <View style={styles.frameInner}>
              <Image
                source={CHARACTERS[0].image}
                style={styles.heroImage}
                contentFit="contain"
                transition={400}
              />
            </View>
            {/* corner nails */}
            {[
              { top: 6, left: 6 },
              { top: 6, right: 6 },
              { bottom: 6, left: 6 },
              { bottom: 6, right: 6 },
            ].map((p, i) => (
              <View key={i} style={[styles.nail, p as any]} />
            ))}
          </LinearGradient>

          <View style={styles.badgeShadow} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>meet Luna 🍵</Text>
          </View>
        </View>

        {/* Bottom: sticker CTA */}
        <View style={styles.ctaWrap}>
          <StickerButton
            testID="start-cta-button"
            label="Let's Start!"
            icon="sparkles"
            variant="primary"
            fullWidth
            onPress={() => router.push('/auth/signup')}
          />
          <Text
            testID="start-login-link"
            onPress={() => router.push('/auth/login')}
            style={styles.loginLink}
          >
            already have an account?  <Text style={styles.loginLinkBold}>Log In</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  safe: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
  headerWrap: {
    alignItems: 'center', marginTop: spacing.md,
    minHeight: 150, justifyContent: 'center',
  },
  bubble: { position: 'relative' },
  bubbleShadow: {
    position: 'absolute', top: 6, left: 6, right: -3, bottom: -6,
    backgroundColor: colors.borderStrong, borderRadius: radius.xl, opacity: 0.6,
  },
  bubbleFace: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2.5, borderColor: colors.borderInk,
    alignItems: 'center',
  },
  bubbleTail: {
    position: 'absolute', bottom: -10, alignSelf: 'center',
    width: 20, height: 20, backgroundColor: colors.surfaceSecondary,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  bubbleTailInk: {
    position: 'absolute', bottom: -14, alignSelf: 'center',
    width: 24, height: 24, backgroundColor: colors.borderInk,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  tagline: {
    fontFamily: typography.display, fontSize: 11, color: colors.brandDeepRose,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  title: {
    fontFamily: typography.display,
    fontSize: 40, color: colors.onSurface,
    letterSpacing: -0.5, marginTop: 2,
  },
  subtitle: {
    fontSize: typography.size.sm, color: colors.onSurfaceTertiary,
    fontWeight: '600', marginTop: 2,
  },

  heroWrap: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  frameShadow: {
    position: 'absolute', width: 258, height: 318, backgroundColor: colors.borderStrong,
    borderRadius: radius.xl, opacity: 0.5, transform: [{ translateY: 8 }, { translateX: 4 }],
  },
  frame: {
    width: 250, height: 310, borderRadius: radius.xl,
    borderWidth: 3, borderColor: colors.borderInk,
    padding: 10, alignItems: 'center', justifyContent: 'center',
  },
  frameInner: {
    flex: 1, width: '100%',
    backgroundColor: 'rgba(255,251,240,0.6)',
    borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: '100%', height: '100%' },
  nail: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.borderInk,
  },
  badgeShadow: {
    marginTop: spacing.lg, width: 130, height: 34, backgroundColor: colors.borderStrong,
    borderRadius: radius.pill, opacity: 0.5, transform: [{ translateY: 4 }, { translateX: 2 }],
    position: 'absolute',
  },
  badge: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.lg, paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  badgeText: {
    fontFamily: typography.display, fontSize: 15,
    color: colors.onBrandSecondary,
  },

  ctaWrap: { paddingBottom: spacing.md, gap: spacing.lg, alignItems: 'center' },
  loginLink: { color: colors.onSurfaceTertiary, fontSize: typography.size.md, fontWeight: '600' },
  loginLinkBold: {
    fontFamily: typography.display, color: colors.onSurface,
    textDecorationLine: 'underline',
  },
});
