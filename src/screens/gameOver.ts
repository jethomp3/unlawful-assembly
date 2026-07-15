// Terminal states: arrival (slice end), leader detained, march wiped,
// or "go home" — the Complicit ending. Then tombstones, then the score.

import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, pressSpace, prose, rule } from '../ui/dom';
import type { GameState, GoneReason, PartyMember } from '../engine/types';
import { addTombstone, clearSave } from '../engine/save';
import { DEMONSTRATION_DAY } from '../data/route';
import { scoreScreen } from './scoreScreen';

const REASON_TEXT: Record<GoneReason, string> = {
  detained: 'detained indefinitely',
  deported: 'deported',
  hospitalized: 'hospitalized',
  left: 'went home',
};

/** Ending palette break: the body class that recolors the monitor. */
type EndingTint = 'defiant' | 'pyrrhic' | 'fall' | 'echo' | 'complicit';

interface Ending {
  text: string;
  tone?: 'red' | 'amber';
  tint?: EndingTint;
}

export function setEndingTint(tint: EndingTint | null): void {
  for (const cls of [...document.body.classList]) {
    if (cls.startsWith('ending-')) document.body.classList.remove(cls);
  }
  if (tint) document.body.classList.add(`ending-${tint}`);
}

function demonstrationEnding(state: GameState): Ending {
  const survivors = state.party.filter(
    (m) => m.status !== 'gone' && m.status !== 'detained',
  ).length;
  const late = state.day > DEMONSTRATION_DAY;
  const walkedWith =
    survivors >= 4
      ? 'Your whole group stands together at the end of it.'
      : survivors >= 2
        ? `${survivors} of you stand at the end of it. You carry the names of the rest.`
        : 'You stand at the end of it alone, carrying every name.';

  if (late) {
    return {
      tone: 'amber',
      tint: 'echo',
      text:
        'THE ECHO\n\n' +
        'You arrive on a Tuesday. The demonstration was Saturday.\n\n' +
        'The mall is a museum of it: flattened grass in the shape of a ' +
        'crowd, zip ties in the gutters, one shoe, a sign face-down that ' +
        'says the thing you walked four hundred miles to say.\n\n' +
        `${walkedWith}\n\n` +
        'A park ranger watches you stand there. "You should have seen ' +
        'it," she says. Then, quieter: "You should see the next one."\n\n' +
        'On a bar TV behind you, the news is already elsewhere: the ' +
        'President, pointing at a map of Greenland. The absurdity never ' +
        'stops. So you had better not either.\n\nTHE MARCH IS OVER. THE WALK ISN\'T.',
    };
  }

  if (state.crackdown >= 75) {
    return {
      tone: 'red',
      tint: 'fall',
      text:
        'THE FALL\n\n' +
        'The demonstration is technically permitted: one hour, one plaza, ' +
        'ringed by fencing with a single gate, under floodlights, under ' +
        'drones, under a new definition of the word "free."\n\n' +
        `${walkedWith}\n\n` +
        'You sing anyway. Through the wire. The guardsmen are ordered not ' +
        'to listen, which is not an order anyone knows how to follow.\n\n' +
        'It is not the country you left home to save. It is the one you ' +
        'will keep working in, underground where it has to be, in ' +
        'basements and group chats and church halls, until the wire comes ' +
        'down.\n\n' +
        'The last thing you see leaving the plaza is a state broadcast: ' +
        'the President unveiling REAL AMERICA (PENDING) across a map of ' +
        'Greenland. Nobody in the crowd is allowed to laugh.\n\nSomebody laughs.',
    };
  }

  if (state.support >= 55 && state.crackdown < 60) {
    return {
      tint: 'defiant',
      text:
        'DEFIANT\n\n' +
        'You come over the last rise and the sound arrives before the ' +
        'sight of it: a sea of people, banked against the dome like ' +
        'weather. Hundreds of thousands. The marshals wear vests marked ' +
        'WELCOME WALKERS, and when your column is announced — four ' +
        'hundred miles — the roar rolls back over you like the river.\n\n' +
        `${walkedWith}\n\n` +
        'Nothing is fixed. Everything is possible. Those turn out to be ' +
        'the same weather, felt from different porches.\n\n' +
        'On the jumbotron, between speakers, the news crawl slides past: ' +
        'GREENLAND DENIES BEING FOR SALE; WHITE HOUSE CALLS DENIAL ' +
        '"FLIRTING." A quarter million people boo, then laugh, then go ' +
        'back to the business of the republic.\n\n' +
        'The absurdity never stops. Neither, it turns out, do you.',
    };
  }

  return {
    tone: 'amber',
    tint: 'pyrrhic',
    text:
      'PYRRHIC\n\n' +
      'The demonstration happens. It is smaller than the dream and larger ' +
      'than the fear: a plaza half-full of the stubborn, ringed by a ' +
      'perimeter that decided, this time, mostly to watch.\n\n' +
      `${walkedWith}\n\n` +
      'A speaker says the country is at a crossroads. The crowd knows ' +
      'better. It is at a fork it will keep arriving at, every year, ' +
      'maybe forever. You did not win. You did not lose. You walked, and ' +
      'the walking was witnessed, and witness is the seed of everything.\n\n' +
      'On the ride out of the city, every screen at the depot plays the ' +
      'same clip: Greenland, relabeled, PENDING. The man beside you ' +
      'sighs: "It never stops." He shoulders his pack.\n\n"So we don\'t," you say.',
  };
}

function endingText(state: GameState): Ending {
  switch (state.over?.kind) {
    case 'arrived':
      return demonstrationEnding(state);
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
        tint: 'complicit',
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
  const { text, tone, tint } = endingText(state);

  return {
    mount(root) {
      // The palette break: after 400 green miles, the ending has a color.
      setEndingTint(tint ?? null);
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
