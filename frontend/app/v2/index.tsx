import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { V2_STATE, v2Colors, v2Radius, v2Spacing } from '@/src/v2/theme';

// Decorative polka-dot backdrop
function Dots({ color = v2Colors.pink }: { color?: string }) {
  const dots = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 6; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            top: r * 60 + (c % 2 === 0 ? 0 : 30),
            left: c * 70,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: color, opacity: 0.28,
          }}
        />
      );
    }
  }
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{dots}</View>;
}

export default function V2Home() {
  const router = useRouter();
  const luna = CHARACTERS[0];

  return (
    <View style={s.root} testID="v2-home">
      <LinearGradient colors={[v2Colors.pink, v2Colors.peach, v2Colors.yellow]} style={StyleSheet.absoluteFill} />
      <Dots color={v2Colors.cream} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top HUD */}
        <View style={s.hud}>
          <View style={s.profile}>
            <View style={s.avatar}><Text style={s.avatarInitial}>{V2_STATE.user[0]}</Text></View>
            <View>
              <Text style={s.hello}>hi {V2_STATE.user.toLowerCase()}!</Text>
              <Text style={s.helloSub}>{V2_STATE.language} · {V2_STATE.level}</Text>
            </View>
          </View>
          <View style={s.pillsCol}>
            <Chip icon="ellipse" tint={v2Colors.yellow} value={V2_STATE.coins} testID="v2-coins" />
            <Chip icon="diamond" tint={v2Colors.sky} value={V2_STATE.gems} testID="v2-gems" />
          </View>
        </View>

        {/* Cozy room diorama */}
        <View style={s.diorama} testID="v2-diorama">
          {/* wall + floor */}
          <View style={s.wall} />
          <View style={s.floor} />
          {/* window */}
          <View style={s.window}>
            <View style={s.windowSky} />
            <View style={s.windowCross} />
            <View style={[s.windowCross, { transform: [{ rotate: '90deg' }] }]} />
          </View>
          {/* shelf */}
          <View style={s.shelf}>
            <Text style={s.shelfEmoji}>📚</Text>
            <Text style={s.shelfEmoji}>🪴</Text>
            <Text style={s.shelfEmoji}>🧸</Text>
          </View>
          {/* rug */}
          <View style={s.rug} />
          {/* character */}
          <Image source={luna.image} style={s.character} contentFit="contain" />
          {/* cat */}
          <View style={s.cat}><Text style={{ fontSize: 34 }}>🐱</Text></View>
          {/* plant */}
          <Text style={s.plant}>🪴</Text>
          {/* speech bubble */}
          <View style={s.speech} testID="v2-speech">
            <Text style={s.speechText}>¡Hola! ¿Practicamos hoy? 🍵</Text>
            <View style={s.speechTail} />
          </View>
        </View>

        {/* Action strip */}
        <View style={s.actions} testID="v2-actions">
          <ActionTile
            testID="v2-btn-talk"
            label="Talk"
            sub="voice chat"
            icon="mic"
            tint={v2Colors.pink}
            onPress={() => router.push('/v2/session')}
          />
          <ActionTile
            testID="v2-btn-wardrobe"
            label="Dress"
            sub="wardrobe"
            icon="shirt"
            tint={v2Colors.mint}
            onPress={() => router.push('/v2/wardrobe')}
          />
          <ActionTile
            testID="v2-btn-shop"
            label="Shop"
            sub="+ gacha"
            icon="sparkles"
            tint={v2Colors.yellow}
            onPress={() => router.push('/v2/shop')}
          />
        </View>

        {/* Streak strip */}
        <View style={s.streak} testID="v2-streak">
          <View style={s.streakBadge}><Text style={{ fontSize: 22 }}>🔥</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.streakTitle}>{V2_STATE.streak}-day streak — keep it warm!</Text>
            <View style={s.streakTrack}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={i}
                  style={[s.streakDot, i < V2_STATE.streak && s.streakDotOn]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* back to v1 */}
        <Pressable
          testID="v2-back-v1"
          onPress={() => router.replace('/(tabs)/home')}
          style={s.backV1}
        >
          <Ionicons name="arrow-back" size={14} color={v2Colors.inkSoft} />
          <Text style={s.backV1Text}>back to prototype v1</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Chip({ icon, value, tint, testID }: any) {
  return (
    <View style={[s.chip, { backgroundColor: tint }]} testID={testID}>
      <Ionicons name={icon} size={12} color={v2Colors.ink} />
      <Text style={s.chipText}>{value}</Text>
    </View>
  );
}

