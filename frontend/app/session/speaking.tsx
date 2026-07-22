import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERS } from '@/src/data';
import { StickerButton } from '@/src/components/Sticker';
import { colors, radius, scenes, spacing, typography } from '@/src/theme';
import { api } from '@/src/api';
import { startRecording, stopRecording } from '@/src/recorder';
import { MS_PER_CHAR, cleanupBabble, initBabbleAudio, playBabble, stopBabble } from '@/src/utils/tts';

type Line = { from: 'user' | 'bot'; text: string };
type Correction = { wrong: string; right: string; hint: string };

export default function SpeakingSession() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const character = CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [secs, setSecs] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState<Line[]>([]);
  const [typing, setTyping] = useState<{ who: string; text: string; shown: number } | null>(null);
  const [police, setPolice] = useState<Correction | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  const typingIv = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const greeted = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    initBabbleAudio();
    return () => {
      clearInterval(t);
      cleanupBabble();
      if (typingIv.current) clearInterval(typingIv.current);
    };
  }, []);

  // Greet on entry — reveals character line with synced babble (instant "aha").
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const greeting = `¡Hola! Soy ${character.name}. Toca el micrófono y hablemos 🍵`;
    const to = setTimeout(() => revealBot(greeting), 500);
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal a bot line one character at a time, babbling in lock-step.
  const revealBot = (text: string) =>
    new Promise<void>((resolve) => {
      if (typingIv.current) clearInterval(typingIv.current);
      const chars = Array.from(text);
      setTyping({ who: character.name.toLowerCase(), text, shown: 0 });
      playBabble(text, character.babblePitch);
      let i = 0;
      typingIv.current = setInterval(() => {
        i += 1;
        setTyping((t) => (t ? { ...t, shown: i } : t));
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
        if (i >= chars.length) {
          clearInterval(typingIv.current);
          typingIv.current = null;
          stopBabble();
          setTranscript((p) => [...p, { from: 'bot', text }]);
          setTyping(null);
          resolve();
        }
      }, MS_PER_CHAR);
    });

  const ensureMicPermission = async (): Promise<boolean> => {
    try {
      const cur = await AudioModule.getRecordingPermissionsAsync();
      if (cur.granted) return true;
      if (cur.canAskAgain) {
        const req = await AudioModule.requestRecordingPermissionsAsync();
        if (req.granted) return true;
        if (!req.canAskAgain) setPermDenied(true);
        return false;
      }
      setPermDenied(true);
      return false;
    } catch {
      return false;
    }
  };

  const toggleMic = async () => {
    if (busy || typing) return;

    if (!micOn) {
      try {
        if (Platform.OS === 'web') {
          await startRecording();
        } else {
          const ok = await ensureMicPermission();
          if (!ok) return;
          await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
          await recorder.prepareToRecordAsync();
          recorder.record();
        }
        setMicOn(true);
      } catch (e: any) {
        setTranscript((p) => [
          ...p,
          { from: 'bot', text: `(mic error: ${e?.message || 'permission denied'})` },
        ]);
      }
      return;
    }

    // Stop → transcribe → chat → babble reply
    setMicOn(false);
    setBusy(true);
    try {
      let audio: any = null;
      if (Platform.OS === 'web') {
        const blob = await stopRecording();
        if (!blob) {
          setBusy(false);
          return;
        }
        audio = blob;
      } else {
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) {
          setBusy(false);
          return;
        }
        audio = { uri, name: 'speech.m4a', type: 'audio/m4a' };
      }

      const tr = await api.transcribe(audio);
      const userText = (tr.text || '').trim();
      if (!userText) {
        setBusy(false);
        return;
      }
      const nextTranscript: Line[] = [...transcript, { from: 'user', text: userText }];
      setTranscript(nextTranscript);

      const history = nextTranscript.map((m) => ({
        role: (m.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));
      const res = await api.chat({
        user_message: userText,
        character_name: character.name,
        character_vibe: character.vibe,
        target_language: character.language,
        level: character.level,
        history,
      });
      setBusy(false);
      if (res.correction) {
        setPolice(res.correction);
        setTimeout(() => setPolice(null), 6000);
      }
      await revealBot(res.reply);
    } catch (e: any) {
      setTranscript((p) => [...p, { from: 'bot', text: `(oops: ${e?.message || 'error'})` }]);
      setBusy(false);
    }
  };

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!micOn) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [micOn, pulse]);

  const micLocked = busy || !!typing;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <View style={s.root} testID="speaking-screen">
      <View style={s.top}>
        <ImageBackground source={scenes.garden} style={StyleSheet.absoluteFill} contentFit="cover" />
        <SafeAreaView edges={['top']} style={s.topSafe}>
          <View style={s.topBar}>
            <Pressable testID="session-close" onPress={() => setConfirmEnd(true)} style={s.iconChip} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.onSurface} />
            </Pressable>

            <View style={s.timerWrap}>
              <View style={s.timerShadow} />
              <View style={s.timerFace}>
                <View style={s.recDot} />
                <Text style={s.timerText}>{mm}:{ss}</Text>
              </View>
            </View>

            <View style={s.iconChip}>
              <Ionicons name="shield-checkmark" size={16} color={colors.onSurface} />
            </View>
          </View>

          <View style={s.nameChipWrap}>
            <View style={s.nameChipShadow} />
            <View style={s.nameChipFace}>
              <Text style={s.nameChipName}>{character.name}</Text>
              <Text style={s.nameChipMeta}>
                {character.languageEmoji} {character.language} · {character.level}
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <Image source={character.image} style={s.character} contentFit="contain" />

        {typing && (
          <View style={s.speakingBadge} testID="speaking-indicator">
            <Ionicons name="volume-high" size={13} color={colors.onSurface} />
            <Text style={s.speakingBadgeText}>{character.name.toLowerCase()} is speaking…</Text>
          </View>
        )}

        {police && (
          <View style={s.policeWrap} testID="language-police-tooltip">
            <View style={s.policeShadow} />
            <View style={s.policeCard}>
              <View style={s.policeBadge}>
                <Ionicons name="alert-circle" size={12} color={colors.onSurface} />
                <Text style={s.policeBadgeText}>language police</Text>
              </View>
              <Text style={s.policeWrong}>{police.wrong}</Text>
              <Text style={s.policeRight}>{'\u2192 '}{police.right}</Text>
              <Text style={s.policeHint}>{police.hint}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={s.sheet}>
        <View style={s.grabber} />
        <Text style={s.sheetLabel}>✦ live transcript ✦</Text>
        <ScrollView
          ref={scrollRef}
          testID="transcript-scroll"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {transcript.map((l, i) => (
            <View key={i} style={[s.line, l.from === 'user' ? s.lineUser : s.lineBot]}>
              <Text style={s.lineWho}>{l.from === 'user' ? 'you' : character.name.toLowerCase()}</Text>
              <Text style={s.lineText}>{l.text}</Text>
            </View>
          ))}

          {typing && (
            <View style={[s.line, s.lineBot]} testID="typing-line">
              <Text style={s.lineWho}>{typing.who}</Text>
              <Text style={s.lineText}>
                {Array.from(typing.text).slice(0, typing.shown).join('')}
                <Text style={s.caret}>▌</Text>
              </Text>
            </View>
          )}

          {(busy || micOn) && !typing && (
            <View style={s.line}>
              <Text style={s.lineWho}>...</Text>
              <Text style={s.lineText}>{micOn ? 'listening\u2026' : 'thinking\u2026'}</Text>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={s.micBar}>
          <View style={s.micRow}>
            <Pressable testID="session-mic" onPress={toggleMic} disabled={micLocked} style={[s.micWrap, micLocked && { opacity: 0.5 }]}>
              <Animated.View style={[s.micHalo, { transform: [{ scale: pulse }], opacity: micOn ? 0.55 : 0 }]} />
              <View style={s.micShadow} />
              <View style={[s.mic, { backgroundColor: micOn ? colors.brandDeepRose : colors.surfaceTertiary }]}>
                <Ionicons
                  name={micOn ? 'mic' : 'mic-off'}
                  size={32}
                  color={micOn ? colors.onSurfaceInverse : colors.onSurface}
                />
              </View>
            </Pressable>

            <Pressable testID="session-end" onPress={() => setConfirmEnd(true)} style={s.sideBtn}>
              <Ionicons name="stop" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <Text style={s.micHint}>
            {micOn ? 'tap to stop & send' : micLocked ? 'wait a sec…' : 'tap the mic and speak'}
          </Text>
        </SafeAreaView>
      </View>

      {/* End confirm modal */}
      <Modal transparent animationType="fade" visible={confirmEnd} onRequestClose={() => setConfirmEnd(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setConfirmEnd(false)}>
          <Pressable style={s.modalWrap} onPress={() => {}}>
            <View style={s.modalShadow} />
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>End this session?</Text>
              <Text style={s.modalBody}>
                {character.name} will save your progress and give you a warm little summary.
              </Text>
              <View style={s.modalActions}>
                <View style={{ flex: 1 }}>
                  <StickerButton testID="modal-keep" label="Keep Going" variant="ghost" small fullWidth onPress={() => setConfirmEnd(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <StickerButton
                    testID="modal-end"
                    label="End"
                    variant="primary"
                    small
                    fullWidth
                    onPress={() => {
                      setConfirmEnd(false);
                      router.replace(`/session/summary?id=${character.id}`);
                    }}
                  />
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Mic permission denied modal */}
      <Modal transparent animationType="fade" visible={permDenied} onRequestClose={() => setPermDenied(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setPermDenied(false)}>
          <Pressable style={s.modalWrap} onPress={() => {}}>
            <View style={s.modalShadow} />
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Microphone needed 🎙️</Text>
              <Text style={s.modalBody}>
                Talking to {character.name} needs mic access. Enable it in Settings to start speaking.
              </Text>
              <View style={s.modalActions}>
                <View style={{ flex: 1 }}>
                  <StickerButton testID="perm-cancel" label="Not now" variant="ghost" small fullWidth onPress={() => setPermDenied(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <StickerButton
                    testID="perm-open-settings"
                    label="Open Settings"
                    variant="primary"
                    small
                    fullWidth
                    onPress={() => {
                      setPermDenied(false);
                      Linking.openSettings();
                    }}
                  />
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  top: { height: '58%', overflow: 'hidden' },
  topSafe: { paddingHorizontal: spacing.lg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  iconChip: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,251,240,0.92)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.borderInk,
  },
  timerWrap: { position: 'relative' },
  timerShadow: {
    position: 'absolute', top: 4, left: 2, right: -2, bottom: -2,
    backgroundColor: colors.borderInk, borderRadius: radius.pill, opacity: 0.4,
  },
  timerFace: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,251,240,0.95)',
    borderWidth: 2, borderColor: colors.borderInk,
  },
  recDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandDeepRose,
    borderWidth: 1, borderColor: colors.borderInk,
  },
  timerText: {
    fontFamily: typography.display, fontSize: 14, color: colors.onSurface,
    fontVariant: ['tabular-nums'],
  },

  nameChipWrap: { alignSelf: 'flex-start', marginTop: spacing.md },
  nameChipShadow: {
    position: 'absolute', top: 4, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.4,
  },
  nameChipFace: {
    backgroundColor: 'rgba(255,251,240,0.95)',
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.lg, borderWidth: 2, borderColor: colors.borderInk,
  },
  nameChipName: { fontFamily: typography.display, fontSize: 20, color: colors.onSurface },
  nameChipMeta: { fontSize: 11, color: colors.onSurfaceTertiary, fontWeight: '600' },

  character: { position: 'absolute', bottom: -30, alignSelf: 'center', width: 340, height: 460 },

  speakingBadge: {
    position: 'absolute', bottom: spacing.md, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.brandYellow,
    paddingHorizontal: spacing.md, paddingVertical: 5,
    borderRadius: radius.pill, borderWidth: 2, borderColor: colors.borderInk,
  },
  speakingBadgeText: {
    fontFamily: typography.display, fontSize: 12, color: colors.onSurface,
  },

  policeWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.md },
  policeShadow: {
    position: 'absolute', top: 5, left: 3, right: -3, bottom: -3,
    backgroundColor: colors.borderInk, borderRadius: radius.lg, opacity: 0.5,
  },
  policeCard: {
    backgroundColor: colors.surfaceInverse, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.borderInk,
  },
  policeBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.brandYellow, paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.borderInk, marginBottom: 6,
  },
  policeBadgeText: {
    fontFamily: typography.display, fontSize: 10, color: colors.onSurface,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  policeWrong: { fontSize: 14, color: colors.onSurfaceInverse, textDecorationLine: 'line-through', opacity: 0.7 },
  policeRight: { fontFamily: typography.display, fontSize: 16, color: colors.onSurfaceInverse, marginTop: 2 },
  policeHint: { fontSize: 12, color: colors.brandSecondary, marginTop: 4, fontWeight: '600' },

  sheet: {
    flex: 1, backgroundColor: colors.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    marginTop: -24, paddingHorizontal: spacing.lg,
    borderTopWidth: 2, borderColor: colors.borderInk,
  },
  grabber: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: colors.borderStrong, marginTop: spacing.sm,
  },
  sheetLabel: {
    marginTop: spacing.md, marginBottom: spacing.sm,
    fontFamily: typography.display, fontSize: 12, color: colors.brandDeepRose,
    letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center',
  },
  line: { paddingVertical: 6 },
  lineUser: { paddingLeft: spacing.xl },
  lineBot: { paddingRight: spacing.xl },
  lineWho: {
    fontFamily: typography.display, fontSize: 10, color: colors.onSurfaceTertiary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  lineText: { fontSize: 15, color: colors.onSurface, lineHeight: 22, marginTop: 2, fontWeight: '500' },
  caret: { color: colors.brandDeepRose, fontWeight: '700' },

  micBar: {},
  micRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingTop: spacing.md,
  },
  micHint: {
    textAlign: 'center', color: colors.onSurfaceTertiary, fontSize: 12,
    fontWeight: '600', paddingBottom: spacing.sm,
  },
  sideBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.borderInk,
  },
  micWrap: { alignItems: 'center', justifyContent: 'center', width: 100, height: 100 },
  micHalo: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: colors.brandPrimary },
  micShadow: {
    position: 'absolute', width: 82, height: 82, borderRadius: 41,
    backgroundColor: colors.borderInk, opacity: 0.5, transform: [{ translateY: 5 }],
  },
  mic: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.borderInk,
  },

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
  modalTitle: { fontFamily: typography.display, fontSize: 22, color: colors.onSurface, letterSpacing: -0.3 },
  modalBody: { marginTop: spacing.sm, fontSize: 14, color: colors.onSurfaceTertiary, lineHeight: 20, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
