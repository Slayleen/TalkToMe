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

## Backlog
- P0: Add GROQ_API_KEY → full E2E test of STT + chat + babble.
- P1: Make gacha pulls functional (animation + reveal + add to wardrobe).
- P2: Persist wardrobe equips to backend; session summary rewards; more characters.

## Next tasks
- User to provide Groq key; then run testing_agent on /api/chat/transcribe & /api/chat/message.
