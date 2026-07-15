import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState } from '../engine/types';
import { createRng, type Rng } from '../engine/rng';
import { advanceDay, type DayItem, type SimOptions } from '../engine/sim';
import { saveGame } from '../engine/save';
import { classById } from '../data/classes';
import { ALL_EVENTS } from '../data/events';
import { ROUTE, SLICE_END_ID, TOTAL_MILES, DEMONSTRATION_DAY } from '../data/route';
import { tickerHeadlines } from '../data/ticker';
import { createMarchStrip } from '../render/march';
import { eventScreen } from './eventScreen';
import {
  paceScreen,
  profileScreen,
  restScreen,
  suppliesScreen,
  talkScreen,
  mapScreen,
  bailScreen,
  messageScreen,
} from './travelMenus';
import { checkpointScreen } from './checkpoint';
import { gameOverScreen } from './gameOver';
import { documentationScreen } from '../minigame/documentation';

const PACE_LABEL = { grueling: 'grueling', steady: 'steady', cautious: 'cautious' };
const PROFILE_LABEL = {
  loud: 'loud & visible',
  mixed: 'steady presence',
  low: 'gray & quiet',
};

export function travelScreen(manager: ScreenManager, state: GameState): Screen {
  const rng: Rng = createRng(state.rngState);
  const march = createMarchStrip();
  const classDef = classById(state.classId);

  if (import.meta.env.DEV) {
    // Debug hook: inspect/poke state from the console during development.
    (window as unknown as { __state: GameState }).__state = state;
  }

  const simOpts = (mode: SimOptions['mode']): SimOptions => ({
    events: ALL_EVENTS,
    route: ROUTE,
    classDef,
    finalLandmarkId: SLICE_END_ID,
    mode,
  });

  function runDay(mode: SimOptions['mode']): void {
    const result = advanceDay(state, rng, simOpts(mode));
    saveGame(state);
    playQueue(result.items);
  }

  function playQueue(items: DayItem[]): void {
    let pushed = false;
    const next = (): void => {
      saveGame(state);
      const item = items.shift();
      if (!item) {
        // Back to the road. If something during the queue ended the game
        // (an applied event took the leader), catch it here.
        if (state.over) {
          manager.replace(gameOverScreen(manager, state));
        } else if (pushed) {
          manager.pop();
        } else {
          manager.swapTop(self); // quiet day: just re-render the road
        }
        return;
      }
      const screen = screenFor(item, next);
      if (pushed) {
        manager.swapTop(screen);
      } else {
        manager.push(screen);
        pushed = true;
      }
    };
    next();
  }

  function screenFor(item: DayItem, next: () => void): Screen {
    switch (item.type) {
      case 'note':
        return messageScreen(item.text, item.tone, next);
      case 'event':
        return eventScreen(state, rng, item.resolved, next);
      case 'landmark': {
        const lm = item.landmark;
        return messageScreen(`${lm.name.toUpperCase()}\n\n${lm.arrivalText}`, undefined, () => {
          if (lm.checkpointId && !state.over) {
            manager.swapTop(checkpointScreen(manager, state, rng, lm.checkpointId, next));
          } else {
            next();
          }
        });
      }
      case 'bail':
        return bailScreen(state, item.memberName, item.cost, next);
      case 'gameOver':
        return {
          mount() {
            manager.replace(gameOverScreen(manager, state));
          },
        };
    }
  }

  const self: Screen = {
    mount(root) {
      const body = el('div', 'screen-body');

      body.append(march.element);

      // Ticker: the country, changing, one headline per night.
      const headlines = tickerHeadlines(state.crackdown);
      const ticker = el('div', 'ticker');
      const span = el('span', undefined, headlines[state.day % headlines.length]!);
      ticker.append(span);
      ticker.setAttribute('aria-label', 'news ticker');
      body.append(ticker);

      const nextLm = ROUTE[state.routeIndex];
      const toGo = nextLm ? Math.max(0, Math.ceil(nextLm.mile - state.miles)) : 0;
      const info = el('div', 'spread');
      info.append(
        el('span', undefined, `Mile ${Math.floor(state.miles)} of ${TOTAL_MILES}`),
        el('span', 'dim', nextLm ? `${nextLm.name}: ${toGo} mi ahead` : 'The Capital'),
        el(
          'span',
          state.day > DEMONSTRATION_DAY - 10 ? 'amber' : 'dim',
          `Demonstration: day ${DEMONSTRATION_DAY}`,
        ),
      );
      body.append(info, rule());

      body.append(
        menu([
          { key: '1', label: 'Continue the march', onSelect: () => runDay('march') },
          {
            key: '2',
            label: 'Change pace',
            note: PACE_LABEL[state.pace],
            onSelect: () => manager.push(paceScreen(manager, state)),
          },
          {
            key: '3',
            label: 'Change profile',
            note: PROFILE_LABEL[state.profile],
            onSelect: () => manager.push(profileScreen(manager, state)),
          },
          {
            key: '4',
            label: 'Rest',
            onSelect: () =>
              manager.push(restScreen(manager, state, () => runDay('rest'))),
          },
          {
            key: '5',
            label: 'Check supplies',
            onSelect: () => manager.push(suppliesScreen(manager, state)),
          },
          {
            key: '6',
            label: 'Talk to the group',
            onSelect: () => manager.push(talkScreen(manager, state, rng)),
          },
          {
            key: '7',
            label: 'Document',
            note:
              state.batteries > 0
                ? `${state.batteries} batteries`
                : 'no batteries',
            disabled: state.batteries <= 0,
            onSelect: () =>
              manager.push(
                documentationScreen(manager, state, rng, classDef, () => {
                  saveGame(state);
                  if (state.over) manager.replace(gameOverScreen(manager, state));
                  else manager.pop();
                }),
              ),
          },
          {
            key: '8',
            label: 'Look at the map',
            onSelect: () => manager.push(mapScreen(manager, state)),
          },
        ]),
      );

      body.append(statusBar(state));
      root.append(body);
    },
    tick(dt) {
      march.tick(dt, state);
    },
  };

  return self;
}
