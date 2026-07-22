import { ImageSourcePropType } from 'react-native';

import { Rarity } from '@/src/items';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Character = {
  id: string;
  name: string;
  tagline: string;
  language: string;
  languageEmoji: string;
  level: CEFRLevel;
  accent: string; // hex tint for cards
  vibe: string;
  image: ImageSourcePropType;
  babblePitch: number; // base frequency (Hz) for this character's animalese voice
};

export const CHARACTERS: Character[] = [
  {
    id: 'luna',
    name: 'Luna',
    tagline: 'Cozy teahouse buddy',
    language: 'Spanish',
    languageEmoji: '🇪🇸',
    level: 'A2',
    accent: '#FFB7B2',
    vibe: 'Warm, patient, loves to tell stories over tea. Perfect for beginners who want to relax into the language.',
    image: require('../assets/characters/luna.png'),
    babblePitch: 380,
    rarity: 'epic',
  },
  {
    id: 'mika',
    name: 'Mika',
    tagline: 'Bookish sunshine',
    language: 'Spanish',
    languageEmoji: '🇪🇸',
    level: 'B1',
    accent: '#C7CEEA',
    vibe: 'Playful, quick with a joke, will gently correct you and drop a new phrase you\'ve never heard.',
    image: require('../assets/characters/mika.png'),
    babblePitch: 300,
    rarity: 'legendary',
  },
];

export const CEFR_LEVELS: { level: CEFRLevel; label: string }[] = [
  { level: 'A1', label: 'Just starting' },
  { level: 'A2', label: 'Basic phrases' },
  { level: 'B1', label: 'Conversational' },
  { level: 'B2', label: 'Confident' },
  { level: 'C1', label: 'Advanced' },
  { level: 'C2', label: 'Fluent' },
];

export type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: string;
};

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', from: 'bot', text: '¡Hola! Soy Luna. ¿Cómo te llamas? 🍵', time: '2:14 PM' },
  { id: '2', from: 'user', text: 'Hola Luna, me llamo Ana!', time: '2:14 PM' },
  { id: '3', from: 'bot', text: '¡Qué lindo nombre! ¿Qué te gusta hacer los fines de semana?', time: '2:15 PM' },
  { id: '4', from: 'user', text: 'Me gusta leer y... uh... how do you say hang out?', time: '2:15 PM' },
  { id: '5', from: 'bot', text: '"Pasar el rato" — ¡pásame ese rato conmigo entonces! 💗', time: '2:16 PM' },
];
