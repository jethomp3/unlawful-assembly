import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState } from '../engine/types';
import { createRng, type Rng } from '../engine/rng';
import { advanceDay, type DayItem, type SimOptions } from '../engine/sim';
import { saveGame } from '../engine/save';
import { TUNING } from '../engine/meters';
import { classById } from '../data/classes';
import { ALL_EVENTS } from '../data/events';
import { ROUTE, FINAL_LANDMARK_ID, TOTAL_MILES, DEMONSTRATION_DAY } from '../data/route';
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
  resupplyScreen,
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

type MarchPhase = 'idle' | 'anim' | 'pause';

export function travelScreen(manager: ScreenManager, state: GameState): Screen {
  const rng: Rng = createRng(state.rngState);
  const march = createMarchStrip();
  const classDef = classById(state.classId);

  // Auto-continue: 3s of marching per day, 0.5s pause, then the next day —
  // until a reading screen interrupts. Reading screens are always manual;
  // the rhythm resumes when we're back on this screen.
  let phase: MarchPhase = 'idle';
  let timer = 0;
  let resumeMarching = false;

  // Rebuilt on every mount; refreshed in place between auto-days.
  let infoEl: HTMLElement | null = null;
  let tickerSpan: HTMLElement | null = null;
  let statusHost: HTMLElement | null = null;
  let hintEl: HTMLElement | null = null;

  if (import.meta.env.DEV) {
    // Debug hook: inspect/poke state from the console during development.
    (window as unknown as { __state: GameState }).__state = state;
  }

  const simOpts = (mode: SimOptions['mode']): SimOptions => ({
    events: ALL_EVENTS,
    route: ROUTE,
    classDef,
    finalLandmarkId: FINAL_LANDMARK_ID,
    mode,
  });

  function startDayAnim(): void {
    if (state.over) return;
    phase = 'anim';
    timer = TUNING.marchAnimSeconds;
    refresh();
  }

  function stopMarching(): void {
    phase = 'idle';
    resumeMarching = false;
    refresh();
  }

  /** The Continue action: start marching, or cut the pause short. */
  function onContinue(): void {
    if (phase === 'idle' || phase === 'pause') startDayAnim();
  }

  function completeDay(): void {
    const result = advanceDay(state, rng, simOpts('march'));
    saveGame(state);
    if (result.items.length > 0) {
      resumeMarching = !state.over;
      phase = 'idle';
      playQueue(result.items);
    } else if (state.over) {
      manager.replace(gameOverScreen(manager, state));
    } else {
      phase = 'pause';
      timer = TUNING.marchPauseSeconds;
      refresh();
    }
  }

  function runRestDay(): void {
    const result = advanceDay(state, rng, simOpts('rest'));
    saveGame(state);
    if (result.items.length > 0) playQueue(result.items);
    else if (state.over) manager.replace(gameOverScreen(manager, state));
    else refresh();
  }

  function playQueue(items: DayItem[]): void {
    let pushed = false;
    const next = (): void => {
      saveGame(state);
      const item = items.shift();
      if (!item) {
        if (state.over) {
          manager.replace(gameOverScreen(manager, state));
        } else if (pushed) {
          manager.pop(); // travel re-mounts; the rhythm resumes there
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
          } else if (lm.store && !state.over) {
            manager.swapTop(resupplyScreen(state, lm.name, next));
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

  function buildInfo(): HTMLElement {
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
    return info;
  }

  function refresh(): void {
    if (infoEl) {
      const fresh = buildInfo();
      infoEl.replaceWith(fresh);
      infoEl = fresh;
    }
    if (tickerSpan) {
      const headlines = tickerHeadlines(state.crackdown);
      tickerSpan.textContent = headlines[state.day % headlines.length]!;
    }
    if (statusHost) {
      statusHost.replaceChildren(statusBar(state));
    }
    if (hintEl) {
      hintEl.textContent =
        phase === 'idle'
          ? 'Type the number of your choice, or press SPACE BAR to march.'
          : 'The march moves. ESC or any menu number to halt.';
      hintEl.className = phase === 'idle' ? 'centered dim' : 'centered amber';
    }
  }

  /** Menu actions other than Continue halt the auto-march first. */
  const halting = (fn: () => void) => () => {
    phase = 'idle';
    resumeMarching = false;
    fn();
  };

  const self: Screen = {
    mount(root) {
      // A blockade reached before a reload is still standing there.
      if (state.pendingCheckpoint && !state.over) {
        const id = state.pendingCheckpoint;
        setTimeout(() => {
          if (manager.top === self && state.pendingCheckpoint === id) {
            manager.push(checkpointScreen(manager, state, rng, id, () => manager.pop()));
          }
        }, 0);
      }

      const body = el('div', 'screen-body');

      body.append(march.element);

      const ticker = el('div', 'ticker');
      tickerSpan = el('span');
      ticker.append(tickerSpan);
      ticker.setAttribute('aria-label', 'news ticker');
      body.append(ticker);

      infoEl = buildInfo();
      body.append(infoEl, rule());

      const theMenu = menu([
        { key: '1', label: 'Continue the march', onSelect: onContinue },
        {
          key: '2',
          label: 'Change pace',
          note: PACE_LABEL[state.pace],
          onSelect: halting(() => manager.push(paceScreen(manager, state))),
        },
        {
          key: '3',
          label: 'Change profile',
          note: PROFILE_LABEL[state.profile],
          onSelect: halting(() => manager.push(profileScreen(manager, state))),
        },
        {
          key: '4',
          label: 'Rest',
          onSelect: halting(() => manager.push(restScreen(manager, state, runRestDay))),
        },
        {
          key: '5',
          label: 'Check supplies',
          onSelect: halting(() => manager.push(suppliesScreen(manager, state))),
        },
        {
          key: '6',
          label: 'Talk to the group',
          onSelect: halting(() => manager.push(talkScreen(manager, state, rng))),
        },
        {
          key: '7',
          label: 'Document',
          note: state.batteries > 0 ? `${state.batteries} batteries` : 'no batteries',
          disabled: state.batteries <= 0,
          onSelect: halting(() =>
            manager.push(
              documentationScreen(manager, state, rng, classDef, () => {
                saveGame(state);
                if (state.over) manager.replace(gameOverScreen(manager, state));
                else manager.pop();
              }),
            ),
          ),
        },
        {
          key: '8',
          label: 'Look at the map',
          onSelect: halting(() => manager.push(mapScreen(manager, state))),
        },
      ]);
      // SPACE at the hub marches, like every other screen's continue.
      const continueBtn = theMenu.querySelector<HTMLButtonElement>('[data-key="1"]');
      if (continueBtn) continueBtn.dataset.space = 'true';
      body.append(theMenu);

      hintEl = el('div');
      body.append(hintEl);

      statusHost = el('div');
      body.append(statusHost);
      root.append(body);

      // Reading screens are manual; back on the road, the rhythm resumes.
      if (resumeMarching && !state.over) {
        resumeMarching = false;
        phase = 'anim';
        timer = TUNING.marchAnimSeconds;
      }
      refresh();
    },
    unmount() {
      infoEl = null;
      tickerSpan = null;
      statusHost = null;
      hintEl = null;
    },
    onKey(e) {
      if (e.key === 'Escape' && phase !== 'idle') {
        stopMarching();
        return true;
      }
      return false;
    },
    tick(dt) {
      march.tick(dt, state, phase === 'anim');
      if (phase === 'anim') {
        timer -= dt;
        if (timer <= 0) completeDay();
      } else if (phase === 'pause') {
        timer -= dt;
        if (timer <= 0) startDayAnim();
      }
    },
  };

  return self;
}
