// Scene generation for the Documentation mini-game. Officers patrol,
// telegraph, and commit the act; crowd blockers drift and occlude.

import type { GameState } from '../engine/types';
import type { Rng } from '../engine/rng';
import { WORLD_W } from './camera';

export type ScenePhase = 'idle' | 'windup' | 'action';

export interface Officer {
  id: number;
  x: number;
  y: number; // feet position
  minX: number;
  maxX: number;
  speed: number;
  dir: 1 | -1;
  phase: ScenePhase;
  phaseT: number; // seconds left in current phase
  facing: 1 | -1;
  /** Shot types already banked against this officer this session. */
  taken: { action: boolean; face: boolean; badge: boolean };
}

export interface Blocker {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
}

export type SceneKind = 'checkpoint_search' | 'arrest' | 'raid' | 'nothing';

export interface DocScene {
  kind: SceneKind;
  brief: string;
  officers: Officer[];
  blockers: Blocker[];
  /** The person on the receiving end; the wide shot needs them in frame. */
  subject?: { x: number; y: number };
}

const BRIEFS: Record<SceneKind, string> = {
  checkpoint_search:
    'Two lanes over, deputies are "inspecting" a family\'s car down to the ' +
    'door panels. The kids are sitting on the curb in their school clothes.',
  arrest:
    'They have a man face-down between the pumps at the gas station. Three ' +
    'of them. He was selling water out of a cooler.',
  raid:
    'An apartment block, vans out front. They are carrying boxes out of a ' +
    'home like it is evidence of something. A woman is not allowed to go ' +
    'back for the photo albums.',
  nothing:
    'You walk the block with the camera ready. Today, nothing. A dog barks ' +
    'at a drone. The drone barks back, approximately.',
};

const GROUND_Y = 190;

export function generateScene(state: GameState, rng: Rng): DocScene {
  // Some days the hunt finds no game.
  if (rng.chance(0.12)) {
    return { kind: 'nothing', brief: BRIEFS.nothing, officers: [], blockers: [] };
  }

  const kinds: SceneKind[] = ['checkpoint_search', 'arrest', 'raid'];
  const kind = rng.pick(kinds);

  const officerCount = Math.min(4, 2 + Math.floor(state.crackdown / 40));
  const officers: Officer[] = [];
  for (let i = 0; i < officerCount; i++) {
    const cx = 120 + (i * (WORLD_W - 240)) / Math.max(1, officerCount - 1);
    const range = rng.int(40, 90);
    officers.push({
      id: i,
      x: cx,
      y: GROUND_Y,
      minX: Math.max(30, cx - range),
      maxX: Math.min(WORLD_W - 30, cx + range),
      speed: rng.int(10, 22),
      dir: rng.chance(0.5) ? 1 : -1,
      phase: 'idle',
      phaseT: rng.int(2, 5),
      facing: 1,
      taken: { action: false, face: false, badge: false },
    });
  }

  const subject = { x: officers[0]!.x + 14, y: GROUND_Y };

  const blockerCount = 2 + Math.floor(rng.next() * 3);
  const blockers: Blocker[] = [];
  for (let i = 0; i < blockerCount; i++) {
    blockers.push({
      x: rng.int(40, WORLD_W - 40),
      y: GROUND_Y + 14, // foreground crowd, slightly closer than the action
      w: rng.int(18, 34),
      h: rng.int(26, 40),
      vx: (rng.chance(0.5) ? 1 : -1) * rng.int(4, 12),
    });
  }

  return { kind, brief: BRIEFS[kind], officers, blockers, subject };
}

/** Advance patrols, action windows, and crowd drift. Fixed-timestep friendly. */
export function updateScene(scene: DocScene, dt: number, rng: Rng): void {
  for (const o of scene.officers) {
    o.phaseT -= dt;
    if (o.phaseT <= 0) {
      if (o.phase === 'idle') {
        o.phase = 'windup';
        o.phaseT = 0.8;
      } else if (o.phase === 'windup') {
        o.phase = 'action';
        o.phaseT = 1.5 + rng.next() * 1.5;
      } else {
        o.phase = 'idle';
        o.phaseT = 2 + rng.next() * 3;
      }
    }
    // Patrol only while idle; you don't pace mid-swing.
    if (o.phase === 'idle') {
      o.x += o.dir * o.speed * dt;
      if (o.x <= o.minX) o.dir = 1;
      if (o.x >= o.maxX) o.dir = -1;
      o.facing = o.dir;
    } else if (scene.subject) {
      o.facing = scene.subject.x >= o.x ? 1 : -1;
    }
  }

  for (const b of scene.blockers) {
    b.x += b.vx * dt;
    if (b.x < 20 || b.x > WORLD_W - 20) b.vx *= -1;
  }
}

/** World-space anchor points for each shot type on an officer. */
export function shotAnchors(o: Officer): {
  badge: { x: number; y: number };
  face: { x: number; y: number };
  action: { x: number; y: number };
} {
  return {
    badge: { x: o.x + o.facing * 2, y: o.y - 22 }, // chest
    face: { x: o.x, y: o.y - 30 }, // head
    action: { x: o.x + o.facing * 8, y: o.y - 18 }, // the swing, wide
  };
}
