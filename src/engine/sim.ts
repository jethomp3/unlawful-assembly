// advanceDay: the whole day tick, in Oregon Trail order.
// Pure-ish: mutates the passed state, returns a queue of things for the UI
// to show, each ending with "Press SPACE BAR to continue".

import type { GameState, PartyMember, Weather } from './types';
import type { Rng } from './rng';
import type { ClassDef, EventDef, LandmarkDef } from '../data/contentTypes';
import { TUNING, bailCost } from './meters';
import { addJournal, applyDelta } from './state';
import { rollEvent, type ResolvedEvent } from './events';

export type DayItem =
  | { type: 'note'; text: string; tone?: 'dim' | 'amber' | 'red' }
  | { type: 'event'; resolved: ResolvedEvent }
  | { type: 'landmark'; landmark: LandmarkDef }
  | { type: 'bail'; memberName: string; cost: number }
  | { type: 'gameOver' };

export interface DayResult {
  items: DayItem[];
}

export interface SimOptions {
  events: EventDef[];
  route: LandmarkDef[];
  classDef: ClassDef;
  /** Reaching this landmark sets over = 'arrived' (vertical slice end). */
  finalLandmarkId: string;
  mode: 'march' | 'rest' | 'wait';
}

const WEATHER_TABLE: Record<Weather, [Weather, number][]> = {
  clear: [
    ['clear', 0.65],
    ['rain', 0.15],
    ['heatwave', 0.12],
    ['cold', 0.08],
  ],
  rain: [
    ['rain', 0.45],
    ['clear', 0.45],
    ['cold', 0.1],
  ],
  heatwave: [
    ['heatwave', 0.5],
    ['clear', 0.5],
  ],
  cold: [
    ['cold', 0.4],
    ['clear', 0.5],
    ['rain', 0.1],
  ],
};

function nextWeather(current: Weather, rng: Rng): Weather {
  let roll = rng.next();
  for (const [w, p] of WEATHER_TABLE[current]) {
    roll -= p;
    if (roll < 0) return w;
  }
  return 'clear';
}

const able = (m: PartyMember) => m.status === 'ok' || m.status === 'doxxed';
const present = (m: PartyMember) => m.status !== 'gone' && m.status !== 'detained';