function ActionTile({ label, sub, icon, tint, onPress, testID }: any) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [s.tile, { backgroundColor: tint }, pressed && { transform: [{ scale: 0.96 }] }]}
    >
      <View style={s.tileIcon}>
        <Ionicons name={icon} size={20} color={v2Colors.ink} />
      </View>
      <Text style={s.tileLabel}>{label}</Text>
      <Text style={s.tileSub}>{sub}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: v2Colors.cream },
  hud: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: v2Spacing.lg, paddingTop: v2Spacing.sm,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: v2Colors.ink },
  hello: { fontSize: 18, fontWeight: '800', color: v2Colors.ink },
  helloSub: { fontSize: 11, color: v2Colors.inkSoft, marginTop: 1 },
  pillsCol: { gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: v2Radius.pill,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  chipText: { fontSize: 12, fontWeight: '800', color: v2Colors.ink },

  diorama: {
    flex: 1, marginHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
    borderRadius: v2Radius.xl, overflow: 'hidden',
    borderWidth: 3, borderColor: v2Colors.ink,
  },
  wall: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', backgroundColor: v2Colors.paper },
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: v2Colors.peach },
  window: {
    position: 'absolute', top: 20, left: 20, width: 90, height: 90,
    backgroundColor: v2Colors.sky, borderWidth: 3, borderColor: v2Colors.ink,
    borderRadius: 8, overflow: 'hidden',
  },
  windowSky: { flex: 1, backgroundColor: v2Colors.sky },
  windowCross: {
    position: 'absolute', left: 0, right: 0, top: '50%',
    height: 3, backgroundColor: v2Colors.ink,
  },
  shelf: {
    position: 'absolute', top: 30, right: 20,
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: v2Colors.creamDeep, borderRadius: 6,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  shelfEmoji: { fontSize: 22 },
  rug: {
    position: 'absolute', bottom: 30, left: 30, right: 30, height: 60,
    backgroundColor: v2Colors.pink, borderRadius: 80,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  character: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    width: 180, height: 260,
  },
  cat: {
    position: 'absolute', bottom: 50, right: 30,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  plant: { position: 'absolute', bottom: 44, left: 22, fontSize: 40 },
  speech: {
    position: 'absolute', top: 24, alignSelf: 'center',
    backgroundColor: v2Colors.paper,
    paddingHorizontal: v2Spacing.md, paddingVertical: 8,
    borderRadius: v2Radius.lg, borderWidth: 2, borderColor: v2Colors.ink,
  },
  speechText: { fontSize: 13, fontWeight: '600', color: v2Colors.ink },
  speechTail: {
    position: 'absolute', bottom: -8, alignSelf: 'center',
    width: 12, height: 12, backgroundColor: v2Colors.paper,
    borderRightWidth: 2, borderBottomWidth: 2, borderColor: v2Colors.ink,
    transform: [{ rotate: '45deg' }],
  },

  actions: {
    flexDirection: 'row', gap: v2Spacing.sm,
    paddingHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
  },
  tile: {
    flex: 1, borderRadius: v2Radius.lg,
    padding: v2Spacing.md, gap: 2,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  tileIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: v2Colors.paper,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: v2Colors.ink,
    marginBottom: 4,
  },
  tileLabel: { fontSize: 15, fontWeight: '800', color: v2Colors.ink },
  tileSub: { fontSize: 10, color: v2Colors.inkSoft, fontWeight: '600' },

  streak: {
    flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md,
    marginHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
    padding: v2Spacing.md, backgroundColor: v2Colors.paper,
    borderRadius: v2Radius.lg, borderWidth: 2, borderColor: v2Colors.ink,
  },
  streakBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: v2Colors.yellow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  streakTitle: { fontSize: 13, fontWeight: '700', color: v2Colors.ink },
  streakTrack: { flexDirection: 'row', gap: 5, marginTop: 5 },
  streakDot: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: v2Colors.creamDeep,
    borderWidth: 1, borderColor: v2Colors.border,
  },
  streakDotOn: { backgroundColor: v2Colors.pinkDeep, borderColor: v2Colors.ink },

  backV1: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'center', marginTop: v2Spacing.md,
  },
  backV1Text: { fontSize: 11, color: v2Colors.inkSoft, textDecorationLine: 'underline' },
});
