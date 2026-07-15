import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import { hasSave, loadGame, loadHighScores, loadTombstones } from '../engine/save';
import { classSelectScreen } from './classSelect';
import { travelScreen } from './travel';

const TITLE_ART = `
╔══════════════════════════════════════════╗
║                                          ║
║      U N L A W F U L                     ║
║              A S S E M B L Y             ║
║                                          ║
║        an american trail, 2026           ║
║                                          ║
╚══════════════════════════════════════════╝`;

export function titleScreen(manager: ScreenManager): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('pre', 'title-art', TITLE_ART));

      body.append(
        el(
          'div',
          'centered dim',
          'The demonstration at the Capital is in 40 days. It is 400 miles away.',
        ),
      );
      body.append(rule());

      const canContinue = hasSave();
      body.append(
        menu([
          {
            key: '1',
            label: 'Begin a new march',
            onSelect: () => manager.replace(classSelectScreen(manager)),
          },
          {
            key: '2',
            label: 'Continue your march',
            disabled: !canContinue,
            onSelect: () => {
              const state = loadGame();
              if (state) manager.replace(travelScreen(manager, state));
            },
          },
          {
            key: '3',
            label: 'Visit the memorial',
            onSelect: () => manager.push(memorialScreen(manager)),
          },
          {
            key: '4',
            label: 'Toggle CRT effect',
            onSelect: () => document.body.classList.toggle('no-crt'),
          },
        ]),
      );

      body.append(
        el(
          'div',
          'centered dim',
          'Type the number of your choice, or click.',
        ),
      );
      root.append(body);
    },
  };
}

function memorialScreen(manager: ScreenManager): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'The Memorial'));
      body.append(rule());

      const stones = loadTombstones();
      if (stones.length === 0) {
        body.append(el('div', 'dim', 'No one has been lost on this road. Yet.'));
      } else {
        for (const t of stones.slice().reverse()) {
          const stone = el('div');
          stone.append(el('div', 'white', `† ${t.name}`));
          stone.append(el('div', 'dim', `   mile ${t.mile}, day ${t.day} — ${t.reason}`));
          if (t.epitaph) stone.append(el('div', 'dim', `   "${t.epitaph}"`));
          stone.append(el('div', undefined, ' '));
          body.append(stone);
        }
      }

      body.append(rule());
      body.append(el('h2', undefined, 'High Scores'));
      const scores = loadHighScores();
      if (scores.length === 0) {
        body.append(el('div', 'dim', 'No march has been scored.'));
      } else {
        scores.forEach((s, i) => {
          body.append(
            el('div', undefined, `${String(i + 1).padStart(2)}. ${s.score}  ${s.classId} — ${s.outcome}`),
          );
        });
      }

      body.append(
        menu([{ key: '1', label: 'Back', onSelect: () => manager.pop() }]),
      );
      root.append(body);
    },
  };
}
