import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import type { ClassDef } from '../data/contentTypes';
import { DEFAULT_PARTY_NAMES } from '../data/classes';
import { outfittingScreen } from './outfitting';
// Circular with classSelect.ts is fine: both only export factory functions.
import { classSelectScreen } from './classSelect';

export function partyNamesScreen(manager: ScreenManager, def: ClassDef): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Name your affinity group'));
      body.append(
        el(
          'div',
          'dim',
          'Five of you. You trained together: what to carry, whom to call, ' +
            'what not to say. Names matter later. Choose ones you can grieve.',
        ),
      );
      body.append(rule());

      const inputs: HTMLInputElement[] = [];
      DEFAULT_PARTY_NAMES.forEach((name, i) => {
        const row = el('div');
        row.append(el('span', 'dim', i === 0 ? 'You:   ' : `${i + 1}:     `));
        const input = el('input');
        input.type = 'text';
        input.maxLength = 12;
        input.value = name;
        input.setAttribute('aria-label', i === 0 ? 'Your name' : `Member ${i + 1} name`);
        inputs.push(input);
        row.append(input);
        body.append(row);
      });

      body.append(rule());
      body.append(
        menu([
          {
            key: '1',
            label: 'These are our names',
            onSelect: () => {
              const names = inputs.map(
                (inp, i) => inp.value.trim() || DEFAULT_PARTY_NAMES[i]!,
              );
              manager.replace(outfittingScreen(manager, def, names));
            },
          },
          {
            key: '2',
            label: 'Go back',
            onSelect: () => manager.replace(classSelectScreen(manager)),
          },
        ]),
      );
      root.append(body);
    },
  };
}
