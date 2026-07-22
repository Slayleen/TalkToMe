// Load our custom display font (Fredoka) via expo-font.
// Falls back gracefully — if load fails, screens use system font.
import { useFonts } from 'expo-font';

export const useDisplayFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    Fredoka: require('../../assets/fonts/Fredoka-SemiBold.ttf'),
  });
