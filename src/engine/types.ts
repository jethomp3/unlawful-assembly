// Shared state shapes. Content modules in src/data import from here
// (via contentTypes.ts) and never from engine internals.

export type Weather = 'clear' | 'rain' | 'heatwave' | 'cold';
export type Pace = 'grueling' | 'steady' | 'cautious';
export type Profile = 'loud' | 'mixed' | 'low';
export type ClassId = 'tech' | 'teacher' | 'organizer';

export type MemberStatus = 'ok' | 'injured' | 'sick' | 'doxxed' | 'detained' | 'gone';

/** Why a member is gone forever. Drives tombstone text. */
export type GoneReason = 'detained' | 'deported' | 'hospitalized' | 'left';

export interface PartyMember {
  name: string;
  health: number; // 0-100
  morale: number; // 0-100
  status: MemberStatus;
  /** Day the current status began (recovery timers, tombstones). */
  statusDay?: number;
  goneReason?: GoneReason;
  /** First day morale hit zero; a few days of this and they walk. */
  lowMoraleSince?: number;
}

export type JournalKind = 'event' | 'loss' | 'milestone' | 'news';

export interface JournalEntry {
  day: number;
  text: string;
  kind: JournalKind;
}

export type GameOverKind = 'detained' | 'wiped' | 'abandoned' | 'arrived';

export interface GameState {
  version: 1;
  seed: number;
  rngState: number;
  day: number;
  miles: number;
  /** Index into the route of the next landmark not yet reached. */
  routeIndex: number;
  weather: Weather;
  pace: Pace;
  profile: Profile;
  classId: ClassId;

  money: number;
  supplies: number; // lbs of food/water
  medkits: number;
  bailFund: number;
  batteries: number;
  footage: number; // banked, unconverted footage value

  support: number; // 0-100, the movement's momentum
  crackdown: number; // 0-100, state escalation
  heat: number; // 0-100, attention on YOUR group specifically

  party: PartyMember[]; // index 0 = you, the leader

  /** Documentation diminishing returns: rises per session, decays per day. */
  newsCycleSaturation: number;

  /** Once-fired event ids and story flags. */
  flags: Record<string, number>;

  journal: JournalEntry[];

  over?: { kind: GameOverKind; day: number };
}

/**
 * Declarative effect applied to state. All numeric fields are deltas;
 * resources clamp at 0, meters clamp to 0-100.
 */
export interface StateDelta {
  money?: number;
  supplies?: number;
  medkits?: number;
  bailFund?: number;
  batteries?: number;
  footage?: number;
  support?: number;
  crackdown?: number;
  heat?: number;
  /** Days lost ("Marcus has blisters. Lose 1 day."). Consumed by the sim. */
  daysLost?: number;
}
