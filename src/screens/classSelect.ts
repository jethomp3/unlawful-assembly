import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, prose, rule } from '../ui/dom';
import { CLASSES } from '../data/classes';
import type { ClassDef } from '../data/contentTypes';
import { partyNamesScreen } from './partyNames';

export function classSelectScreen(manager: ScreenManager): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Who are you, before all this?'));
      body.append(
        el(
          'div',
          'dim',
          'Your circumstances decide what the road costs you. They always did.',
        ),
      );
      body.append(rule());

      body.append(
        menu(
          CLASSES.map((c, i) => ({
            key: String(i + 1),
            label: `${c.name}`,
            note: `(${c.difficulty})`,
            onSelect: () => manager.push(classDetailScreen(manager, c)),
          })),
        ),
      );
      root.append(body);
    },
  };
}

function classDetailScreen(manager: ScreenManager, def: ClassDef): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, def.name));
      body.append(rule());
      body.append(prose(def.blurb));
      body.append(el('div', undefined, ' '));
      for (const perk of def.perks) {
        body.append(el('div', 'dim', `- ${perk}`));
      }
      body.append(rule());
      body.append(
        menu([
          {
            key: '1',
            label: `March as the ${def.name}`,
            onSelect: () => manager.replace(partyNamesScreen(manager, def)),
          },
          { key: '2', label: 'Choose someone else', onSelect: () => manager.pop() },
        ]),
      );
      root.append(body);
    },
  };
}
