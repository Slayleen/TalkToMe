import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, clearToken, User } from '@/src/api';
import { CEFR_LEVELS, CEFRLevel } from '@/src/data';
import { useInventory } from '@/src/store/inventory';
import { colors, radius, scenes, shadow, spacing, typography } from '@/src/theme';

const LANGUAGES = [
  { code: 'es', label: 'Spanish', emoji: '🇪🇸', active: true },
  { code: 'zh', label: 'Mandarin', emoji: '🇨🇳', active: false },
  { code: 'fr', label: 'French', emoji: '🇫🇷', active: false },
];

const LANG_CODE_TO_NAME: Record<string, string> = { es: 'Spanish', zh: 'Mandarin', fr: 'French' };
const LANG_NAME_TO_CODE: Record<string, string> = { Spanish: 'es', Mandarin: 'zh', French: 'fr' };

export default function AccountScreen() {
  const router = useRouter();
  const inventory = useInventory();
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [lang, setLang] = useState('es');
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        setUser(me);
        setLevel((me.level as CEFRLevel) || 'A2');
        setLang(LANG_NAME_TO_CODE[me.language] || 'es');
      } catch {
        // Not logged in or backend unreachable — screen still renders with
        // local defaults; the logout button below still works regardless.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const changeLevel = (next: CEFRLevel) => {
    setLevel(next);
    api.updateState({ level: next }).catch(() => {});
  };

  const changeLanguage = (code: string) => {
    setLang(code);
    const name = LANG_CODE_TO_NAME[code];
    if (name) api.updateState({ language: name }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert('Log out?', "You'll need to log back in to keep practicing.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await clearToken();
          router.replace('/');
        },
      },
    ]);
  };

  const emailName = user?.email ? user.email.split('@')[0] : null;
  const displayName = emailName ? emailName[0].toUpperCase() + emailName.slice(1) : 'Guest';
  const memberSince = user?.created_at
    ? `active since ${new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`
    : null;

  return (
    <View style={styles.root} testID="account-screen">
      <ImageBackground source={scenes.account} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,243,222,0.82)' }]} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Me</Text>
          <Text style={styles.subtitle}>your cozy corner</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={styles.profileCard} testID="profile-card">
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{displayName[0]}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileMeta}>{user?.email ?? 'not logged in'}</Text>
              {memberSince && <Text style={styles.profileMeta}>{memberSince}</Text>}
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBlock label="streak" value={String(inventory.streak)} icon="flame" tint={colors.warning} testID="stat-streak" />
            <StatBlock label="sessions" value={String(inventory.sessionsCompleted)} icon="mic" tint={colors.brandTertiary} testID="stat-sessions" />
            <StatBlock label="coins" value={String(inventory.coins)} icon="ellipse" tint={colors.brandYellow} testID="stat-coins" />
          </View>

          {/* Language */}
          <Section title="Language">
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                testID={`lang-row-${l.code}`}
                disabled={!l.active}
                onPress={() => changeLanguage(l.code)}
                style={({ pressed }) => [styles.row, pressed && l.active && { opacity: 0.8 }]}
              >
                <Text style={styles.rowEmoji}>{l.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, !l.active && { color: colors.onSurfaceTertiary }]}>
                    {l.label}
                  </Text>
                  {!l.active && <Text style={styles.rowHint}>coming soon</Text>}
                </View>
                {l.code === lang && l.active && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.onSurface} />
                )}
              </Pressable>
            ))}
          </Section>

          {/* Level */}
          <Section title="Your level">
            <View style={styles.levelGrid}>
              {CEFR_LEVELS.map((l) => {
                const active = l.level === level;
                return (
                  <Pressable
                    key={l.level}
                    testID={`level-${l.level}`}
                    onPress={() => changeLevel(l.level)}
                    style={[styles.levelCell, active && styles.levelCellActive]}
                  >
                    <Text style={[styles.levelCode, active && styles.levelCodeActive]}>
                      {l.level}
                    </Text>
                    <Text style={[styles.levelLabel, active && styles.levelLabelActive]}>
                      {l.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
            <SettingRow icon="notifications-outline" label="Notifications" testID="pref-notif" />
            <SettingRow icon="shield-checkmark-outline" label="Privacy" testID="pref-privacy" />
            <SettingRow icon="help-circle-outline" label="Help & feedback" testID="pref-help" />
          </Section>

          <Pressable
            testID="logout-button"
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [styles.logout, pressed && { opacity: 0.8 }, loggingOut && { opacity: 0.6 }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.onError} />
            <Text style={styles.logoutText}>{loggingOut ? 'Logging out…' : 'Log Out'}</Text>
          </Pressable>

          <Text style={styles.version}>Talk To Me · v0.1 base UI</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function StatBlock({
  label,
  value,
  icon,
  tint,
  testID,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  testID: string;
}) {
  return (
    <View style={styles.statBlock} testID={testID}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color={colors.onSurface} />
      </View>
      <Text style={styles.statBlockValue}>{value}</Text>
      <Text style={styles.statBlockLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={18} color={colors.onSurface} />
      </View>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: {
    fontFamily: 'Fredoka',
    fontSize: 30,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: { marginTop: 2, fontSize: typography.size.sm, color: colors.onSurfaceTertiary },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.soft,
  },
  avatarRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30, fontWeight: typography.weight.heavy, color: colors.onSurface,
  },
  profileName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.heavy,
    color: colors.onSurface,
  },
  profileMeta: {
    fontSize: typography.size.sm,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow.soft,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  statBlockValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.heavy,
    color: colors.onSurface,
  },
  statBlockLabel: {
    fontSize: typography.size.xs,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.onSurfaceTertiary,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  rowEmoji: { fontSize: 22 },
  rowLabel: { fontSize: typography.size.md, color: colors.onSurface, fontWeight: typography.weight.semibold },
  rowHint: { fontSize: typography.size.xs, color: colors.onSurfaceTertiary, marginTop: 2 },
  settingIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.sm, gap: spacing.sm },
  levelCell: {
    width: '31%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'flex-start',
  },
  levelCellActive: { backgroundColor: colors.onSurface },
  levelCode: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.heavy,
    color: colors.onSurface,
  },
  levelCodeActive: { color: colors.onSurfaceInverse },
  levelLabel: {
    marginTop: 2,
    fontSize: typography.size.xs,
    color: colors.onSurfaceTertiary,
  },
  levelLabelActive: { color: colors.onSurfaceInverse, opacity: 0.8 },
  logout: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  logoutText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.onError,
  },
  version: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontSize: typography.size.xs,
    color: colors.onSurfaceTertiary,
  },
});