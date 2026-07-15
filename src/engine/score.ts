import type { GameState } from './types';

export interface ScoreLine {
  label: string;
  points: number;
}

export interface ScoreResult {
  lines: ScoreLine[];
  subtotal: number;
  multiplier: number;
  total: number;
}

/** The Oregon Trail points table, reskinned. */
export function computeScore(state: GameState, multiplier: number): ScoreResult {
  const survivors = state.party.filter(
    (m) => m.status !== 'gone' && m.status !== 'detained',
  );
  const lines: ScoreLine[] = [
    { label: `Miles marched (${Math.floor(state.miles)})`, points: Math.floor(state.miles) * 2 },
    {
      label: `People still marching (${survivors.length})`,
      points: survivors.length * 100,
    },
    {
      label: 'Their health',
      points: Math.round(survivors.reduce((s, m) => s + m.health, 0) / 2),
    },
    { label: `Support built (${Math.round(state.support)})`, points: Math.round(state.support) * 8 },
    { label: `Supplies remaining (${state.supplies} lbs)`, points: Math.round(state.supplies / 2) },
    { label: `Bail fund intact ($${state.bailFund})`, points: Math.round(state.bailFund / 10) },
    { label: `Footage banked (${Math.round(state.footage)})`, points: Math.round(state.footage) },
  ];
  const subtotal = lines.reduce((s, l) => s + l.points, 0);
  return {
    lines,
    subtotal,
    multiplier,
    total: Math.round(subtotal * multiplier),
  };
}
