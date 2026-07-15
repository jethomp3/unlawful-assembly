// ALL balance tuning lives here. The 30-day snapshot test guards drift.

import type { Pace, Profile, Weather } from './types';

export const TUNING = {
  // ~9 mi/day steady (before weather/health drag): the 400-mile march runs
  // ~37-58 days depending on pace, sized for the auto-continue rhythm
  // (many quiet days between events) against the day-60 demonstration.
  baseMilesPerDay: 9,

  paceMiles: { grueling: 1.5, steady: 1.0, cautious: 0.7 } satisfies Record<Pace, number>,
  weatherMiles: { clear: 1.0, rain: 0.8, heatwave: 0.85, cold: 0.9 } satisfies Record<
    Weather,
    number
  >,

  suppliesPerPersonPerDay: 2,

  /** Daily meter drift by visibility profile: attention is a movement's food. */
  profile: {
    loud: { support: 1.0, heat: 1.6, crackdown: 0.35 },
    mixed: { support: 0.45, heat: 0.45, crackdown: 0.18 },
    low: { support: 0.08, heat: -1.2, crackdown: 0.0 },
  } satisfies Record<Profile, { support: number; heat: number; crackdown: number }>,

  /** Crackdown rises on its own. Doing nothing is not neutral. */
  crackdownDailyFloor: 0.3,

  /** Health/morale drift per day by pace (applies to able members). */
  paceHealth: { grueling: -1.6, steady: -0.5, cautious: -0.1 } satisfies Record<Pace, number>,
  paceMorale: { grueling: -1.4, steady: -0.3, cautious: 0.5 } satisfies Record<Pace, number>,

  /** Extra health drain marching hurt or hungry. */
  hurtDailyHealth: -3,
  starvingDailyHealth: -7,
  starvingDailyMorale: -6,

  /** Weather misery. */
  heatwaveGruelingHealth: -3,
  rainMorale: -1,

  /** Rest day. */
  restHealth: 5,
  restMorale: 7,
  restSuppliesFactor: 1.0, // you still eat

  /** Natural recovery time for injured/sick, in days. */
  recoveryDays: 5,

  /** Morale floor: this many days at 0 morale and a member walks away. */
  moraleCollapseDays: 3,

  /** Detention. */
  bailBase: 250,
  bailCrackdownFactor: 5, // + crackdown * this
  detentionLimitDays: 4, // unresolved past this = gone
  indefiniteCrackdown: 75, // at/above this, bail is refused outright

  /** Documentation conversion. */
  footageSupportRate: 0.05, // support per footage point
  footageDonationRate: 0.6, // dollars per footage point, scaled by support band
  saturationPerSession: 1.0,
  saturationDecayPerDay: 0.34,

  /** Event cadence: with auto-continue, ~4-10 quiet days between events. */
  eventChancePerDay: 0.16,
  secondEventChance: 0.12,

  /** Auto-continue rhythm (seconds). */
  marchAnimSeconds: 3.0,
  marchPauseSeconds: 0.5,
} as const;

export function bailCost(crackdown: number): number {
  return Math.round(TUNING.bailBase + crackdown * TUNING.bailCrackdownFactor);
}

/** 0..1 factor: how much footage value survives the news cycle. */
export function saturationFactor(saturation: number): number {
  return Math.pow(0.5, saturation / 1.5);
}
