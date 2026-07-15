import type { Screen } from '../ui/screen';
import { el, menu, pressSpace, prose, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState } from '../engine/types';
import type { Rng } from '../engine/rng';
import { applyEvent, type ResolvedEvent } from '../engine/events';

const REGISTER_TONE = { deadpan: undefined, grave: 'red', satire: 'amber' } as const;

/** Renders one resolved event: plain message, or a choice + its result. */
export function eventScreen(
  state: GameState,
  rng: Rng,
  resolved: ResolvedEvent,
  onDone: () => void,
): Screen {
  let applied = false;
  let resultText: string | null = null;

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      const tone = REGISTER_TONE[resolved.def.register];

      const render = (): void => {
        body.replaceChildren();
        body.append(el('div', undefined, ' '));

        if (resultText !== null) {
          body.append(prose(resultText, `prose${tone ? ` ${tone}` : ''}`));
          body.append(pressSpace('Press SPACE BAR to continue', onDone));
        } else if (resolved.def.choices) {
          body.append(prose(resolved.text, `prose${tone ? ` ${tone}` : ''}`));
          body.append(rule());
          body.append(
            menu(
              resolved.def.choices.map((c, i) => ({
                key: String(i + 1),
                label: c.label,
                onSelect: () => {
                  resultText = applyEvent(state, rng, resolved, i) ?? '';
                  state.rngState = rng.getState();
                  render();
                },
              })),
            ),
          );
        } else {
          if (!applied) {
            applied = true;
            applyEvent(state, rng, resolved);
            state.rngState = rng.getState();
          }
          body.append(prose(resolved.text, `prose${tone ? ` ${tone}` : ''}`));
          body.append(pressSpace('Press SPACE BAR to continue', onDone));
        }
        body.append(statusBar(state));
      };

      render();
      root.append(body);
    },
  };
}
