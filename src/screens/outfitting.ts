import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import type { ClassDef } from '../data/contentTypes';
import { STORE_ITEMS } from '../data/storeItems';
import { createInitialState } from '../engine/state';
import { saveGame } from '../engine/save';
import { travelScreen } from './travel';

/**
 * The general store. "You have $X left." You can't overspend and the
 * clerk doesn't do refunds on regret.
 */
export function outfittingScreen(
  manager: ScreenManager,
  def: ClassDef,
  names: string[],
): Screen {
  // Steps purchased per item id.
  const cart = new Map<string, number>(STORE_ITEMS.map((it) => [it.id, 0]));

  const spent = () =>
    STORE_ITEMS.reduce((sum, it) => sum + (cart.get(it.id) ?? 0) * it.price, 0);
  const left = () => def.kit.money - spent();

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, "Hollis Falls Surplus & Sundry"));
      body.append(
        el(
          'div',
          'dim',
          '"Marching, huh," the clerk says, and rings you up like it\'s 1988.',
        ),
      );
      body.append(rule());

      const table = el('table', 'store');
      const moneyLine = el('div', 'amber');

      const redraw = () => {
        moneyLine.textContent = `You have $${left()} left.`;
        table.replaceChildren();
        const header = el('tr');
        for (const h of ['item', '', 'qty', '', 'cost']) {
          header.append(el('th', 'dim', h));
        }
        table.append(header);

        for (const it of STORE_ITEMS) {
          const steps = cart.get(it.id) ?? 0;
          const row = el('tr');

          row.append(el('td', undefined, `${it.label} (${it.price}$/${it.step} ${it.unit})`));

          const minus = el('button', 'qty-btn', '-');
          minus.setAttribute('aria-label', `Less ${it.label}`);
          minus.addEventListener('click', () => {
            if (steps > 0) cart.set(it.id, steps - 1);
            redraw();
          });
          const tdMinus = el('td');
          tdMinus.append(minus);
          row.append(tdMinus);

          row.append(el('td', 'num', `${steps * it.step}`));

          const plus = el('button', 'qty-btn', '+');
          plus.setAttribute('aria-label', `More ${it.label}`);
          plus.addEventListener('click', () => {
            if (left() >= it.price) cart.set(it.id, steps + 1);
            redraw();
          });
          const tdPlus = el('td');
          tdPlus.append(plus);
          row.append(tdPlus);

          row.append(el('td', 'num dim', `$${steps * it.price}`));
          table.append(row);
        }
      };
      redraw();

      body.append(moneyLine, table);
      for (const it of STORE_ITEMS) body.append(el('div', 'dim', `* ${it.note}`));
      body.append(rule());

      body.append(
        menu([
          {
            key: '1',
            label: 'Shoulder the packs and go',
            onSelect: () => {
              const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
              const state = createInitialState(def.id, names, def.kit, seed);
              state.money = left();
              state.supplies += (cart.get('supplies') ?? 0) * 25;
              state.medkits += cart.get('medkits') ?? 0;
              state.batteries += cart.get('batteries') ?? 0;
              state.bailFund += (cart.get('bailFund') ?? 0) * 100;
              saveGame(state);
              manager.replace(travelScreen(manager, state));
            },
          },
        ]),
      );
      root.append(body);
    },
  };
}
