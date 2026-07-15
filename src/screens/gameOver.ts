// Terminal states: arrival (slice end), leader detained, march wiped,
// or "go home" — the Complicit ending. Then tombstones, then the score.

import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, pressSpace, prose, rule } from '../ui/dom';
import type { GameState, GoneReason, PartyMember } from '../engine/types';
import { addTombstone, clearSave } from '../engine/save';
import { scoreScreen } from './scoreScreen';

const REASON_TEXT: Record<GoneReason, string> = {
  detained: 'detained indefinitely',
  deported: 'deported',
  hospitalized: 'hospitalized',
  left: 'went home',
};

function endingText(state: GameState): { text: string; tone?: 'red' | 'amber' } {
  switch (state.over?.kind) {
    case 'arrived':
      return {
        text:
          'MERIDIAN RIVER BRIDGE\n\n' +
          'You cross at dawn, before the shift change, and stop in the ' +
          'middle because everyone stops in the middle.\n\n' +
          'Behind you: two hundred and fifty miles of county roads, church ' +
          'basements, checkpoint lines, and the names of the people who ' +
          'are not standing here.\n\n' +
          'Ahead: the Capital. One hundred and fifty miles. The ' +
          'demonstration. Whatever comes after.\n\n' +
          'The river is wide and brown and patient, and it has seen ' +
          'marches before. Some of them worked.\n\n' +
          '— END OF THE VERTICAL SLICE —\n(Acts 2 and 3 continue to the Capital.)',
      };
    case 'detained':
      return {
        tone: 'red',
        text:
          'They process you slowly, on purpose.\n\n' +
          'The others wait outside the facility for two days. On the third ' +
          'day a clerk tells them the schedule is "indefinite," and a march ' +
          'without you is an argument nobody wins.\n\n' +
          'YOU HAVE BEEN DETAINED INDEFINITELY.\n\n' +
          'The word "indefinitely" does a lot of work in this country now.',
      };
    case 'wiped':
      return {
        tone: 'red',
        text:
          'A march is only people. There are no longer enough people.\n\n' +
          'The group scatters — hospitals, buses home, a cousin\'s couch in ' +
          'another state. The route goes on without you, walked by ' +
          'strangers you will never meet, which is either the point or ' +
          'the tragedy. Probably both.',
      };
    case 'abandoned':
      return {
        tone: 'amber',
        text:
          'THE COMPLICIT ENDING\n\n' +
          'You are home in time for dinner.\n\n' +
          'The march arrives at the Capital without you. You watch it on ' +
          'your phone, in bed. It looks smaller on the screen. Everything ' +
          'does.\n\n' +
          'Months pass. The executive orders keep coming, and they read ' +
          'less funny now. The neighbor two doors down is gone; nobody ' +
          'says where.\n\n' +
          'And then one night — you always knew, didn\'t you? — there is ' +
          'a knock at your own door.\n\n' +
          'First they came, and you did not speak out.\n\n' +
          'You kept the receipts of your silence. They spend the same ' +
          'as anyone\'s.',
      };
    default:
      return { text: 'The road ends.' };
  }
}

export function gameOverScreen(manager: ScreenManager, state: GameState): Screen {
  clearSave();
  const lost = state.party.filter((m) => m.status === 'gone' || m.status === 'detained');
  const { text, tone } = endingText(state);

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(prose(text, `prose${tone ? ` ${tone}` : ''}`));
      body.append(
        pressSpace('Press SPACE BAR to continue', () => {
          if (lost.length > 0) {
            manager.swapTop(tombstoneScreen(manager, state, lost, 0));
          } else {
            manager.swapTop(scoreScreen(manager, state));
          }
        }),
      );
      root.append(body);
    },
  };
}

function tombstoneScreen(
  manager: ScreenManager,
  state: GameState,
  lost: PartyMember[],
  index: number,
): Screen {
  const member = lost[index]!;
  const reason =
    member.status === 'detained'
      ? 'detained indefinitely'
      : REASON_TEXT[member.goneReason ?? 'detained'];

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'The Memorial'));
      body.append(rule());
      body.append(
        prose(
          `      _______\n     /       \\\n    |  R I P  |\n    |         |\n` +
            `    |         |\n ___|_________|___\n\n` +
            `   ${member.name}\n   mile ${Math.floor(state.miles)}, day ${
              member.statusDay ?? state.day
            }\n   ${reason}`,
        ),
      );
      body.append(el('div', 'dim', 'An epitaph, if you have one:'));
      const input = el('input');
      input.type = 'text';
      input.maxLength = 60;
      input.setAttribute('aria-label', `Epitaph for ${member.name}`);
      body.append(input);
      body.append(rule());
      body.append(
        menu([
          {
            key: '1',
            label: 'Lay the stone',
            onSelect: () => {
              addTombstone({
                name: member.name,
                day: member.statusDay ?? state.day,
                mile: Math.floor(state.miles),
                reason,
                epitaph: input.value.trim(),
              });
              if (index + 1 < lost.length) {
                manager.swapTop(tombstoneScreen(manager, state, lost, index + 1));
              } else {
                manager.swapTop(scoreScreen(manager, state));
              }
            },
          },
        ]),
      );
      root.append(body);
      input.focus();
    },
  };
}
