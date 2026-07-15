import type { EventDef, MemberEffect } from '../data/contentTypes';
import type { GameState, PartyMember } from './types';
import type { Rng } from './rng';
import { weightedPick } from './rng';
import { addJournal, applyDelta } from './state';

export interface ResolvedEvent {
  def: EventDef;
  /** Chosen target's name (or '' when the event doesn't target anyone). */
  memberName: string;
  text: string;
}

function eligibleTargets(state: GameState, def: EventDef): PartyMember[] {
  const pool = state.party.filter((m) => m.status === 'ok');
  return def.leaderOk ? pool : pool.filter((m) => m !== state.party[0]);
}

function isEligible(state: GameState, def: EventDef): boolean {
  if (def.once && state.flags[`ev.${def.id}`]) return false;
  if (def.when && !def.when(state)) return false;
  if (def.targetsMember && eligibleTargets(state, def).length === 0) return false;
  return true;
}

function weightOf(state: GameState, def: EventDef): number {
  return typeof def.weight === 'function' ? def.weight(state) : def.weight;
}

/** Pick one event for today, or none. Marks once-flags immediately. */
export function rollEvent(
  state: GameState,
  rng: Rng,
  table: EventDef[],
): ResolvedEvent | null {
  const pool = table.filter((def) => isEligible(state, def));
  const def = weightedPick(rng, pool, (d) => weightOf(state, d));
  if (!def) return null;

  let memberName = '';
  if (def.targetsMember) {
    const target = rng.pick(eligibleTargets(state, def));
    memberName = target.name;
  }

  if (def.once) state.flags[`ev.${def.id}`] = 1;

  const text = typeof def.text === 'function' ? def.text(state, memberName) : def.text;
  return { def, memberName, text };
}

export function applyMemberEffect(
  state: GameState,
  memberName: string,
  effect: MemberEffect,
): void {
  const member = state.party.find((m) => m.name === memberName);
  if (!member) return;
  if (effect.healthDelta) {
    member.health = Math.min(100, Math.max(0, member.health + effect.healthDelta));
  }
  if (effect.moraleDelta) {
    member.morale = Math.min(100, Math.max(0, member.morale + effect.moraleDelta));
  }
  if (effect.status) {
    member.status = effect.status;
    member.statusDay = state.day;
    if (effect.status === 'gone') {
      member.goneReason = effect.goneReason ?? 'detained';
      addJournal(state, `${member.name} is gone.`, 'loss');
    }
  }
}

/**
 * Apply a resolved event's consequences (no choices), or one chosen option.
 * Returns the result text to display for choice events.
 */
export function applyEvent(
  state: GameState,
  rng: Rng,
  resolved: ResolvedEvent,
  choiceIndex?: number,
): string | null {
  const { def, memberName } = resolved;

  if (choiceIndex !== undefined && def.choices) {
    const choice = def.choices[choiceIndex];
    if (!choice) return null;
    if (choice.effect) applyDelta(state, choice.effect);
    if (choice.memberEffect) applyMemberEffect(state, memberName, choice.memberEffect);
    const text =
      typeof choice.resultText === 'function'
        ? choice.resultText(state, memberName)
        : choice.resultText;
    addJournal(state, text, def.register === 'grave' ? 'loss' : 'event');
    return text;
  }

  if (def.effect) {
    const delta = typeof def.effect === 'function' ? def.effect(state, rng) : def.effect;
    applyDelta(state, delta);
  }
  if (def.memberEffect) applyMemberEffect(state, memberName, def.memberEffect);
  addJournal(state, resolved.text, def.register === 'grave' ? 'loss' : 'event');
  return null;
}