export function advanceDay(state: GameState, rng: Rng, opts: SimOptions): DayResult {
  const items: DayItem[] = [];
  const t = TUNING;

  // 1. Weather
  state.weather = nextWeather(state.weather, rng);

  // 2. Travel
  if (opts.mode === 'march') {
    const ableMembers = state.party.filter(able);
    const avgHealth = ableMembers.length
      ? ableMembers.reduce((s, m) => s + m.health, 0) / ableMembers.length
      : 0;
    const hurtDrag = state.party.some(
      (m) => m.status === 'injured' || m.status === 'sick',
    )
      ? 0.8
      : 1.0;
    const miles =
      t.baseMilesPerDay *
      t.paceMiles[state.pace] *
      t.weatherMiles[state.weather] *
      (0.6 + 0.4 * (avgHealth / 100)) *
      hurtDrag;
    state.miles = Math.min(400, Math.round((state.miles + miles) * 10) / 10);
  }

  // 3. Consumption (detained members are the state's problem; the state does not feed them well)
  const mouths = state.party.filter(present).length;
  const eaten = mouths * t.suppliesPerPersonPerDay;
  const starving = state.supplies < eaten;
  state.supplies = Math.max(0, state.supplies - eaten);
  if (starving) {
    items.push({
      type: 'note',
      text: 'There is not enough food. Nobody says anything about it, which is worse.',
      tone: 'red',
    });
  }

  // 4. Wellbeing drift
  for (const m of state.party) {
    if (!present(m)) continue;

    if (opts.mode === 'rest') {
      m.health = Math.min(100, m.health + t.restHealth);
      m.morale = Math.min(100, m.morale + t.restMorale);
    } else if (opts.mode === 'march') {
      if (able(m)) {
        m.health += t.paceHealth[state.pace];
        m.morale += t.paceMorale[state.pace];
        if (state.weather === 'heatwave' && state.pace === 'grueling') {
          m.health += t.heatwaveGruelingHealth;
        }
        if (state.weather === 'rain') m.morale += t.rainMorale;
      }
    }

    if (m.status === 'injured' || m.status === 'sick') {
      m.health += t.hurtDailyHealth;
      // Natural recovery
      if (state.day - (m.statusDay ?? state.day) >= t.recoveryDays) {
        m.status = 'ok';
        m.statusDay = state.day;
        items.push({ type: 'note', text: `${m.name} is back on their feet.`, tone: 'dim' });
      }
    }

    if (starving) {
      m.health += t.starvingDailyHealth;
      m.morale += t.starvingDailyMorale;
    }

    m.health = Math.min(100, Math.max(0, m.health));
    m.morale = Math.min(100, Math.max(0, m.morale));
  }

  // 5. Meters
  if (opts.mode === 'march') {
    const p = t.profile[state.profile];
    applyDelta(state, { support: p.support, heat: p.heat, crackdown: p.crackdown });
  } else if (opts.mode === 'wait') {
    applyDelta(state, { heat: -2.5 });
  }
  applyDelta(state, { crackdown: t.crackdownDailyFloor });

  // 6. Random events (marching puts you in the world's way)
  if (opts.mode !== 'rest' && rng.chance(t.eventChancePerDay)) {
    const resolved = rollEvent(state, rng, opts.events);
    if (resolved) items.push({ type: 'event', resolved });
    if (rng.chance(t.secondEventChance)) {
      const second = rollEvent(state, rng, opts.events);
      if (second) items.push({ type: 'event', resolved: second });
    }
  }

  // 7. Status transitions
  for (const m of state.party) {
    if (m.status === 'gone') continue;

    // Collapse from zero health
    if (present(m) && m.health <= 0) {
      m.status = 'gone';
      m.goneReason = 'hospitalized';
      m.statusDay = state.day;
      addJournal(state, `${m.name} collapsed on the road.`, 'loss');
      items.push({
        type: 'note',
        text: `${m.name} collapsed. The ambulance took forty minutes. They are alive, and they are out of the march.`,
        tone: 'red',
      });
      continue;
    }

    // Morale collapse: people can only run on empty for so long
    if (able(m) && m !== state.party[0]) {
      if (m.morale <= 0) {
        m.lowMoraleSince ??= state.day;
        if (state.day - m.lowMoraleSince >= t.moraleCollapseDays) {
          m.status = 'gone';
          m.goneReason = 'left';
          m.statusDay = state.day;
          addJournal(state, `${m.name} went home.`, 'loss');
          items.push({
            type: 'note',
            text: `In the morning, ${m.name}'s pack is gone. There is a note. "I'm sorry. I can't."`,
            tone: 'red',
          });
          continue;
        }
      } else {
        m.lowMoraleSince = undefined;
      }
    }

    // Detention clock
    if (m.status === 'detained') {
      const held = state.day - (m.statusDay ?? state.day);
      const indefinite = state.crackdown >= t.indefiniteCrackdown;
      if (held >= t.detentionLimitDays || indefinite) {
        m.status = 'gone';
        m.statusDay = state.day;
        const deported =
          state.classId === 'organizer' &&
          rng.chance(opts.classDef.detentionDeportRisk ?? 0);
        m.goneReason = deported ? 'deported' : 'detained';
        addJournal(state, `${m.name} has been detained indefinitely.`, 'loss');
        items.push({
          type: 'note',
          text: deported
            ? `The lawyer calls. ${m.name} was moved to a federal facility, then to a plane. There is no case number.`
            : `${m.name} has been detained indefinitely. The word "indefinitely" does a lot of work in this country now.`,
          tone: 'red',
        });
      } else if (state.bailFund + state.money >= bailCost(state.crackdown)) {
        items.push({
          type: 'bail',
          memberName: m.name,
          cost: bailCost(state.crackdown),
        });
      }
    }
  }

  // 8. News cycle recovers
  state.newsCycleSaturation = Math.max(
    0,
    state.newsCycleSaturation - t.saturationDecayPerDay,
  );

  // 9. Landmarks & arrival
  while (
    state.routeIndex < opts.route.length &&
    state.miles >= opts.route[state.routeIndex]!.mile
  ) {
    const landmark = opts.route[state.routeIndex]!;
    state.routeIndex += 1;
    addJournal(state, `Reached ${landmark.name}.`, 'milestone');
    if (landmark.arrivalEffect) applyDelta(state, landmark.arrivalEffect);
    items.push({ type: 'landmark', landmark });
    if (landmark.id === opts.finalLandmarkId) {
      state.over = { kind: 'arrived', day: state.day };
      break;
    }
  }

  // 10. Game over: the march cannot continue without you
  const leader = state.party[0]!;
  if (!state.over && leader.status === 'gone') {
    state.over = {
      kind: leader.goneReason === 'hospitalized' ? 'wiped' : 'detained',
      day: state.day,
    };
  }
  const anyonePresent = state.party.some(present);
  if (!state.over && !anyonePresent) {
    state.over = { kind: 'wiped', day: state.day };
  }
  if (state.over) items.push({ type: 'gameOver' });

  state.day += 1;
  state.rngState = rng.getState();
  return { items };
}
