import { useEffect, useState } from 'react';

/**
 * Unique-visitor counter.
 *
 * GitHub Pages is static, so the number is kept by a tiny keyless counter API
 * (abacus.jasoncameron.dev, a CountAPI-compatible service). Uniqueness is
 * per-browser: the first visit increments the counter and sets a local flag;
 * every later visit only reads the current value. Clearing site data (or using
 * another browser/device) therefore counts as a new visitor.
 */
const ENDPOINT = 'https://abacus.jasoncameron.dev';
const NAMESPACE = 'graffgrid';
const COUNTER = 'unique-visitors';
const VISITOR_FLAG = 'gg:visit-counted';

let sharedRequest: Promise<number | null> | null = null;
let cachedValue: number | null = null;

function hasVisited(): boolean {
  try {
    return window.localStorage.getItem(VISITOR_FLAG) === '1';
  } catch {
    // Storage blocked (private mode / hardened browser): treat as a new visitor.
    return false;
  }
}

function markVisited(): void {
  try {
    window.localStorage.setItem(VISITOR_FLAG, '1');
  } catch {
    // Ignore: the flag is an optimisation, not a requirement.
  }
}

async function callCounter(action: 'hit' | 'get'): Promise<number | null> {
  try {
    const response = await fetch(`${ENDPOINT}/${action}/${NAMESPACE}/${COUNTER}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const value =
      typeof payload === 'object' && payload !== null
        ? (payload as { value?: unknown }).value
        : undefined;

    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return value;
  } catch {
    // Offline, blocked or rate-limited: render nothing rather than a wrong number.
    return null;
  }
}

async function requestCount(): Promise<number | null> {
  const firstVisit = !hasVisited();

  let value = await callCounter(firstVisit ? 'hit' : 'get');

  // Self-heal: a returning visitor should never create an increment, but if the
  // remote key has been reset or evicted, fall back to creating it again.
  if (value === null && !firstVisit) {
    value = await callCounter('hit');
  }

  if (value === null) return null;

  if (firstVisit) markVisited();
  cachedValue = value;
  return value;
}

export function useUniqueVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(cachedValue);

  useEffect(() => {
    let active = true;

    // Shared across mounts and StrictMode double-invocations so one page view
    // can never produce two increments.
    sharedRequest ??= requestCount();

    sharedRequest.then((value) => {
      if (active && value !== null) setCount(value);
    });

    return () => {
      active = false;
    };
  }, []);

  return count;
}
