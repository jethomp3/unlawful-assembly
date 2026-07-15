// Content contract. Everything under src/data/ speaks only these shapes;
// writing events/landmarks never touches engine code.

import type {
  ClassId,
  GameState,
  GoneReason,
  MemberStatus,
  StateDelta,
} from '../engine/types';
import type { Rng } from '../engine/rng';
import type { StartingKit } from '../engine/state';

export interface ClassDef {
  id: ClassId;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  blurb: string;
  perks: string[]; // display lines on the select screen
  scoreMultiplier: number;
  kit: StartingKit;
  /** Documentation minigame danger accrual multiplier. */
  dangerMod: number;
  /** Tech: first arrest is released with a warning. */
  firstArrestWaived?: boolean;
  /** Organizer: sees checkpoint strength before committing. */
  checkpointForewarning?: boolean;
  /** Organizer: chance that a detention becomes deportation (gone forever). */
  detentionDeportRisk?: number;
}

export interface LandmarkDef {
  id: string;
  name: string;
  mile: number;
  kind: 'start' | 'town' | 'checkpoint' | 'sanctuary' | 'capital';
  arrivalText: string;
  /** Applied on arrival (crowd donations, resupply, morale). */
  arrivalEffect?: StateDelta;
  checkpointId?: string;
  /** Town with a resupply store (prices rise with Crackdown). */
  store?: boolean;
}

/** Direct change to one party member, applied by the event engine. */
export interface MemberEffect {
  status?: MemberStatus;
  healthDelta?: number;
  moraleDelta?: number;
  goneReason?: GoneReason;
}

export interface EventChoice {
  label: string;
  resultText: string | ((s: GameState, memberName: string) => string);
  effect?: StateDelta;
  memberEffect?: MemberEffect;
}

export type EventRegister = 'deadpan' | 'grave' | 'satire';

export interface EventDef {
  id: string;
  register: EventRegister;
  /** Fire at most once per run. */
  once?: boolean;
  when?: (s: GameState) => boolean;
  weight: number | ((s: GameState) => number);
  /**
   * If set, the engine picks a target from members whose status is 'ok'
   * (never the leader for 'gone'-type effects unless leaderOk).
   */
  targetsMember?: boolean;
  /** Allow the leader (index 0) to be targeted. Default false. */
  leaderOk?: boolean;
  text: string | ((s: GameState, memberName: string) => string);
  effect?: StateDelta | ((s: GameState, rng: Rng) => StateDelta);
  memberEffect?: MemberEffect;
  choices?: EventChoice[];
}

export interface CheckpointDef {
  id: string;
  title: string;
  /** The river-report: posted conditions, varies with state. */
  report: (s: GameState) => string;
  /** Base blockade strength 0..1 (risk of a bad outcome when pushing). */
  strength: (s: GameState) => number;
  lawyerCost: number;
  detourDays: [min: number, max: number];
  detourSupplyCost: number;
  flavor: {
    pushClean: string;
    pushRough: string; // injuries / confiscation
    kettle: string; // the capsized wagon
    detour: string;
    lawyer: string;
    wait: string;
  };
}
