import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, rule } from '../ui/dom';
import type { GameState } from '../engine/types';
import { computeScore } from '../engine/score';
import { addHighScore } from '../engine/save';
import { classById } from '../data/classes';
import { DEMONSTRATION_DAY } from '../data/route';
import { titleScreen } from './title';

const OUTCOME_LABEL: Record<string, string> = {
  arrived: 'reached the Capital',
  detained: 'detained indefinitely',
  wiped: 'the march broke',
  abandoned: 'went home',
};

export function scoreScreen(manager: ScreenManager, state: GameState): Screen {
  const classDef = classById(state.classId);
  const result = computeScore(state, classDef.scoreMultiplier, DEMONSTRATION_DAY);
  const outcome = OUTCOME_LABEL[state.over?.kind ?? 'wiped'] ?? 'unknown';

  addHighScore({
    score: result.total,
    classId: classDef.name,
    outcome,
    date: new Date().toISOString().slice(0, 10),
  });

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'The Reckoning'));
      body.append(rule());

      for (const line of result.lines) {
        const row = el('div', 'spread');
        row.append(el('span', 'dim', line.label), el('span', undefined, String(line.points)));
        body.append(row);
      }
      body.append(rule());

      const sub = el('div', 'spread');
      sub.append(el('span', undefined, 'Subtotal'), el('span', undefined, String(result.subtotal)));
      body.append(sub);

      const mult = el('div', 'spread');
      mult.append(
        el('span', 'dim', `As the ${classDef.name}`),
        el('span', 'amber', `x${result.multiplier}`),
      );
      body.append(mult);

      const total = el('div', 'spread');
      total.append(
        el('span', 'white', 'TOTAL'),
        el('span', 'white', String(result.total)),
      );
      body.append(total);

      body.append(rule());
      body.append(
        el(
          'div',
          'dim centered',
          state.over?.kind === 'abandoned'
            ? 'Some scores are not points.'
            : 'The road remembers everyone who walked it.',
        ),
      );

      body.append(
        menu([
          {
            key: '1',
            label: 'Return to the title',
            onSelect: () => manager.replace(titleScreen(manager)),
          },
        ]),
      );
      root.append(body);
    },
  };
}
