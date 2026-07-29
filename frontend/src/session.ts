// Shared shape for a just-finished speaking session, handed off from
// app/session/speaking.tsx to app/session/summary.tsx via storage (not route
// params, since the transcript can be too large to safely fit in a URL).
export type SessionLine = { from: 'user' | 'bot'; text: string };
export type SessionCorrection = { wrong: string; right: string; hint: string };

export type SessionRecord = {
  characterId: string;
  secs: number;
  transcript: SessionLine[];
  corrections: SessionCorrection[];
  coinsEarned: number;
  streak: number;
};

export const LAST_SESSION_KEY = 'tt_last_session_v1';

/**
 * Reward formula lives in one place so the number the summary screen shows
 * is always exactly what got credited to coins (local store + backend).
 */
export function calcCoinsEarned(userExchanges: number, corrections: SessionCorrection[]): number {
  if (userExchanges <= 0) return 0;
  const base = 10;
  const perExchange = 5;
  const cleanTalkBonus = corrections.length === 0 ? 10 : 0;
  return Math.min(base + perExchange * userExchanges + cleanTalkBonus, 150);
}