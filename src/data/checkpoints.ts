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
  {
    id: 'meridian_bridge',
    title: 'MERIDIAN RIVER BRIDGE — STATE POLICE LINE',
    report: (s) => {
      const strength =
        s.crackdown > 60
          ? 'Cruisers parked nose to nose across all four lanes. A water cannon idles behind them like a bad idea waiting its turn.'
          : s.crackdown > 35
            ? 'State police at both towers, checking everyone who crosses. The line of waiting cars goes back a mile.'
            : 'A token presence: two cruisers and a bored sergeant working a crossword.';
      const media =
        s.support > 50
          ? 'Two news vans are already set up on the far bank. Cameras change what men in armor are willing to do in daylight.'
          : 'Nobody is watching the bridge but the river.';
      const river = 'Under everything, the Meridian moves the way it has for ten thousand years, uninterested in permits.';
      return `${strength}\n${media}\n${river}`;
    },
    strength: (s) => 0.38 + s.crackdown / 190 - (s.support > 50 ? 0.08 : 0) + s.heat / 300,
    lawyerCost: 500,
    detourDays: [3, 5],
    detourSupplyCost: 30,
    flavor: {
      pushClean:
        'You cross in a column of two, slow and loud, singing the one song ' +
        'everyone knows all the words to. The sergeant looks at the news vans, ' +
        'then at his crossword, and decides today is a crossword day.',
      pushRough:
        'Halfway across, the line tightens. There is shoving at the ' +
        'bottleneck, a pack pulled apart "for inspection," a knee that finds ' +
        'someone\'s back. You make the far bank with less than you carried in.',
      kettle:
        'They close both ends of the bridge at once.\n\n' +
        'A bridge is a corridor, and a corridor is a kettle that engineers ' +
        'built for them in advance. There is nowhere to go except the ' +
        'railing, and the river answers to no one, and everyone stays ' +
        'very still for a long time.\n\n' +
        'The processing takes all night. The river keeps moving.',
      detour:
        'The next crossing is an old rail trestle days upstream, plus a ' +
        'ferryman who takes cash and asks one question: "Marching?" He ' +
        'waves off the fare for half of you. "My kid\'s at the Capital ' +
        'already," he says. "Walk fast."',
      lawyer:
        'The legal caravan meets you at the bridge approach with an ' +
        'injunction covering "pedestrian transit of public infrastructure." ' +
        'The commander reads it with the expression of a man eating a ' +
        'lemon on camera, which he is.',
      wait:
        'You camp on the near bank. The river is good company: it has ' +
        'outlasted worse governments than this one.',
    },
  },
  {
    id: 'beltway_perimeter',
    title: 'CAPITAL BELTWAY — FEDERAL PERIMETER',
    report: (s) => {
      const strength =
        s.crackdown > 65
          ? 'This is not a checkpoint. It is a fortification: fencing, floodlights, and units with no insignia at all.'
          : s.crackdown > 40
            ? 'National Guard at every overpass, checking IDs against a list nobody is allowed to see.'
            : 'Guard units mostly waving traffic through. The demonstration has too many eyes on it to strangle openly.';
      const mood =
        s.heat > 55
          ? 'A drone has followed you for two days. It is following you now.'
          : s.support > 60
            ? 'Marchers from other roads are converging; the perimeter has more holes than guards tonight.'
            : 'The city inside glows like something behind glass.';
      return `${strength}\n${mood}\nThe Capital is twelve miles past the wire.`;
    },
    strength: (s) =>
      0.45 + s.crackdown / 160 - (s.support > 60 ? 0.12 : 0) + s.heat / 260,
    lawyerCost: 650,
    detourDays: [2, 3],
    detourSupplyCost: 20,
    flavor: {
      pushClean:
        'You go through at shift change, in the gap between one set of ' +
        'orders and the next, walking like people who belong — which, it ' +
        'occurs to you at the wire, you are. It is your capital. That was ' +
        'always the whole point.',
      pushRough:
        'An unmarked unit decides your paperwork is a suggestion. It costs ' +
        'you gear, skin, and an hour face-down on an off-ramp. But the ' +
        'perimeter is behind you, and the dome is ahead.',
      kettle:
        'Floodlights. From three sides, all at once, the way they drill it.\n\n' +
        'This close to the Capital they do not bother with county jails. ' +
        'The buses have federal plates and paper over the windows. The ' +
        'man reading your rights gets them slightly wrong, twice, and ' +
        'does not care.',
      detour:
        'A retired transit engineer walks you through the old service ' +
        'corridors under the interchange — storm drains, a freight spur, ' +
        'a parking garage with a broken gate she has been meaning to ' +
        'report for eleven years. "After you," she says at the last door.',
      lawyer:
        'It takes a federal injunction and a congressman\'s aide on ' +
        'speakerphone, but the wire opens. The lawyers look exhausted. ' +
        '"Don\'t waste it," one says, and goes back to sleep in the van.',
      wait:
        'You camp against the sound wall. All night, helicopters cross ' +
        'the sky inside the wire, drawing slow circles over the thing ' +
        'you walked four hundred miles to stand under.',
    },
  },
];

export function checkpointById(id: string): CheckpointDef {
  const def = CHECKPOINTS.find((c) => c.id === id);
  if (!def) throw new Error(`unknown checkpoint: ${id}`);
  return def;
}
