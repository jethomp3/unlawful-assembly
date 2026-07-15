// The river fording, reskinned: push through / detour / lawyer / wait.

import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, prose, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState } from '../engine/types';
import type { Rng } from '../engine/rng';
import { addJournal, applyDelta } from '../engine/state';
import { saveGame } from '../engine/save';
import { classById } from '../data/classes';
import { checkpointById } from '../data/checkpoints';
import { messageScreen } from './travelMenus';

export function checkpointScreen(
  manager: ScreenManager,
  state: GameState,
  rng: Rng,
  checkpointId: string,
  onDone: () => void,
): Screen {
  const def = checkpointById(checkpointId);
  const classDef = classById(state.classId);

  const finish = (text: string, tone?: 'dim' | 'amber' | 'red'): void => {
    state.pendingCheckpoint = undefined; // resolved; no re-rolling via reload
    state.rngState = rng.getState();
    saveGame(state);
    manager.swapTop(messageScreen(text, tone, onDone));
  };

  const pushThrough = (): void => {
    const strength = Math.min(0.9, def.strength(state));
    const roll = rng.next();
    if (roll > strength + 0.15) {
      applyDelta(state, { support: 3, heat: 2 });
      addJournal(state, `Passed ${def.title} clean.`, 'milestone');
      finish(def.flavor.pushClean);
    } else if (roll > strength - 0.18) {
      const victims = state.party.filter((m) => m.status === 'ok');
      if (victims.length > 0) {
        const victim = rng.pick(victims);
        victim.status = 'injured';
        victim.statusDay = state.day;
        victim.health = Math.max(1, victim.health - 20);
      }
      applyDelta(state, {
        supplies: -Math.round(state.supplies * 0.2),
        heat: 5,
        support: 2,
      });
      addJournal(state, `Roughed up pushing through ${def.title}.`);
      finish(def.flavor.pushRough, 'amber');
    } else {
      kettle();
    }
  };

  const kettle = (): void => {
    // The capsized wagon: mass arrest.
    applyDelta(state, { heat: 10, crackdown: 4, supplies: -20 });
    const candidates = state.party.filter((m) => m.status === 'ok');
    const takenNames: string[] = [];
    const takeCount = Math.min(candidates.length, rng.int(1, 2));
    for (let i = 0; i < takeCount; i++) {
      const pool = candidates.filter((m) => !takenNames.includes(m.name));
      if (pool.length === 0) break;
      const taken = rng.pick(pool);
      // Tech perk: your first arrest is a warning. Privilege is a stat.
      if (
        taken === state.party[0] &&
        classDef.firstArrestWaived &&
        !state.flags['perk.firstArrest']
      ) {
        state.flags['perk.firstArrest'] = 1;
        addJournal(state, 'Released with a warning. They apologized, almost.');
        continue;
      }
      taken.status = 'detained';
      taken.statusDay = state.day;
      takenNames.push(taken.name);
    }
    for (const m of state.party) {
      if (m.status === 'ok') m.morale = Math.max(0, m.morale - 12);
    }
    addJournal(state, `Kettled at ${def.title}.`, 'loss');

    const aftermath =
      takenNames.length > 0
        ? `\n\nWhen the vans leave, ${takenNames.join(' and ')} ${
            takenNames.length > 1 ? 'are' : 'is'
          } in them.`
        : '\n\nBy some miracle of paperwork, everyone walks out. Eventually.';
    finish(def.flavor.kettle + aftermath, 'red');
  };

  const detour = (): void => {
    const days = rng.int(def.detourDays[0], def.detourDays[1]);
    applyDelta(state, { daysLost: days, supplies: -def.detourSupplyCost, heat: -3 });
    addJournal(state, `Detoured around ${def.title}. Lost ${days} days.`);
    finish(`${def.flavor.detour}\n\nLose ${days} days.`);
  };

  const lawyer = (): void => {
    applyDelta(state, { money: -def.lawyerCost, support: 3 });
    addJournal(state, `Crossed ${def.title} under legal escort.`);
    finish(def.flavor.lawyer);
  };

  const wait = (): void => {
    applyDelta(state, { daysLost: 1, heat: -5, crackdown: 0.5 });
    saveGame(state);
    manager.swapTop(
      messageScreen(def.flavor.wait, 'dim', () => {
        manager.swapTop(checkpointScreen(manager, state, rng, checkpointId, onDone));
      }),
    );
  };

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', 'amber', def.title));
      body.append(rule());
      body.append(prose(def.report(state)));

      if (classDef.checkpointForewarning) {
        const pct = Math.round(Math.min(0.9, def.strength(state)) * 100);
        body.append(
          el(
            'div',
            'dim',
            `\nThe community network already called ahead: they put the odds ` +
              `of trouble at about ${pct}%.`,
          ),
        );
      }

      body.append(rule());
      body.append(
        menu([
          { key: '1', label: 'Push through', note: 'free, fast, and famous last words', onSelect: pushThrough },
          {
            key: '2',
            label: 'Take the long detour',
            note: `${def.detourDays[0]}-${def.detourDays[1]} days, hard miles`,
            onSelect: detour,
          },
          {
            key: '3',
            label: `Call the lawyer caravan ($${def.lawyerCost})`,
            disabled: state.money < def.lawyerCost,
            onSelect: lawyer,
          },
          { key: '4', label: 'Wait a day and watch', onSelect: wait },
        ]),
      );
      body.append(statusBar(state));
      root.append(body);
    },
  };
}
