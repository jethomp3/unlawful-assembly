// The travel hub's sub-screens: pace, profile, rest, supplies, talk, map,
// plus the generic message screen and the bail prompt.

import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, pressSpace, prose, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState, Pace, Profile } from '../engine/types';
import type { Rng } from '../engine/rng';
import { addJournal } from '../engine/state';
import { saveGame } from '../engine/save';
import { memberLine } from '../data/dialogue';
import { ROUTE, TOTAL_MILES } from '../data/route';
import { STORE_ITEMS } from '../data/storeItems';
import { gameOverScreen } from './gameOver';

export function messageScreen(
  text: string,
  tone: 'dim' | 'amber' | 'red' | undefined,
  onContinue: () => void,
): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('div', undefined, ' '));
      body.append(prose(text, `prose${tone ? ` ${tone}` : ''}`));
      body.append(pressSpace('Press SPACE BAR to continue', onContinue));
      root.append(body);
    },
  };
}

export function paceScreen(manager: ScreenManager, state: GameState): Screen {
  const options: { pace: Pace; label: string; note: string }[] = [
    { pace: 'grueling', label: 'Grueling', note: 'cover ground; wear the group down' },
    { pace: 'steady', label: 'Steady', note: 'the long-haul pace' },
    { pace: 'cautious', label: 'Cautious', note: 'slow; kind to feet and nerves' },
  ];
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Set the pace'));
      body.append(rule());
      body.append(
        menu(
          options
            .map((o, i) => ({
              key: String(i + 1),
              label: `${o.label}${state.pace === o.pace ? '  <- current' : ''}`,
              note: o.note,
              onSelect: () => {
                state.pace = o.pace;
                saveGame(state);
                manager.pop();
              },
            }))
            .concat([{ key: '4', label: 'Back', note: '', onSelect: () => manager.pop() }]),
        ),
      );
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

export function profileScreen(manager: ScreenManager, state: GameState): Screen {
  const options: { profile: Profile; label: string; note: string }[] = [
    {
      profile: 'loud',
      label: 'Loud & visible',
      note: 'banners up, chants, livestreams. Support grows. So does Heat.',
    },
    {
      profile: 'mixed',
      label: 'Steady presence',
      note: 'visible but measured.',
    },
    {
      profile: 'low',
      label: 'Gray & quiet',
      note: 'small clusters, no signs. Safe. A movement nobody sees starves.',
    },
  ];
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'How does the march carry itself?'));
      body.append(
        el('div', 'dim', 'Attention is a movement\'s food. It is also a beacon.'),
      );
      body.append(rule());
      body.append(
        menu(
          options
            .map((o, i) => ({
              key: String(i + 1),
              label: `${o.label}${state.profile === o.profile ? '  <- current' : ''}`,
              note: o.note,
              onSelect: () => {
                state.profile = o.profile;
                saveGame(state);
                manager.pop();
              },
            }))
            .concat([{ key: '4', label: 'Back', note: '', onSelect: () => manager.pop() }]),
        ),
      );
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

export function restScreen(
  manager: ScreenManager,
  state: GameState,
  onRest: () => void,
): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Make camp'));
      body.append(rule());

      const hurt = state.party.filter(
        (m) => m.status === 'injured' || m.status === 'sick',
      );

      const items = [
        {
          key: '1',
          label: 'Rest for a day',
          note: 'the group heals; the group still eats',
          onSelect: () => {
            manager.pop();
            onRest();
          },
        },
        {
          key: '2',
          label: `Treat the hurt (${hurt.length})`,
          note: `${state.medkits} medkits`,
          disabled: hurt.length === 0 || state.medkits === 0,
          onSelect: () => {
            const patient = hurt[0]!;
            state.medkits -= 1;
            patient.status = 'ok';
            patient.statusDay = state.day;
            patient.health = Math.min(100, patient.health + 15);
            addJournal(state, `Used a medkit on ${patient.name}.`);
            saveGame(state);
            manager.swapTop(restScreen(manager, state, onRest));
          },
        },
        {
          key: '3',
          label: 'Give up and go home',
          note: 'there is no shame in it, they will say',
          onSelect: () => manager.push(goHomeConfirm(manager, state)),
        },
        { key: '4', label: 'Back', onSelect: () => manager.pop() },
      ];

      body.append(menu(items));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

function goHomeConfirm(manager: ScreenManager, state: GameState): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(
        prose(
          'You could be home in a day. Your bed. Your shower. Your life, ' +
            'such as it remains.\n\nThe others would understand. That is the ' +
            'worst part. Everyone always understands.',
        ),
      );
      body.append(rule());
      body.append(
        menu([
          { key: '1', label: 'No. We keep walking.', onSelect: () => manager.pop() },
          {
            key: '2',
            label: 'Go home.',
            onSelect: () => {
              state.over = { kind: 'abandoned', day: state.day };
              saveGame(state);
              manager.replace(gameOverScreen(manager, state));
            },
          },
        ]),
      );
      root.append(body);
    },
  };
}

