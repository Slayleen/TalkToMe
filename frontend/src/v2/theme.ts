// v2 theme — cozy game aesthetic (Purrfect Tale / Little Corner Tea House vibe)
export const v2Colors = {
  cream: '#F6EED8',
  creamDeep: '#EFE4C6',
  paper: '#FFF9E8',
  ink: '#3E2E1F',
  inkSoft: '#6B5136',
  pink: '#F6B8C4',
  pinkDeep: '#E28FA1',
  peach: '#FFCFA6',
  yellow: '#FFE79C',
  mint: '#C8E4C1',
  mintDeep: '#8FB786',
  sky: '#B8D3E8',
  skyDeep: '#7FA6C6',
  navy: '#2E4257',
  darkGreen: '#4E6B4A',
  gold: '#D9A64B',
  border: '#D8C8A4',
  shadow: '#3E2E1F',
};

export const v2Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const v2Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

// Currency mock data
export const V2_STATE = {
  user: 'Ana',
  coins: 397,
  gems: 16,
  hearts: 12,
  streak: 7,
  level: 'A2',
  language: '🇪🇸 Spanish',
};

export type V2Item = {
  id: string;
  name: string;
  category: 'outfit' | 'bg' | 'prop' | 'pfp';
  price: number;
  currency: 'coin' | 'gem';
  color: string;
  emoji: string;
  owned?: boolean;
};

export const V2_ITEMS: V2Item[] = [
  { id: 'i1', name: 'Ducky Pajamas',   category: 'outfit', price: 60,   currency: 'coin', color: '#FFE79C', emoji: '🦆' },
  { id: 'i2', name: 'Peach Dress',      category: 'outfit', price: 3000, currency: 'coin', color: '#FFCFA6', emoji: '👗' },
  { id: 'i3', name: 'Cottage Sweater',  category: 'outfit', price: 850,  currency: 'coin', color: '#C8E4C1', emoji: '🧶', owned: true },
  { id: 'i4', name: 'Plaid Skirt',      category: 'outfit', price: 1200, currency: 'coin', color: '#F6B8C4', emoji: '🎀' },
  { id: 'i5', name: 'Teahouse Room',    category: 'bg',     price: 5000, currency: 'coin', color: '#B8D3E8', emoji: '🏡' },
  { id: 'i6', name: 'Meadow',           category: 'bg',     price: 4000, currency: 'coin', color: '#C8E4C1', emoji: '🌿', owned: true },
  { id: 'i7', name: 'Boba Cup',         category: 'prop',   price: 500,  currency: 'coin', color: '#FFCFA6', emoji: '🧋' },
  { id: 'i8', name: 'Sparkle Wand',     category: 'prop',   price: 8,    currency: 'gem',  color: '#F6B8C4', emoji: '✨' },
  { id: 'i9', name: 'Sleepy Kitten',    category: 'prop',   price: 12,   currency: 'gem',  color: '#FFE79C', emoji: '🐱' },
];

export const V2_CATEGORIES = [
  { key: 'outfit', label: 'Outfits',    icon: '👗' },
  { key: 'bg',     label: 'Rooms',      icon: '🏡' },
  { key: 'prop',   label: 'Props',      icon: '✨' },
  { key: 'pfp',    label: 'Frames',     icon: '🖼️' },
] as const;
