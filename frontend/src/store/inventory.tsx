// Shared inventory: owned characters, owned cosmetics, equipped slots, coins & gems.
// Persisted best-effort via the storage util so pulls stick across app launches.
import React, { createContext, useContext, useEffect, useState } from 'react';

import { storage } from '@/src/utils/storage';
import { CATEGORIES, CategoryKey, ITEMS } from '@/src/items';

type Equip = Record<CategoryKey, string | undefined>;

type State = {
  ownedItems: string[];
  ownedChars: string[];
  equipped: Equip;
  activeChar: string;
  coins: number;
  gems: number;
};

const KEY = 'tt_inventory_v1';

const buildDefaults = (): State => {
  const equipped = {} as Equip;
  CATEGORIES.forEach((c) => (equipped[c.key] = undefined));
  ITEMS.forEach((i) => {
    if (i.equipped) equipped[i.category] = i.id;
  });
  return {
    ownedItems: ITEMS.filter((i) => i.owned).map((i) => i.id),
    ownedChars: ['luna'],
    equipped,
    activeChar: 'luna',
    coins: 240,
    gems: 50,
  };
};

type Ctx = State & {
  hydrated: boolean;
  hasItem: (id: string) => boolean;
  hasChar: (id: string) => boolean;
  addItems: (ids: string[]) => void;
  addChars: (ids: string[]) => void;
  equip: (cat: CategoryKey, id: string) => void;
  setActiveChar: (id: string) => void;
  spendGems: (n: number) => boolean;
  addCoins: (n: number) => void;
  addGems: (n: number) => void;
};

const InventoryContext = createContext<Ctx | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(buildDefaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem<string>(KEY, '');
        if (raw) {
          const saved = JSON.parse(raw) as Partial<State>;
          setState((s) => ({ ...s, ...saved, equipped: { ...s.equipped, ...(saved.equipped || {}) } }));
        }
      } catch {
        /* noop */
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated) storage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value: Ctx = {
    ...state,
    hydrated,
    hasItem: (id) => state.ownedItems.includes(id),
    hasChar: (id) => state.ownedChars.includes(id),
    addItems: (ids) =>
      setState((s) => ({ ...s, ownedItems: Array.from(new Set([...s.ownedItems, ...ids])) })),
    addChars: (ids) =>
      setState((s) => ({ ...s, ownedChars: Array.from(new Set([...s.ownedChars, ...ids])) })),
    equip: (cat, id) => setState((s) => ({ ...s, equipped: { ...s.equipped, [cat]: id } })),
    setActiveChar: (id) => setState((s) => ({ ...s, activeChar: id })),
    spendGems: (n) => {
      let ok = false;
      setState((s) => {
        if (s.gems >= n) {
          ok = true;
          return { ...s, gems: s.gems - n };
        }
        return s;
      });
      return ok;
    },
    addCoins: (n) => setState((s) => ({ ...s, coins: s.coins + n })),
    addGems: (n) => setState((s) => ({ ...s, gems: s.gems + n })),
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): Ctx {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
