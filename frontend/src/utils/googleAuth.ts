import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Each platform needs its OWN OAuth client id registered in Google Cloud
// Console (see setup notes). A single "Web" client id, used with a custom
// app-scheme redirect, is what caused flowName=GeneralOAuthFlow / 400s —
// Google's generic web auth endpoint rejects custom-scheme redirects for
// Web-type clients. This hook lets expo-auth-session pick the right
// client + redirect strategy per platform automatically.
export function useGoogleIdTokenAuth() {
  return Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // PKCE only applies to the authorization-code flow. We're requesting
    // an id_token directly (implicit flow), and Google rejects the request
    // with "Parameter not allowed for this message type: code_challenge_method"
    // if PKCE params are included alongside it.
    usePKCE: false,
  });
}