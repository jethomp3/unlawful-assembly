// ALL balance tuning lives here. The 30-day snapshot test guards drift.

import type { Pace, Profile, Weather } from './types';

export const TUNING = {
  baseMilesPerDay: 14,

  paceMiles: { grueling: 1.5, steady: 1.0, cautious: 0.7 } satisfies Record<Pace, number>,
  weatherMiles: { clear: 1.0, rain: 0.8, heatwave: 0.85, cold: 0.9 } satisfies Record<
    Weather,
    number
  >,

  suppliesPerPersonPerDay: 2,

  /** Daily meter drift by visibility profile: attention is a movement's food. */
  profile: {
    loud: { support: 1.8, heat: 2.4, crackdown: 0.5 },
    mixed: { support: 0.8, heat: 0.7, crackdown: 0.2 },
    low: { support: 0.15, heat: -1.6, crackdown: 0.0 },
  } satisfies Record<Profile, { support: number; heat: number; crackdown: number }>,

  /** Crackdown rises on its own. Doing nothing is not neutral. */
  crackdownDailyFloor: 0.4,

  /** Health/morale drift per day by pace (applies to able members). */
  paceHealth: { grueling: -2.5, steady: -0.8, cautious: -0.2 } satisfies Record<Pace, number>,
  paceMorale: { grueling: -2.0, steady: -0.5, cautious: 0.6 } satisfies Record<Pace, number>,

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

  /** Event cadence. */
  eventChancePerDay: 0.75,
  secondEventChance: 0.18,
} as const;

export function bailCost(crackdown: number): number {
  return Math.round(TUNING.bailBase + crackdown * TUNING.bailCrackdownFactor);
}

/** 0..1 factor: how much footage value survives the news cycle. */
export function saturationFactor(saturation: number): number {
  return Math.pow(0.5, saturation / 1.5);
}
