import type { ClassId, GameState, PartyMember, StateDelta } from './types';

/** Starting resources; provided by the chosen class def in src/data/classes.ts. */
export interface StartingKit {
  money: number;
  supplies: number;
  medkits: number;
  bailFund: number;
  batteries: number;
  support: number;
  crackdown: number;
}

export function createInitialState(
  classId: ClassId,
  names: string[],
  kit: StartingKit,
  seed: number,
): GameState {
  const party: PartyMember[] = names.map((name) => ({
    name,
    health: 100,
    morale: 80,
    status: 'ok',
  }));

  return {
    version: 1,
    seed,
    rngState: seed >>> 0,
    day: 1,
    miles: 0,
    routeIndex: 1, // route[0] is home; the first landmark ahead is route[1]
    weather: 'clear',
    pace: 'steady',
    profile: 'mixed',
    classId,
    money: kit.money,
    supplies: kit.supplies,
    medkits: kit.medkits,
    bailFund: kit.bailFund,
    batteries: kit.batteries,
    footage: 0,
    support: kit.support,
    crackdown: kit.crackdown,
    heat: 5,
    party,
    newsCycleSaturation: 0,
    flags: {},
    journal: [],
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const RESOURCE_KEYS = [
  'money',
  'supplies',
  'medkits',
  'bailFund',
  'batteries',
  'footage',
] as const;

const METER_KEYS = ['support', 'crackdown', 'heat'] as const;

/** Apply a declarative delta. Resources floor at 0; meters clamp to 0-100. */
export function applyDelta(state: GameState, delta: StateDelta): void {
  for (const key of RESOURCE_KEYS) {
    const d = delta[key];
    if (d !== undefined) state[key] = Math.max(0, Math.round(state[key] + d));
  }
  for (const key of METER_KEYS) {
    const d = delta[key];
    if (d !== undefined) state[key] = clamp(Math.round((state[key] + d) * 10) / 10, 0, 100);
  }
  // "Lose a day": time passes and the group still eats.
  if (delta.daysLost) {
    state.day += delta.daysLost;
    const mouths = state.party.filter(
      (m) => m.status !== 'gone' && m.status !== 'detained',
    ).length;
    state.supplies = Math.max(0, state.supplies - delta.daysLost * mouths * 2);
  }
}

export function livingMembers(state: GameState): PartyMember[] {
  return state.party.filter((m) => m.status !== 'gone' && m.status !== 'detained');
}

export function leader(state: GameState): PartyMember {
  return state.party[0]!;
}

export function addJournal(
  state: GameState,
  text: string,
  kind: GameState['journal'][number]['kind'] = 'event',
): void {
  state.journal.push({ day: state.day, text, kind });
  // localStorage guard: keep the journal bounded
  if (state.journal.length > 200) state.journal.splice(0, state.journal.length - 200);
}
