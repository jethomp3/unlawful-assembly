import type { CheckpointDef } from './contentTypes';

export const CHECKPOINTS: CheckpointDef[] = [
  {
    id: 'guard_overpass',
    title: 'GUARD CHECKPOINT — INTERSTATE 9 OVERPASS',
    report: (s) => {
      const strength =
        s.crackdown > 60
          ? 'The line is two shields deep and they have brought the good zip ties.'
          : s.crackdown > 35
            ? 'A full platoon, bored, which is worse than angry.'
            : 'A thin line. Weekend guardsmen checking phones.';
      const mood =
        s.heat > 50
          ? 'A sergeant is holding a printout. It has your route on it.'
          : s.heat > 25
            ? 'They watched you come up the road for a long mile.'
            : 'Nobody seems to have been told you were coming.';
      const weather =
        s.weather === 'rain'
          ? 'Rain drums on the overpass. Visibility is poor, tempers worse.'
          : s.weather === 'heatwave'
            ? 'Heat shimmers off the concrete. Everyone in armor is suffering.'
            : 'The light under the overpass is the color of a filing cabinet.';
      return `${strength}\n${mood}\n${weather}`;
    },
    strength: (s) => 0.3 + s.crackdown / 220 + s.heat / 280,
    lawyerCost: 350,
    detourDays: [2, 4],
    detourSupplyCost: 18,
    flavor: {
      pushClean:
        'You walk through single file, eyes ahead, papers ready. A young ' +
        'guardsman holds up his hand — and waves you past it. "My mom\'s ' +
        'at the one in Ohio," he says, to no one, to everyone.',
      pushRough:
        'It goes fine and then it does not. A shove becomes a scrum. ' +
        'When you regroup a mile on, packs are missing, someone is limping, ' +
        'and nobody got a badge number because there were no badges.',
      kettle:
        'The line does not open. It folds — around you.\n\n' +
        'Later you will learn the maneuver has a name, that it was drilled, ' +
        'budgeted, rehearsed on a fairground in June. The word is "kettle." ' +
        'A domestic word. A kitchen word.\n\n' +
        'They keep you six hours in the sun with your hands zipped. They ' +
        'take names slowly, on purpose. The vans fill in alphabetical order.',
      detour:
        'The old county road adds days and takes shoes. Twice you see the ' +
        'interstate glittering below, close enough to hear. A farmer lets ' +
        'the group sleep in his equipment barn and asks no questions, ' +
        'which in this year is a political position.',
      lawyer:
        'The legal caravan arrives with clipboard lanyards and dashcams: ' +
        'four retirees and a law student who has not slept since March. ' +
        'The Guard lieutenant reads the injunction twice and finds it, ' +
        'regrettably, real. You cross under escort, filmed from both sides.',
      wait:
        'You camp short of the overpass and let the news cycle move. ' +
        'Checkpoints are staffed by budgets, and budgets get bored.',
    },
  },
  // TODO(full game): 'meridian_bridge' checkpoint (Act 2 opener) and the
  // Capital perimeter checkpoint (Act 3).
];

export function checkpointById(id: string): CheckpointDef {
  const def = CHECKPOINTS.find((c) => c.id === id);
  if (!def) throw new Error(`unknown checkpoint: ${id}`);
  return def;
}
