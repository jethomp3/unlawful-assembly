// Seeded PRNG so saved runs are reproducible: rngState serializes into GameState.

export interface Rng {
  /** Uniform float in [0, 1). Advances state. */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** True with probability p. */
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Current internal state, for serialization. */
  getState(): number;
}

/** mulberry32 — small, fast, good enough for a trail game. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;

  function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    chance(p) {
      return next() < p;
    },
    pick(items) {
      if (items.length === 0) throw new Error('pick from empty array');
      return items[Math.floor(next() * items.length)]!;
    },
    getState() {
      return a;
    },
  };
}

/** Weighted pick. Weights <= 0 are never selected. Returns undefined if all weights are 0. */
export function weightedPick<T>(
  rng: Rng,
  items: readonly T[],
  weightOf: (item: T) => number,
): T | undefined {
  let total = 0;
  const weights = items.map((it) => {
    const w = Math.max(0, weightOf(it));
    total += w;
    return w;
  });
  if (total <= 0) return undefined;
  let roll = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]!;
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}
