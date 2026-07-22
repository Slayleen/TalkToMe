// Cozy items catalog for wardrobe + shop (v1 aesthetic)
export type Item = {
  id: string;
  name: string;
  category: 'outfit' | 'room' | 'prop' | 'frame';
  price: number;
  currency: 'coin' | 'gem';
  color: string;
  emoji: string;
  owned?: boolean;
  equipped?: boolean;
};

export const ITEMS: Item[] = [
  { id: 'i1', name: 'Ducky PJs',        category: 'outfit', price: 60,   currency: 'coin', color: '#F6DA80', emoji: '🦆' },
  { id: 'i2', name: 'Peach Dress',      category: 'outfit', price: 3000, currency: 'coin', color: '#F5C89C', emoji: '👗' },
  { id: 'i3', name: 'Cottage Sweater',  category: 'outfit', price: 850,  currency: 'coin', color: '#A8D8B4', emoji: '🧶', owned: true, equipped: true },
  { id: 'i4', name: 'Plaid Skirt',      category: 'outfit', price: 1200, currency: 'coin', color: '#F0A5A0', emoji: '🎀' },
  { id: 'i5', name: 'Beret + Coat',     category: 'outfit', price: 1400, currency: 'coin', color: '#A8C4E0', emoji: '🎨' },
  { id: 'i6', name: 'Teahouse Room',    category: 'room',   price: 5000, currency: 'coin', color: '#A8C4E0', emoji: '🏡' },
  { id: 'i7', name: 'Meadow Room',      category: 'room',   price: 4000, currency: 'coin', color: '#A8D8B4', emoji: '🌿', owned: true },
  { id: 'i8', name: 'Starlight Room',   category: 'room',   price: 6, currency: 'gem', color: '#C7BEE8', emoji: '⭐' },
  { id: 'i9', name: 'Boba Cup',         category: 'prop',   price: 500,  currency: 'coin', color: '#F5C89C', emoji: '🧋' },
  { id: 'i10', name: 'Sparkle Wand',    category: 'prop',   price: 8,    currency: 'gem',  color: '#F0A5A0', emoji: '✨' },
  { id: 'i11', name: 'Sleepy Kitten',   category: 'prop',   price: 12,   currency: 'gem',  color: '#F6DA80', emoji: '🐱' },
  { id: 'i12', name: 'Cherry Frame',    category: 'frame',  price: 300,  currency: 'coin', color: '#F0A5A0', emoji: '🌸' },
  { id: 'i13', name: 'Moon Frame',      category: 'frame',  price: 4,    currency: 'gem',  color: '#C7BEE8', emoji: '🌙' },
];

export const CATEGORIES = [
  { key: 'outfit', label: 'Outfits', emoji: '👗' },
  { key: 'room',   label: 'Rooms',   emoji: '🏡' },
  { key: 'prop',   label: 'Props',   emoji: '✨' },
  { key: 'frame',  label: 'Frames',  emoji: '🖼️' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];

export const GACHA_BANNERS = [
  {
    id: 'teahouse',
    title: 'Teahouse Debut',
    subtitle: 'cozy first pull ✿',
    emoji: '🍵',
    tint: '#F0A5A0',
    price1: 4, price10: 30,
    odds: [
      { rarity: 'Common',    chance: '78%', color: '#A8D8B4' },
      { rarity: 'Rare',      chance: '18%', color: '#A8C4E0' },
      { rarity: 'Epic',      chance: '3.5%', color: '#F0A5A0' },
      { rarity: 'Legendary', chance: '0.5%', color: '#F6DA80' },
    ],
  },
  {
    id: 'meadow',
    title: 'Meadow Picnic',
    subtitle: 'limited · 4d 12h',
    emoji: '🌸',
    tint: '#A8D8B4',
    price1: 5, price10: 40,
    odds: [
      { rarity: 'Common',    chance: '75%', color: '#A8D8B4' },
      { rarity: 'Rare',      chance: '20%', color: '#A8C4E0' },
      { rarity: 'Epic',      chance: '4%',  color: '#F0A5A0' },
      { rarity: 'Legendary', chance: '1%',  color: '#F6DA80' },
    ],
  },
];
