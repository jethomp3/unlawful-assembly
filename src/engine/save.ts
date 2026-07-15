import type { GameState } from './types';

const SAVE_KEY = 'ua.save.v1';
const TOMBSTONE_KEY = 'ua.tombstones.v1';
const HISCORE_KEY = 'ua.hiscores.v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the march goes on, unsaved.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== 1) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* noop */
  }
}

export function hasSave(): boolean {
  return loadGame() !== null;
}

/** Roadside memorials: persist across runs, shown on future playthroughs. */
export interface Tombstone {
  name: string;
  day: number;
  mile: number;
  reason: string;
  epitaph: string;
}

export function loadTombstones(): Tombstone[] {
  try {
    const raw = localStorage.getItem(TOMBSTONE_KEY);
    return raw ? (JSON.parse(raw) as Tombstone[]) : [];
  } catch {
    return [];
  }
}

export function addTombstone(t: Tombstone): void {
  try {
    const all = loadTombstones();
    all.push(t);
    // keep the roadside from getting crowded
    localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(all.slice(-30)));
  } catch {
    /* noop */
  }
}

export interface HighScore {
  score: number;
  classId: string;
  outcome: string;
  date: string;
}

export function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(HISCORE_KEY);
    return raw ? (JSON.parse(raw) as HighScore[]) : [];
  } catch {
    return [];
  }
}

export function addHighScore(entry: HighScore): void {
  try {
    const all = loadHighScores();
    all.push(entry);
    all.sort((a, b) => b.score - a.score);
    localStorage.setItem(HISCORE_KEY, JSON.stringify(all.slice(0, 10)));
  } catch {
    /* noop */
  }
}
