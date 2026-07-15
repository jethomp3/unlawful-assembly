// Act 3 (miles 320-400): the Beltway, the perimeter, the eve.
// The Capital does not get closer so much as everything else falls away.

import type { EventDef } from '../contentTypes';

const inAct3 = (miles: number) => miles > 320;

export const ACT3_EVENTS: EventDef[] = [
  // ---------- deadpan ----------
  {
    id: 'dc_organizers',
    register: 'deadpan',
    when: (s) => inAct3(s.miles),
    once: true,
    weight: 8,
    text:
      'Capital-area organizers meet you at a park-and-ride with printed ' +
      'maps, burner numbers, and a laminated sheet titled IF SEPARATED. ' +
      'They have done this before. It shows, and it helps.\n\n' +
      '+15 lbs supplies, +1 medkit, the plan feels real now',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.min(100, m.morale + 7);
      }
      return { supplies: 15, medkits: 1 };
    },
  },
  {
    id: 'federal_windows',
    register: 'deadpan',
    when: (s) => inAct3(s.miles),
    weight: 6,
    text:
      'You pass a federal office annex at lunch hour. Faces at the glass, ' +
      'dozens of them. Nobody waves — waving is a documented act now — ' +
      'but somebody holds a legal pad to the window. It says WE COUNT ' +
      'YOU EVERY DAY. It is gone by the time you pass the loading dock.',
    effect: { support: 3 },
  },
  {
    id: 'last_blister',
    register: 'deadpan',
    when: (s) => inAct3(s.miles),
    weight: 5,
    targetsMember: true,
    text: (_s, name) =>
      `${name}'s feet, three hundred and some miles in, stage a final ` +
      `protest of their own. Lose 1 day. Nobody complains about stopping. ` +
      `Nobody admits to being glad.`,
    effect: { daysLost: 1 },
  },
  {
    id: 'converging_marchers',
    register: 'deadpan',
    when: (s) => inAct3(s.miles),
    weight: (s) => (s.support > 40 ? 8 : 3),
    text:
      'At a highway junction, another column joins the road — sixty ' +
      'marchers out of the southwest, sunburned and singing something ' +
      'you don\'t know yet. By the second chorus you do.\n\n+Support',
    effect: { support: 6, heat: 2 },
  },

  // ---------- grave ----------
  {
    id: 'guard_convoy',
    register: 'grave',
    when: (s) => inAct3(s.miles),
    weight: (s) => 2 + s.crackdown / 22,
    text:
      'A National Guard convoy passes for a full hour: trucks, water ' +
      'cannon, a flatbed of fencing sections stacked like pallets of ' +
      'ordinary freight. Some of the drivers are nineteen. One mouths ' +
      'something at you. You will spend years deciding what.',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.max(0, m.morale - 5);
      }
      return { crackdown: 2 };
    },
  },
  {
    id: 'watchlist_stop',
    register: 'grave',
    when: (s) => inAct3(s.miles),
    once: true,
    weight: (s) => 2 + s.heat / 15,
    text: (s) =>
      `An unmarked sedan, two agents, a tablet with your face on it. ` +
      `They know your route. They know your mother's address. They ask ` +
      `${s.party[0]!.name} to "voluntarily" answer questions, and the word ` +
      `voluntarily has never sounded less like itself.`,
    choices: [
      {
        label: 'Answer nothing. Ask if you are being detained.',
        resultText:
          'Four times you ask. On the fourth, the older one almost ' +
          'smiles. "Enjoy your walk," he says, like a threat, like a ' +
          'concession. They pull away doing the speed limit.\n\n+Heat',
        effect: { heat: 7 },
      },
      {
        label: 'Give them nothing but pleasantries, warmly, at length.',
        resultText:
          'You discuss weather, blisters, and the local pennant race ' +
          'until the younger one is visibly dying. Somewhere a transcript ' +
          'of this will be marked NON-RESPONSIVE, which is the point.',
        effect: { heat: 3 },
      },
    ],
  },
  {
    id: 'eve_of_doubt',
    register: 'grave',
    when: (s) => inAct3(s.miles) && s.miles > 350,
    once: true,
    weight: 6,
    text:
      'The last camp. Nobody sleeps. Dee finally says the thing: "What ' +
      'if we get there and it changes nothing?" The fire pops. Four ' +
      'hundred miles of road sit with you at that fire, waiting to hear.',
    choices: [
      {
        label: '"Then it changes us. That\'s how it starts."',
        resultText:
          'Nobody cheers. It isn\'t that kind of night. But packs get ' +
          'repacked and boots get set by the fire to dry, which is what ' +
          'belief looks like from the outside.\n\n+Morale',
        effect: { support: 2 },
        memberEffect: { moraleDelta: 12 },
      },
      {
        label: 'Say nothing. Let the fire answer.',
        resultText:
          'The silence stretches until it becomes its own answer: you ' +
          'are all still here. In the morning, so is the road.\n\nThe group rests.',
        memberEffect: { healthDelta: 6 },
      },
    ],
    targetsMember: true,
    leaderOk: true,
  },

  // ---------- satire ----------
  {
    id: 'sponsored_kettle',
    register: 'satire',
    when: (s) => inAct3(s.miles) && s.crackdown > 45,
    once: true,
    weight: 5,
    text:
      'The perimeter staging area has bunting. A banner over the fencing ' +
      'reads: TONIGHT\'S PUBLIC ORDER OPERATION IS PRESENTED BY A ' +
      'STREAMING SERVICE — WATCH THE DOCUSERIES THIS FALL. A production ' +
      'assistant asks marchers to sign appearance waivers.',
    effect: { crackdown: 1 },
  },
  {
    id: 'wristband_scalpers',
    register: 'satire',
    when: (s) => inAct3(s.miles),
    once: true,
    weight: (s) => (s.support > 45 ? 5 : 2),
    text:
      'Outside the perimeter, scalpers are selling PROTEST-ADJACENT ' +
      'EXPERIENCE wristbands: observation-deck access, commemorative ' +
      'lanyard, "moral participation certificate" suitable for framing. ' +
      'Business is brisk. One offers your group a bulk discount to ' +
      'appear in selfies.',
    effect: { money: 15 },
  },
  {
    id: 'greenland_exhibit',
    register: 'satire',
    when: (s) => inAct3(s.miles),
    once: true,
    weight: 4,
    text:
      'A tour bus idles at a scenic overlook, rerouted from the locked-down ' +
      'monuments. The guide, gamely: "On your left, the future site of ' +
      'the National Greenland Annexation Museum, pending annexation. On ' +
      'your right — please don\'t photograph the right."',
    effect: {},
  },
  {
    id: 'senators_aide',
    register: 'satire',
    when: (s) => inAct3(s.miles),
    once: true,
    weight: (s) => (s.support > 50 ? 4 : 2),
    text:
      'A senator\'s aide in running clothes "happens" to jog beside the ' +
      'march. The senator admires your energy. The senator wonders if ' +
      'you would postpone arriving until after the recess, for optics. ' +
      'The senator is prepared to offer a meeting. The aide says the ' +
      'word "meeting" the way other people say "inheritance."',
    choices: [
      {
        label: 'Decline. The date was never yours to move.',
        resultText:
          'The aide jogs off, already dictating a memo about your ' +
          'inflexibility. That night the senator\'s office tweets a photo ' +
          'of an empty chair captioned WE EXTENDED A HAND. You are the ' +
          'chair.\n\n+Support',
        effect: { support: 4 },
      },
      {
        label: 'Take the meeting. Lose 2 days.',
        resultText:
          'The meeting is in a lobby annex with a man who is an assistant ' +
          'to a deputy. He thanks you for your passion and gives you a ' +
          'challenge coin. It is heavier than it looks. So is the delay.\n\nLose 2 days.',
        effect: { daysLost: 2, crackdown: -1 },
      },
    ],
  },
];
