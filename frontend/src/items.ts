// Cozy items catalog for wardrobe + shop (v1 aesthetic)
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Item = {
  id: string;
  name: string;
  category: 'outfit' | 'room' | 'prop' | 'frame';
  price: number;
  currency: 'coin' | 'gem';
  color: string;
  emoji: string;
  rarity: Rarity;
  owned?: boolean;
  equipped?: boolean;
};

// Hand-picked cozy palette per rarity (no purple slop) — used for card frames.
export const RARITY: Record<Rarity, { label: string; tint: string; ring: string; border: number }> = {
  common: { label: 'Common', tint: '#EAF3EC', ring: '#A8D8B4', border: 2 },
  rare: { label: 'Rare', tint: '#E7EFF8', ring: '#8FB6DE', border: 2.5 },
  epic: { label: 'Epic', tint: '#FBE7E9', ring: '#E88A94', border: 3 },
  legendary: { label: 'Legendary', tint: '#FCF3D6', ring: '#E8C24A', border: 3.5 },
};

export const ITEMS: Item[] = [
  // Outfits
  { id: 'i1', name: 'Ducky PJs', category: 'outfit', price: 60, currency: 'coin', color: '#F6DA80', emoji: '🦆', rarity: 'common', owned: true },
  { id: 'i3', name: 'Cottage Sweater', category: 'outfit', price: 850, currency: 'coin', color: '#A8D8B4', emoji: '🧶', rarity: 'common', owned: true, equipped: true },
  { id: 'i16', name: 'Cozy Overalls', category: 'outfit', price: 900, currency: 'coin', color: '#F5C89C', emoji: '🧵', rarity: 'rare', owned: true },
  { id: 'i2', name: 'Peach Dress', category: 'outfit', price: 3000, currency: 'coin', color: '#F5C89C', emoji: '👗', rarity: 'rare' },
  { id: 'i4', name: 'Plaid Skirt', category: 'outfit', price: 1200, currency: 'coin', color: '#F0A5A0', emoji: '🎀', rarity: 'rare' },
  { id: 'i5', name: 'Beret + Coat', category: 'outfit', price: 1400, currency: 'coin', color: '#A8C4E0', emoji: '🎨', rarity: 'epic' },
  { id: 'i14', name: 'Sailor Top', category: 'outfit', price: 1600, currency: 'coin', color: '#A8C4E0', emoji: '⚓', rarity: 'epic' },
  { id: 'i15', name: 'Cherry Kimono', category: 'outfit', price: 14, currency: 'gem', color: '#F0A5A0', emoji: '🌸', rarity: 'legendary' },

  // Rooms
  { id: 'i7', name: 'Meadow Room', category: 'room', price: 4000, currency: 'coin', color: '#A8D8B4', emoji: '🌿', rarity: 'common', owned: true, equipped: true },
  { id: 'i6', name: 'Teahouse Room', category: 'room', price: 5000, currency: 'coin', color: '#A8C4E0', emoji: '🏡', rarity: 'epic' },
  { id: 'i8', name: 'Starlight Room', category: 'room', price: 6, currency: 'gem', color: '#C7BEE8', emoji: '⭐', rarity: 'legendary' },

  // Props
  { id: 'i9', name: 'Boba Cup', category: 'prop', price: 500, currency: 'coin', color: '#F5C89C', emoji: '🧋', rarity: 'common', owned: true },
  { id: 'i10', name: 'Sparkle Wand', category: 'prop', price: 8, currency: 'gem', color: '#F0A5A0', emoji: '✨', rarity: 'rare' },
  { id: 'i11', name: 'Sleepy Kitten', category: 'prop', price: 12, currency: 'gem', color: '#F6DA80', emoji: '🐱', rarity: 'epic' },

  // Frames
  { id: 'i12', name: 'Cherry Frame', category: 'frame', price: 300, currency: 'coin', color: '#F0A5A0', emoji: '🌸', rarity: 'common', owned: true },
  { id: 'i13', name: 'Moon Frame', category: 'frame', price: 4, currency: 'gem', color: '#C7BEE8', emoji: '🌙', rarity: 'rare' },
  { id: 'i17', name: 'Rainbow Frame', category: 'frame', price: 10, currency: 'gem', color: '#A8D8B4', emoji: '🌈', rarity: 'epic' },
];

export const CATEGORIES = [
  { key: 'outfit', label: 'Outfits', emoji: '👗' },
  { key: 'room', label: 'Rooms', emoji: '🏡' },
  { key: 'prop', label: 'Props', emoji: '✨' },
  { key: 'frame', label: 'Frames', emoji: '🖼️' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const GACHA_BANNERS = [
  {
    id: 'teahouse',
    title: 'Teahouse Debut',
    subtitle: 'cozy first pull',
    emoji: '🍵',
    tint: '#F3B7B2',
    price1: 4,
    price10: 30,
    odds: [
      { rarity: 'Common', chance: '78%', color: '#A8D8B4' },
      { rarity: 'Rare', chance: '18%', color: '#8FB6DE' },
      { rarity: 'Epic', chance: '3.5%', color: '#E88A94' },
      { rarity: 'Legendary', chance: '0.5%', color: '#E8C24A' },
    ],
  },
  {
    id: 'meadow',
    title: 'Meadow Picnic',
    subtitle: 'limited · 4d 12h',
    emoji: '🌸',
    tint: '#A8D8B4',
    price1: 5,
    price10: 40,
    odds: [
      { rarity: 'Common', chance: '75%', color: '#A8D8B4' },
      { rarity: 'Rare', chance: '20%', color: '#8FB6DE' },
      { rarity: 'Epic', chance: '4%', color: '#E88A94' },
      { rarity: 'Legendary', chance: '1%', color: '#E8C24A' },
    ],
  },
];
