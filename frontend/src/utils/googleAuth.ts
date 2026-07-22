import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Whether Google OAuth is set up. When false we must NOT call the Google hook —
// expo-auth-session throws "Client Id property webClientId must be defined",
// which would crash the entire auth screen.
export const googleAuthConfigured = !!(WEB_CLIENT_ID || ANDROID_CLIENT_ID || IOS_CLIENT_ID);

// Each platform needs its OWN OAuth client id registered in Google Cloud Console.
// A single "Web" client id used with a custom app-scheme redirect causes 400s —
// Google rejects custom-scheme redirects for Web-type clients. This hook lets
// expo-auth-session pick the right client + redirect per platform automatically.
export function useGoogleIdTokenAuth() {
  // googleAuthConfigured is constant for the app's lifetime, so this branch never
  // flips between renders — the hook call order stays stable.
  if (!googleAuthConfigured) {
    return [null, null, async () => {}] as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return Google.useIdTokenAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    usePKCE: false,
  });
}
