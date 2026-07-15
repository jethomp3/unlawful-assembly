import type { GameState } from '../engine/types';
import { el } from './dom';

const WEATHER_LABEL: Record<GameState['weather'], string> = {
  clear: 'clear',
  rain: 'rain',
  heatwave: 'heat wave',
  cold: 'cold snap',
};

function meterWord(v: number): string {
  if (v < 20) return 'low';
  if (v < 45) return 'rising';
  if (v < 70) return 'high';
  return 'severe';
}

/** The bottom readout shared by travel and its sub-screens. */
export function statusBar(state: GameState): HTMLElement {
  const bar = el('div', 'status-bar');
  bar.setAttribute('role', 'status');

  const alive = state.party.filter((m) => m.status !== 'gone').length;
  const hurt = state.party.filter(
    (m) => m.status === 'injured' || m.status === 'sick',
  ).length;
  const detained = state.party.filter((m) => m.status === 'detained').length;

  const parts: [string, string][] = [
    ['day', String(state.day)],
    ['weather', WEATHER_LABEL[state.weather]],
    ['supplies', `${state.supplies} lbs`],
    ['money', `$${state.money}`],
    ['group', `${alive}${hurt ? ` (${hurt} hurt)` : ''}${detained ? ` (${detained} held)` : ''}`],
    ['support', meterWord(state.support)],
    ['heat', meterWord(state.heat)],
  ];

  for (const [label, value] of parts) {
    const span = el('span');
    span.append(`${label}: `);
    span.append(el('b', undefined, value));
    bar.append(span);
  }
  return bar;
}
