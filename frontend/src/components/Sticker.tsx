// Sticker-style primitives — chunky rounded buttons/cards with an
// offset "back layer" that creates a physical, hand-drawn feel
// (Duolingo / Purrfect Tale style). Also decorative doodles.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function StickerButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  testID,
  fullWidth,
  small,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: ButtonVariant;
  testID?: string;
  fullWidth?: boolean;
  small?: boolean;
}) {
  const palette = getPalette(variant);

  return (
    <View
      style={[
        stickerStyles.wrap,
        fullWidth && { alignSelf: 'stretch' },
      ]}
    >
      {/* Shadow layer */}
      <View
        pointerEvents="none"
        style={[
          stickerStyles.shadow,
          { backgroundColor: palette.shadow, borderRadius: small ? radius.md : radius.lg },
        ]}
      />
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [
          stickerStyles.face,
          {
            backgroundColor: palette.face,
            borderColor: palette.border,
            paddingVertical: small ? 10 : 14,
            paddingHorizontal: small ? spacing.md : spacing.xl,
            borderRadius: small ? radius.md : radius.lg,
          },
          pressed && { transform: [{ translateY: 3 }] },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={small ? 16 : 20}
            color={palette.text}
            style={{ marginRight: 6 }}
          />
        ) : null}
        <Text
          style={{
            fontFamily: typography.display,
            fontSize: small ? 14 : 17,
            color: palette.text,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function getPalette(v: ButtonVariant) {
  switch (v) {
    case 'primary':
      return {
        face: colors.brandDeepRose,
        border: colors.borderInk,
        shadow: '#8B4B54',
        text: colors.onSurfaceInverse,
      };
    case 'secondary':
      return {
        face: colors.brandYellow,
        border: colors.borderInk,
        shadow: '#B99E3B',
        text: colors.onSurface,
      };
    case 'ghost':
    default:
      return {
        face: colors.surfaceSecondary,
        border: colors.borderInk,
        shadow: colors.border,
        text: colors.onSurface,
      };
  }
}

// Card with a small drop offset — makes elements feel "stuck on"
export function StickerCard({
  children,
  style,
  tint = colors.surfaceSecondary,
  testID,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  testID?: string;
}) {
  return (
    <View style={[stickerStyles.cardWrap, style]} testID={testID}>
      <View style={[stickerStyles.cardShadow]} />
      <View style={[stickerStyles.card, { backgroundColor: tint }]}>{children}</View>
    </View>
  );
}

// Tiny random doodles (stars/hearts) to scatter over headers
export function Doodles({ items = ['✦', '♡', '✧'] }: { items?: string[] }) {
  const positions = [
    { top: 12, right: 30, size: 14, rot: -12 },
    { top: 40, left: 20, size: 18, rot: 10 },
    { top: 70, right: 55, size: 12, rot: 22 },
    { top: 100, left: 55, size: 16, rot: -6 },
    { top: 22, left: 90, size: 12, rot: 30 },
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {positions.map((p, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            fontSize: p.size,
            color: colors.brandDeepRose,
            opacity: 0.7,
            transform: [{ rotate: `${p.rot}deg` }],
          }}
        >
          {items[i % items.length]}
        </Text>
      ))}
    </View>
  );
}

// Dashed separator, hand-drawn feel
export function DashedRule({ color = colors.borderStrong }: { color?: string }) {
  return (
    <View
      style={{
        borderStyle: 'dashed',
        borderBottomWidth: 1.5,
        borderColor: color,
        marginVertical: spacing.sm,
      }}
    />
  );
}

const stickerStyles = StyleSheet.create({
  wrap: { position: 'relative' },
  shadow: {
    position: 'absolute',
    top: 4, left: 0, right: 0, bottom: -3,
    borderRadius: radius.lg,
  },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  cardWrap: { position: 'relative' },
  cardShadow: {
    position: 'absolute',
    top: 5, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderStrong,
    borderRadius: radius.lg,
    opacity: 0.5,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderInk,
    padding: spacing.lg,
  },
});
