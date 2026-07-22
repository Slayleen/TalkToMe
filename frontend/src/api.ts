import { storage } from '@/src/utils/storage';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const TOKEN_KEY = 'tt_token';

export async function getToken(): Promise<string | null> {
  return (await storage.secureGet<string>(TOKEN_KEY, '')) || null;
}
export async function setToken(t: string): Promise<void> {
  await storage.secureSet<string>(TOKEN_KEY, t);
}
export async function clearToken(): Promise<void> {
  await storage.secureRemove(TOKEN_KEY);
}

async function req(path: string, opts: RequestInit = {}, isForm = false): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(opts.headers as any),
  };
  if (!isForm) headers['content-type'] = 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;
  const url = `${BASE}/api${path}`;
  console.log(`Request: ${opts.method || 'GET'} ${url}`);
  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  console.log(`Response: ${res.status}`, body);
  if (!res.ok) {
    let errorMsg = body?.detail || body?.message || text || `HTTP ${res.status}`;
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    } else if (typeof errorMsg === 'object') {
      errorMsg = JSON.stringify(errorMsg);
    }
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).body = body;
    throw err;
  }
  return body;
}

export type User = {
  id: string; email: string; created_at: string;
  coins: number; gems: number; streak: number;
  level: string; language: string;
  owned_items: string[];
  equipped: { outfit: string | null; room: string | null; prop: string | null; frame: string | null };
};

export type ChatReply = {
  reply: string;
  correction: { wrong: string; right: string; hint: string } | null;
};

export const api = {
  signup: (email: string, password: string) =>
    req('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  googleAuth: (idToken: string) =>
    req('/auth/google', { method: 'POST', body: JSON.stringify({ id_token: idToken }) }),
  me: (): Promise<User> => req('/auth/me'),
  updateState: (patch: Partial<User> & { delta_coins?: number; delta_streak?: number }): Promise<User> =>
    req('/auth/state', { method: 'PATCH', body: JSON.stringify(patch) }),
  chat: (payload: {
    user_message: string; character_name: string; character_vibe: string;
    target_language: string; level: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<ChatReply> =>
    req('/chat/message', { method: 'POST', body: JSON.stringify(payload) }),
  transcribe: async (audio: any): Promise<{ text: string; language: string | null }> => {
    const form = new FormData();
    // React Native: pass {uri,name,type} object; web: pass Blob
    form.append('file', audio as any, (audio as any).name || 'speech.webm');
    return req('/chat/transcribe', { method: 'POST', body: form as any }, true);
  },
};
