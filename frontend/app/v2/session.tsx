import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { v2Colors, v2Radius, v2Spacing } from '@/src/v2/theme';

const LINES = [
  { at: 0, from: 'bot' as const, text: '¡Bienvenida al jardín! ¿Qué tal tu día? 🌿' },
  { at: 4, from: 'user' as const, text: 'Estuvo bien, gracias. Fui a la escuela.' },
  { at: 9, from: 'bot' as const, text: '¡Genial! ¿Y qué aprendiste hoy?' },
];

export default function V2Session() {
  const router = useRouter();
  const [secs, setSecs] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [lines, setLines] = useState(LINES.slice(0, 1));
  const luna = CHARACTERS[0];

  // Timer + progressive transcript
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const timers = LINES.slice(1).map((l) => setTimeout(() => setLines((p) => [...p, l]), l.at * 1000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!micOn) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [micOn, pulse]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <View style={s.root} testID="v2-session">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top HUD */}
        <View style={s.top}>
          <Pressable testID="v2-sess-back" onPress={() => router.back()} style={s.iconBtn} hitSlop={10}>
            <Ionicons name="close" size={20} color={v2Colors.ink} />
          </Pressable>
          <View style={[s.pill, { backgroundColor: v2Colors.paper, flexDirection: 'row', gap: 6 }]}>
            <View style={s.recDot} />
            <Text style={s.timerText}>{mm}:{ss}</Text>
          </View>
        </View>

        {/* Character stage — the "room" */}
        <View style={s.stage} testID="v2-sess-stage">
          <View style={s.stageWall} />
          <View style={s.stageFloor} />
          {/* window with sky */}
          <View style={s.window}>
            <View style={[s.cross, { top: '50%' }]} />
            <View style={[s.cross, { left: '50%', width: 3, height: '100%', top: 0 }]} />
          </View>
          {/* clouds */}
          <Text style={[s.cloud, { top: 40, left: 55 }]}>☁</Text>
          <Text style={[s.cloud, { top: 60, left: 80 }]}>☁</Text>
          {/* shelf */}
          <View style={s.shelf}>
            <Text style={s.shelfEmoji}>📖</Text>
            <Text style={s.shelfEmoji}>🕯️</Text>
            <Text style={s.shelfEmoji}>🌿</Text>
          </View>
          {/* rug */}
          <View style={s.rug} />
          {/* char + speech */}
          <Image source={luna.image} style={s.stageChar} contentFit="contain" />

          {lines.length > 0 && (
            <View style={s.speech} testID="v2-speech">
              <Text style={s.speechLabel}>{luna.name.toLowerCase()}</Text>
              <Text style={s.speechText}>{lines[lines.length - 1].text}</Text>
              <View style={s.speechTail} />
            </View>
          )}

          {/* Language police toast — floating */}
          <View style={s.policeToast} testID="v2-police">
            <View style={s.policeBadge}>
              <Text style={s.policeBadgeText}>LANGUAGE POLICE</Text>
            </View>
            <Text style={s.policeWrong}>"my day was fine"</Text>
            <Text style={s.policeRight}>→ "mi día estuvo bien"</Text>
          </View>
        </View>

        {/* Transcript scroll */}
        <View style={s.scroll} testID="v2-transcript">
          <Text style={s.scrollLabel}>live transcript</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: v2Spacing.sm }}>
            {lines.map((l, i) => (
              <View
                key={i}
                style={[
                  s.bubble,
                  l.from === 'user'
                    ? { alignSelf: 'flex-end', backgroundColor: v2Colors.sky }
                    : { alignSelf: 'flex-start', backgroundColor: v2Colors.paper },
                ]}
              >
                <Text style={s.bubbleWho}>{l.from === 'user' ? 'you' : luna.name.toLowerCase()}</Text>
                <Text style={s.bubbleText}>{l.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Mic controls */}
        <View style={s.controls}>
          <Pressable style={s.sideBtn} testID="v2-sess-mute">
            <Ionicons name={micOn ? 'volume-high' : 'volume-mute'} size={20} color={v2Colors.ink} />
          </Pressable>

          <Pressable
            testID="v2-sess-mic"
            onPress={() => setMicOn((v) => !v)}
            style={s.micWrap}
          >
            <Animated.View
              style={[s.micHalo, { transform: [{ scale: pulse }], opacity: micOn ? 0.6 : 0 }]}
            />
            <View style={[s.mic, { backgroundColor: micOn ? v2Colors.pinkDeep : v2Colors.creamDeep }]}>
              <Ionicons
                name={micOn ? 'mic' : 'mic-off'}
                size={30}
                color={micOn ? v2Colors.paper : v2Colors.ink}
              />
            </View>
          </Pressable>

          <Pressable
            testID="v2-sess-end"
            onPress={() => router.replace('/session/summary?id=luna')}
            style={s.sideBtn}
          >
            <Ionicons name="stop" size={20} color={v2Colors.ink} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: v2Colors.cream },
  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: v2Spacing.lg, paddingTop: v2Spacing.sm,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: v2Colors.paper, borderWidth: 2, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: v2Radius.pill,
    borderWidth: 2, borderColor: v2Colors.ink, alignItems: 'center',
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: v2Colors.pinkDeep, borderWidth: 1, borderColor: v2Colors.ink },
  timerText: { fontSize: 13, fontWeight: '800', color: v2Colors.ink, fontVariant: ['tabular-nums'] },

  stage: {
    marginHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
    height: 340,
    borderRadius: v2Radius.xl, overflow: 'hidden',
    borderWidth: 3, borderColor: v2Colors.ink,
  },
  stageWall: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', backgroundColor: v2Colors.mint },
  stageFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: v2Colors.peach },
  window: {
    position: 'absolute', top: 30, left: 30, width: 80, height: 80,
    backgroundColor: v2Colors.sky, borderWidth: 3, borderColor: v2Colors.ink,
    borderRadius: 6, overflow: 'hidden',
  },
  cross: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: v2Colors.ink },
  cloud: { position: 'absolute', fontSize: 20, color: v2Colors.paper },
  shelf: {
    position: 'absolute', top: 40, right: 24,
    flexDirection: 'row', gap: 8, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: v2Colors.creamDeep, borderRadius: 6,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  shelfEmoji: { fontSize: 20 },
  rug: {
    position: 'absolute', bottom: 20, left: 24, right: 24, height: 55,
    backgroundColor: v2Colors.pink, borderRadius: 60,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  stageChar: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    width: 210, height: 280,
  },
  speech: {
    position: 'absolute', top: 24, alignSelf: 'center',
    maxWidth: 240,
    backgroundColor: v2Colors.paper,
    paddingHorizontal: v2Spacing.md, paddingVertical: 8,
    borderRadius: v2Radius.lg, borderWidth: 2, borderColor: v2Colors.ink,
  },
  speechLabel: { fontSize: 9, fontWeight: '800', color: v2Colors.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 },
  speechText: { fontSize: 13, fontWeight: '700', color: v2Colors.ink, marginTop: 2 },
  speechTail: {
    position: 'absolute', bottom: -8, alignSelf: 'center',
    width: 12, height: 12, backgroundColor: v2Colors.paper,
    borderRightWidth: 2, borderBottomWidth: 2, borderColor: v2Colors.ink,
    transform: [{ rotate: '45deg' }],
  },
  policeToast: {
    position: 'absolute', bottom: v2Spacing.md, left: v2Spacing.md, right: v2Spacing.md,
    backgroundColor: v2Colors.navy,
    borderRadius: v2Radius.md,
    padding: v2Spacing.sm,
    borderWidth: 2, borderColor: v2Colors.ink,
  },
  policeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: v2Colors.yellow,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: v2Radius.pill,
    borderWidth: 1.5, borderColor: v2Colors.ink,
    marginBottom: 3,
  },
  policeBadgeText: { fontSize: 9, fontWeight: '800', color: v2Colors.ink, letterSpacing: 0.5 },
  policeWrong: { fontSize: 12, color: v2Colors.paper, textDecorationLine: 'line-through', opacity: 0.7 },
  policeRight: { fontSize: 13, fontWeight: '800', color: v2Colors.yellow, marginTop: 1 },

  scroll: {
    flex: 1, marginHorizontal: v2Spacing.lg, marginTop: v2Spacing.md,
    backgroundColor: v2Colors.paper,
    borderRadius: v2Radius.lg, borderWidth: 2, borderColor: v2Colors.ink,
    padding: v2Spacing.md,
  },
  scrollLabel: {
    fontSize: 10, fontWeight: '800', color: v2Colors.inkSoft,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: v2Spacing.sm, paddingVertical: 6,
    borderRadius: v2Radius.md, marginBottom: 6,
    borderWidth: 1.5, borderColor: v2Colors.ink,
  },
  bubbleWho: { fontSize: 9, fontWeight: '800', color: v2Colors.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 },
  bubbleText: { fontSize: 13, color: v2Colors.ink, marginTop: 1 },

  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginTop: v2Spacing.sm, marginBottom: v2Spacing.sm,
  },
  sideBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: v2Colors.paper, borderWidth: 2, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  micWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  micHalo: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: v2Colors.pink },
  mic: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: v2Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
});
