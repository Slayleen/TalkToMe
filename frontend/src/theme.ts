// Talk To Me — warmer, cozier theme tokens (Purrfect Tale / Little Corner Tea House vibe)
export const colors = {
  // Warm surfaces (slight yellow undertone, less "screen white")
  surface: '#FBF3DE',        // warm cream
  surfaceSoft: '#F6EBCE',    // deeper cream
  surfaceSecondary: '#FFFBF0', // paper
  surfaceTertiary: '#F0E4C4',
  surfaceInverse: '#3E2A1F',
  onSurface: '#4A3219',         // warm dark brown (main text)
  onSurfaceSecondary: '#4A3219',
  onSurfaceTertiary: '#8A6E48', // muted brown for meta text
  onSurfaceInverse: '#FFFBF0',

  // Brand pastels — slightly warmer, more saturated (less "corporate")
  brandPrimary: '#F0A5A0',   // rose blush
  onBrandPrimary: '#4A3219',
  brandSecondary: '#A8D8B4', // sage mint
  onBrandSecondary: '#2B443A',
  brandTertiary: '#A8C4E0',  // dusty sky
  onBrandTertiary: '#2C324B',
  brandYellow: '#F6DA80',    // buttercream
  onBrandYellow: '#5A4A17',
  brandPeach: '#F5C89C',
  brandDeepRose: '#D67280',

  // Semantic
  success: '#A8D8B4',
  onSuccess: '#2B443A',
  warning: '#F5C89C',
  onWarning: '#4A3219',
  error: '#E88A94',
  onError: '#4A1B20',
  info: '#A8C4E0',
  onInfo: '#2C324B',

  // Borders — visible, ink-like (defining stroke look)
  border: '#D4B896',
  borderStrong: '#8A6E48',
  borderInk: '#4A3219',
  divider: '#EBDDBB',
  scrim: 'rgba(74,50,25,0.55)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };

export const typography = {
  display: 'Fredoka',   // chunky rounded — used on titles/headings
  text: 'System',
  size: {
    xs: 11, sm: 12, base: 14, md: 15, lg: 16, xl: 20, '2xl': 24, '3xl': 30, '4xl': 38,
  },
  weight: {
    regular: '400' as const, medium: '500' as const, semibold: '600' as const,
    bold: '700' as const, heavy: '800' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#4A3219', shadowOpacity: 0.14, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  soft: {
    shadowColor: '#4A3219', shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
};

// Scene assets
export const scenes = {
  teahouse: require('../assets/scenes/teahouse.png'),
  garden: require('../assets/scenes/garden.png'),
  bedroom: require('../assets/scenes/bedroom.png'),
  wardrobe: require('../assets/scenes/wardrobe.png'),
  shop: require('../assets/scenes/shop.png'),
  cafe: require('../assets/scenes/cafe.png'),
  celebration: require('../assets/scenes/celebration.png'),
  account: require('../assets/scenes/account.png'),
};
