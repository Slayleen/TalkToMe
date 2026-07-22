// Animal-Crossing-style "animalese" babble.
// We synthesize a short WAV of pitched blips — one per character of the reply —
// entirely on-device, so it stays perfectly in sync with a typewriter reveal
// that advances at exactly MS_PER_CHAR per character.
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

const SAMPLE_RATE = 22050;
export const MS_PER_CHAR = 55; // typewriter + audio slot duration (shared → in sync)

const SLOT = Math.round((SAMPLE_RATE * MS_PER_CHAR) / 1000); // samples per character
const TONE = Math.round(SLOT * 0.72); // voiced portion of each slot; rest is a tiny gap
const MAX_CHARS = 200; // cap synthesis work for very long replies

// pleasant pentatonic-ish steps (semitones) so consecutive blips sound musical
const SCALE = [0, 2, 4, 7, 9, 12, 7, 4];

function isVoiced(ch: string): boolean {
  return /[a-zA-ZÀ-ÿ0-9]/.test(ch);
}

// Build a mono 16-bit PCM WAV for `text`. `pitch` = base frequency (Hz) → per-character voice.
function synthWav(text: string, pitch: number): Uint8Array {
  const chars = Array.from(text).slice(0, MAX_CHARS);
  const n = Math.max(1, chars.length);
  const dataSamples = n * SLOT;
  const dataBytes = dataSamples * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buf);

  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  // RIFF / WAVE header
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);

  let off = 44;
  for (let c = 0; c < chars.length; c++) {
    const ch = chars[c];
    const voiced = isVoiced(ch);
    const step = SCALE[(ch.charCodeAt(0) + c) % SCALE.length];
    const freq = pitch * Math.pow(2, step / 12);
    for (let i = 0; i < SLOT; i++) {
      let sample = 0;
      if (voiced && i < TONE) {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, i / (SAMPLE_RATE * 0.006));
        const decay = Math.exp((-3.2 * i) / TONE);
        const env = attack * decay;
        const wave =
          Math.sin(2 * Math.PI * freq * t) * 0.72 +
          Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.18; // blippy square edge
        sample = env * wave * 0.5;
      }
      const v = Math.max(-1, Math.min(1, sample));
      view.setInt16(off, v * 32767, true);
      off += 2;
    }
  }
  return new Uint8Array(buf);
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function toBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const nn = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64[(nn >> 18) & 63] + B64[(nn >> 12) & 63] + B64[(nn >> 6) & 63] + B64[nn & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const nn = bytes[i] << 16;
    out += B64[(nn >> 18) & 63] + B64[(nn >> 12) & 63] + '==';
  } else if (rem === 2) {
    const nn = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += B64[(nn >> 18) & 63] + B64[(nn >> 12) & 63] + B64[(nn >> 6) & 63] + '=';
  }
  return out;
}

let currentPlayer: any = null;
let currentWebAudio: any = null;

export async function initBabbleAudio(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    /* noop */
  }
}

// How long this babble will play (ms) — matches the typewriter length exactly.
export function babbleDurationMs(text: string): number {
  const n = Math.min(Array.from(text).length, MAX_CHARS);
  return Math.max(MS_PER_CHAR, n * MS_PER_CHAR);
}

export async function playBabble(text: string, pitch: number = 340): Promise<void> {
  await stopBabble();
  if (!text) return;
  try {
    const bytes = synthWav(text, pitch);
    if (Platform.OS === 'web') {
      const b64 = toBase64(bytes);
      const AudioCtor = (globalThis as any).Audio;
      if (!AudioCtor) return;
      const audio = new AudioCtor(`data:audio/wav;base64,${b64}`);
      currentWebAudio = audio;
      await audio.play().catch(() => {});
    } else {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      const file = new File(Paths.cache, `babble-${Date.now()}.wav`);
      try {
        if (file.exists) file.delete();
      } catch {
        /* noop */
      }
      file.create();
      file.write(bytes);
      const player = createAudioPlayer({ uri: file.uri });
      currentPlayer = player;
      player.play();
    }
  } catch (e) {
    console.log('babble error', e);
  }
}

export async function stopBabble(): Promise<void> {
  try {
    if (currentWebAudio) {
      currentWebAudio.pause();
      currentWebAudio = null;
    }
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }
  } catch {
    /* noop */
  }
}

export async function cleanupBabble(): Promise<void> {
  await stopBabble();
}
