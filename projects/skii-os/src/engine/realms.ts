import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { AmbienceFamily } from './ambience';

export interface Realm {
  id: string;
  title: string;
  subtitle: string;
  lore: string;
  file: string;
  acc1: string;
  acc2: string;
  particle: number;
  ambient: AmbienceFamily;
  series: string;
  tint: string;
}

const FALLBACK: Realm[] = [
  {
    id: 'realm_0', title: 'Skii OS', subtitle: 'CINEMA DECK', lore: '',
    file: 'wall_titan.jpg', acc1: '#FFC65C', acc2: '#7FA6C9', particle: 14,
    ambient: 'smoke', series: 'Attack on Titan', tint: '#992A0C06',
  },
];

export function useRealms(): { realms: Realm[]; loading: boolean } {
  const [realms, setRealms] = useState<Realm[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('realms.json')
      .then((r) => r.json())
      .then((data: Realm[]) => {
        if (!alive || !Array.isArray(data) || data.length === 0) return;
        setRealms(data);
      })
      .catch(() => { /* the fallback realm keeps the stage alive */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { realms, loading };
}

/**
 * The realm sequence, shuffled the way the television shuffles it: the order
 * is a permutation of the manifest, held in state so it survives a reload.
 */
export function useRealmOrder(realms: Realm[]): {
  order: number[];
  shuffle: () => void;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
} {
  const [order, setOrder] = useState<number[]>([]);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (realms.length === 0) return;
    setOrder((prev) => {
      if (prev.length === realms.length) return prev;
      const next = realms.map((_, i) => i);
      // deterministic shuffle so the first load is the same every time
      let seed = 20261020;
      for (let i = next.length - 1; i > 0; i--) {
        seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
        const j = (seed >>> 0) % (i + 1);
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setPosition(0);
  }, [realms.length]);

  const shuffle = useMemo(() => () => {
    setOrder((prev) => {
      const next = prev.length ? [...prev] : [];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setPosition(0);
  }, []);

  return { order, shuffle, position, setPosition };
}
