# Talk To Me — PRD

## Original problem statement
Build off the TalkToMe repo (cozy anime language-practice app). Add STT for users
talking to the chatbot, and Animal-Crossing-style babbling sounds for the chatbots
in sync with the transcript. Follow-up: improve clothing options + the gacha
("pulling") page, remove direct-buy, and make the graphics less "AI".

## Architecture
- Frontend: Expo Router (SDK 54), React Native. Screens: index, auth (login/signup),
  (tabs): home/wardrobe/gacha/account, session (speaking/summary).
- Backend: FastAPI + Motor (MongoDB, local). JWT auth (+ optional Google). Groq for
  Whisper STT (`whisper-large-v3-turbo`) and Llama chat (`llama-3.3-70b-versatile`).
- Audio: expo-audio (native mic recording + playback), MediaRecorder on web.
  Babble = on-device synthesized WAV (animalese), no external key.

## Personas
- Teen/young-adult language learner who prefers speaking practice with a cute companion.

## Core requirements (static)
- Voice-only speaking sessions: mic → transcribe → LLM reply.
- Character replies "babble" (Animal Crossing style) in sync with a typewriter reveal.
- Per-character babble voice pitch (Luna higher, Mika lower).
- Cozy, hand-crafted (non-AI-slop) visuals; gamified wardrobe + gacha.

## Implemented (2026-07-22)
- Ported TalkToMe repo into workspace; fixed local Mongo (removed TLS), added
  JWT_SECRET/GROQ_API_KEY env, groq+authlib deps.
- STT: native recording via expo-audio (`useAudioRecorder`) + web MediaRecorder fallback,
  contextual mic permission handling (+ Open Settings on denial).
- Babble: `src/utils/tts.ts` synthesizes a pitched-blip WAV per reply; typewriter reveal
  advances at MS_PER_CHAR in lock-step → audio + text stay in sync. Per-character pitch.
- Wardrobe redesign: rarity ribbons + collectible-slot frames, owned/locked states,
  per-category "Wear" equip, "currently wearing" chip.
- Gacha redesign: flat crafted banner (removed gradient + twinkles), "What's inside"
  rarity showcase, removed "Or buy directly" section, tab renamed Gacha.

## Implemented (2026-07-22, later)
- GROQ_API_KEY set → backend groq:true; STT + chat validated (testing agent 10/10 backend).
- Functional gacha PULLS: rarity roll from banner odds → epic/legendary unlocks a NEW
  CHARACTER (if any un-owned), else clothes/backgrounds; duplicates → +50 coins. Animated
  reveal modal (single + 10-pull grid), gem spend + "not enough gems" guard.
- Shared InventoryProvider store (src/store/inventory.tsx): owned chars/items, equipped,
  coins, gems; persisted via storage util. Wired into gacha, wardrobe, home.
- Wardrobe now reads the store (owned/equipped/coins) + cycles owned characters.
- Home locks un-owned characters (overlay + "Pull to Unlock"); shows gems/coins.
- Starting balance: 50 gems / 240 coins.
- Fixed AuthScreen web crash: googleAuth hook is inert + Gmail button hidden when no
  Google client id configured (signup/login now render on web).

## Backlog
- P1: More pullable characters (needs new character art from user).
- P1: Award gems/coins on completing a speaking session; persist to backend.
- P2: Auth-gate (tabs)/session routes; migrate deprecated shadow*/pointerEvents (web warnings).

## Next tasks
- User to provide Groq key; then run testing_agent on /api/chat/transcribe & /api/chat/message.
