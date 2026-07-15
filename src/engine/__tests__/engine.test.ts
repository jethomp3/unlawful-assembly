import { beforeEach, describe, expect, it } from 'vitest';
import { createRng, weightedPick } from '../rng';
import { applyDelta, createInitialState } from '../state';
import { computeScore } from '../score';
import { saveGame, loadGame, clearSave } from '../save';
import { advanceDay, type SimOptions } from '../sim';
import { applyEvent } from '../events';
import { classById } from '../../data/classes';
import { ALL_EVENTS } from '../../data/events';
import { ROUTE, FINAL_LANDMARK_ID } from '../../data/route';
import type { GameState } from '../types';

// localStorage stub for node
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

function freshState(seed = 12345): GameState {
  const def = classById('teacher');
  return createInitialState('teacher', ['You', 'Maria', 'Marcus', 'Rosa', 'Dee'], def.kit, seed);
}

describe('rng', () => {
  it('is deterministic from a seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('resumes an identical stream from a serialized state', () => {
    const a = createRng(7);
    a.next();
    a.next();
    const resumed = createRng(a.getState());
    const b = createRng(7);
    b.next();
    b.next();
    const bResumed = createRng(b.getState());
    for (let i = 0; i < 20; i++) expect(resumed.next()).toBe(bResumed.next());
  });

  it('weightedPick never returns zero-weight items', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      expect(weightedPick(rng, ['a', 'b'], (x) => (x === 'a' ? 0 : 1))).toBe('b');
    }
    expect(weightedPick(rng, ['a'], () => 0)).toBeUndefined();
  });
});

describe('applyDelta', () => {
  it('floors resources at zero and clamps meters to 0-100', () => {
    const s = freshState();
    applyDelta(s, { money: -99999, support: 500, crackdown: -500 });
    expect(s.money).toBe(0);
    expect(s.support).toBe(100);
    expect(s.crackdown).toBe(0);
  });

  it('daysLost passes time and burns supplies', () => {
    const s = freshState();
    const before = s.supplies;
    applyDelta(s, { daysLost: 2 });
    expect(s.day).toBe(3);
    expect(s.supplies).toBe(before - 2 * 5 * 2); // 5 mouths, 2 lbs each
  });
});

describe('save', () => {
  beforeEach(() => {
    store.clear();
  });

  it('round-trips state exactly', () => {
    const s = freshState();
    s.miles = 123.4;
    s.party[2]!.status = 'detained';
    saveGame(s);
    expect(loadGame()).toEqual(s);
  });

  it('discards on version mismatch', () => {
    const s = freshState();
    saveGame({ ...s, version: 99 as unknown as 1 });
    expect(loadGame()).toBeNull();
  });

  it('clearSave removes the save', () => {
    saveGame(freshState());
    clearSave();
    expect(loadGame()).toBeNull();
  });
});

describe('score', () => {
  it('applies the class multiplier to the subtotal', () => {
    const s = freshState();
    const x1 = computeScore(s, 1);
    const x3 = computeScore(s, 3);
    expect(x3.total).toBe(Math.round(x1.subtotal * 3));
    expect(x1.lines.length).toBeGreaterThan(3);
  });
});

describe('30-day scripted run', () => {
  function run(seed: number): GameState {
    const def = classById('organizer');
    const state = createInitialState(
      'organizer',
      ['You', 'Maria', 'Marcus', 'Rosa', 'Dee'],
      def.kit,
      seed,
    );
    state.supplies = 300; // enough to not starve immediately
    const rng = createRng(seed);
    const opts: SimOptions = {
      events: ALL_EVENTS,
      route: ROUTE,
      classDef: def,
      finalLandmarkId: FINAL_LANDMARK_ID,
      mode: 'march',
    };
    for (let i = 0; i < 30 && !state.over; i++) {
      const result = advanceDay(state, rng, opts);
      for (const item of result.items) {
        // Drive events like the UI would; always take the first choice.
        if (item.type === 'event') {
          applyEvent(state, rng, item.resolved, item.resolved.def.choices ? 0 : undefined);
        }
      }
    }
    return state;
  }

  it('is deterministic for a fixed seed', () => {
    expect(run(999)).toEqual(run(999));
  });

  it('keeps invariants over a month of marching', () => {
    const s = run(4242);
    expect(s.day).toBeGreaterThan(1);
    expect(s.miles).toBeGreaterThan(0);
    expect(s.support).toBeGreaterThanOrEqual(0);
    expect(s.support).toBeLessThanOrEqual(100);
    expect(s.crackdown).toBeGreaterThanOrEqual(0);
    expect(s.crackdown).toBeLessThanOrEqual(100);
    expect(s.supplies).toBeGreaterThanOrEqual(0);
    for (const m of s.party) {
      expect(m.health).toBeGreaterThanOrEqual(0);
      expect(m.health).toBeLessThanOrEqual(100);
    }
  });

  it('a steady march with no interruptions reaches the Capital near the deadline', () => {
    const def = classById('teacher');
    const state = createInitialState('teacher', ['A', 'B', 'C', 'D', 'E'], def.kit, 77);
    state.supplies = 9999; // isolate travel math from starvation
    const rng = createRng(77);
    const opts: SimOptions = {
      events: [],
      route: ROUTE,
      classDef: def,
      finalLandmarkId: FINAL_LANDMARK_ID,
      mode: 'march',
    };
    let days = 0;
    while (!state.over && days < 120) {
      advanceDay(state, rng, opts);
      days++;
    }
    expect(state.over?.kind).toBe('arrived');
    // Steady pace should land in the day-45..70 window: tight against the
    // day-60 demonstration, so detours and rests genuinely cost something.
    expect(state.day).toBeGreaterThan(45);
    expect(state.day).toBeLessThan(70);
  });

  it('crackdown ratchets upward even at low profile (balance guard)', () => {
    const def = classById('teacher');
    const state = createInitialState('teacher', ['A', 'B', 'C', 'D', 'E'], def.kit, 5);
    state.profile = 'low';
    const start = state.crackdown;
    const rng = createRng(5);
    const opts: SimOptions = {
      events: [], // no events: isolate the floor
      route: ROUTE,
      classDef: def,
      finalLandmarkId: FINAL_LANDMARK_ID,
      mode: 'march',
    };
    for (let i = 0; i < 20; i++) advanceDay(state, rng, opts);
    expect(state.crackdown).toBeGreaterThan(start);
  });
});
