import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerButton } from '@/src/components/Sticker';
import { colors, radius, shadow, spacing, typography } from '@/src/theme';
import { useGoogleIdTokenAuth, googleAuthConfigured } from '@/src/utils/googleAuth';

type Mode = 'signup' | 'login';

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [, googleResponse, promptGoogleAuth] = useGoogleIdTokenAuth();

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Sign Up!' : 'Log In!';
  const primaryCta = isSignup ? 'Create account' : 'Log In';
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email || !password || (isSignup && password !== confirm)) {
      setErr(isSignup && password !== confirm ? 'Passwords don\u2019t match' : 'Fill both fields');
      return;
    }
    setBusy(true);
    try {
      const { api, setToken } = await import('@/src/api');
      const res = isSignup
        ? await api.signup(email, password)
        : await api.login(email, password);
      await setToken(res.access_token);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.error('Auth error:', e);
      const errorMsg = e?.message || (typeof e === 'string' ? e : JSON.stringify(e));
      setErr(errorMsg || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErr(null);
    setBusy(true);
    try {
      await promptGoogleAuth();
      // Result is handled in the useEffect below once googleResponse updates.
    } catch (e: any) {
      setErr(e?.message || 'Google sign in failed');
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === 'success') {
      const idToken = googleResponse.params?.id_token;
      if (!idToken) {
        setErr('No ID token in Google response');
        setBusy(false);
        return;
      }
      (async () => {
        try {
          const { api, setToken } = await import('@/src/api');
          const res = await api.googleAuth(idToken);
          await setToken(res.access_token);
          router.replace('/(tabs)/home');
        } catch (e: any) {
          setErr(e?.message || 'Google sign in failed');
        } finally {
          setBusy(false);
        }
      })();
    } else if (googleResponse.type === 'error' || googleResponse.type === 'cancel' || googleResponse.type === 'dismiss') {
      setBusy(false);
      if (googleResponse.type === 'error') {
        setErr('Google sign in failed');
      }
    }
  }, [googleResponse]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable
            testID="auth-back"
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title} testID="auth-title">
              {title}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? 'Make yourself a home in the teahouse ✨'
                : 'Welcome back — Luna missed you 💗'}
            </Text>

            <View style={styles.form}>
              <FormField label="E-mail" testID="auth-email">
                <TextInput
                  testID="auth-email-input"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor="#B8ADA0"
                  style={styles.input}
                />
              </FormField>

              <FormField label="Password" testID="auth-password">
                <TextInput
                  testID="auth-password-input"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#B8ADA0"
                  style={styles.input}
                />
              </FormField>

              {isSignup && (
                <FormField label="Confirm password" testID="auth-confirm">
                  <TextInput
                    testID="auth-confirm-input"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#B8ADA0"
                    style={styles.input}
                  />
                </FormField>
              )}
            </View>

            <StickerButton
              testID="auth-submit"
              label={busy ? 'Please wait\u2026' : primaryCta}
              icon="sparkles"
              variant="primary"
              fullWidth
              onPress={busy ? undefined : submit}
            />
            {err ? (
              <Text style={{ color: '#B33', fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' }}>{err}</Text>
            ) : null}

            {googleAuthConfigured && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                <StickerButton
                  testID="auth-gmail"
                  label="Continue with Gmail"
                  icon="logo-google"
                  variant="ghost"
                  fullWidth
                  onPress={busy ? undefined : handleGoogleAuth}
                />
              </>
            )}

            <Pressable
              testID="auth-switch"
              onPress={() =>
                router.replace(isSignup ? '/auth/login' : '/auth/signup')
              }
              hitSlop={12}
              style={{ marginTop: spacing.xl, alignSelf: 'center' }}
            >
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account? ' : 'New here? '}
                <Text style={styles.switchTextBold}>
                  {isSignup ? 'Log In' : 'Sign Up'}
                </Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function FormField({
  label,
  children,
  testID,
}: {
  label: string;
  children: React.ReactNode;
  testID: string;
}) {
  return (
    <View style={styles.field} testID={testID}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  title: {
    fontFamily: typography.display,
    fontSize: 36,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: colors.onSurfaceTertiary,
  },
  form: { marginTop: spacing.xl, gap: spacing.lg },
  field: { gap: spacing.sm },
  fieldLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.onSurfaceTertiary,
    paddingLeft: spacing.sm,
    letterSpacing: 0.2,
  },
  inputCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.borderInk,
  },
  input: {
    height: 48,
    fontSize: typography.size.lg,
    color: colors.onSurface,
  },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.onSurface,
    paddingVertical: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    ...shadow.card,
  },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  ctaText: {
    color: colors.onSurfaceInverse,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { color: colors.onSurfaceTertiary, fontSize: typography.size.sm },
  gmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gmailText: {
    color: colors.onSurface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  switchText: { fontSize: typography.size.md, color: colors.onSurfaceTertiary },
  switchTextBold: { color: colors.onSurface, fontWeight: typography.weight.bold },
});