export function suppliesScreen(manager: ScreenManager, state: GameState): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Supplies'));
      body.append(rule());
      const rows: [string, string][] = [
        ['Food & water', `${state.supplies} lbs`],
        ['Money', `$${state.money}`],
        ['Medkits', String(state.medkits)],
        ['Phone batteries', String(state.batteries)],
        ['Bail fund', `$${state.bailFund}`],
        ['Unposted footage', String(Math.round(state.footage))],
      ];
      for (const [label, value] of rows) {
        const row = el('div', 'spread');
        row.append(el('span', 'dim', label), el('span', undefined, value));
        body.append(row);
      }
      const mouths = state.party.filter(
        (m) => m.status !== 'gone' && m.status !== 'detained',
      ).length;
      body.append(rule());
      body.append(
        el(
          'div',
          'dim',
          `The group eats about ${mouths * 2} lbs a day. That is ${
            mouths > 0 ? Math.floor(state.supplies / (mouths * 2)) : 0
          } days of food.`,
        ),
      );
      body.append(menu([{ key: '1', label: 'Back', onSelect: () => manager.pop() }]));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

export function talkScreen(
  manager: ScreenManager,
  state: GameState,
  rng: Rng,
): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'The group, at the end of the day'));
      body.append(rule());

      for (const m of state.party.slice(1)) {
        const block = el('div');
        const status =
          m.status === 'gone'
            ? m.goneReason === 'left'
              ? '(went home)'
              : m.goneReason === 'deported'
                ? '(deported)'
                : m.goneReason === 'hospitalized'
                  ? '(hospitalized)'
                  : '(taken)'
            : m.status !== 'ok'
              ? `(${m.status})`
              : '';
        block.append(
          el('div', m.status === 'gone' ? 'dim' : 'white', `${m.name} ${status}`),
        );
        if (m.status !== 'gone') {
          block.append(el('div', 'dim', `  ${memberLine(m, rng.next())}`));
        }
        block.append(el('div', undefined, ' '));
        body.append(block);
      }
      state.rngState = rng.getState();
      saveGame(state);

      body.append(menu([{ key: '1', label: 'Back', onSelect: () => manager.pop() }]));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

export function mapScreen(manager: ScreenManager, state: GameState): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'The route'));
      body.append(rule());
      const lines: string[] = [];
      for (const lm of ROUTE) {
        const here = state.miles >= lm.mile;
        const marker = here ? 'x' : 'o';
        lines.push(
          `${marker} mile ${String(lm.mile).padStart(3)}  ${lm.name}${
            lm.kind === 'checkpoint' ? '  [!]' : ''
          }`,
        );
      }
      const youAt = `      you are at mile ${Math.floor(state.miles)} of ${TOTAL_MILES}`;
      body.append(prose(lines.join('\n') + '\n\n' + youAt));
      body.append(menu([{ key: '1', label: 'Back', onSelect: () => manager.pop() }]));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

/**
 * Town resupply: the outfitting store on the road. Prices climb with
 * Crackdown — scarcity is policy now.
 */
export function resupplyScreen(
  state: GameState,
  townName: string,
  onDone: () => void,
): Screen {
  const markup = 1 + state.crackdown / 100;

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, `${townName} — General Store`));
      body.append(
        el(
          'div',
          'dim',
          state.crackdown > 50
            ? '"Prices went up," the clerk says, nodding at the television. "Everything did."'
            : 'The clerk stacks your goods without commentary, which is its own kindness.',
        ),
      );
      body.append(rule());

      const moneyLine = el('div', 'amber');
      const list = el('div');

      const redraw = (): void => {
        moneyLine.textContent = `You have $${state.money}.`;
        list.replaceChildren();
        for (const it of STORE_ITEMS) {
          if (it.id === 'bailFund') continue; // deposits happen at home
          const price = Math.round(it.price * markup);
          const row = el('div', 'spread');
          row.append(
            el('span', undefined, `${it.label} — $${price} per ${it.step} ${it.unit}`),
          );
          const buy = el('button', 'qty-btn', 'buy');
          buy.disabled = state.money < price;
          buy.setAttribute('aria-label', `Buy ${it.label}`);
          buy.addEventListener('click', () => {
            if (state.money < price) return;
            state.money -= price;
            if (it.id === 'supplies') state.supplies += it.step;
            else if (it.id === 'medkits') state.medkits += it.step;
            else if (it.id === 'batteries') state.batteries += it.step;
            saveGame(state);
            redraw();
          });
          row.append(buy);
          list.append(row);
        }
      };
      redraw();

      body.append(moneyLine, list, rule());
      body.append(menu([{ key: '1', label: 'Back to the road', onSelect: onDone }]));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

export function bailScreen(
  state: GameState,
  memberName: string,
  cost: number,
  onDone: () => void,
): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(
        prose(
          `${memberName} is being held at the county facility. The bondsman ` +
            `does not make eye contact.\n\nBail is $${cost}. You have ` +
            `$${state.bailFund} in the fund and $${state.money} in cash.`,
        ),
      );
      body.append(rule());
      body.append(
        menu([
          {
            key: '1',
            label: `Pay the $${cost}`,
            disabled: state.bailFund + state.money < cost,
            onSelect: () => {
              const fromFund = Math.min(state.bailFund, cost);
              state.bailFund -= fromFund;
              state.money -= cost - fromFund;
              const m = state.party.find((x) => x.name === memberName);
              if (m && m.status === 'detained') {
                m.status = 'ok';
                m.statusDay = state.day;
                m.morale = Math.max(0, m.morale - 15);
                addJournal(state, `Bailed out ${memberName} for $${cost}.`);
              }
              onDone();
            },
          },
          {
            key: '2',
            label: 'Not today. The fund has to last.',
            onSelect: onDone,
          },
        ]),
      );
      body.append(statusBar(state));
      root.append(body);
    },
  };
}
