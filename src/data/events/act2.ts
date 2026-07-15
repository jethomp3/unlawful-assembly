// Act 2 (miles 250-320): across the river, into the suburbs.
// The country out here agrees with your message but not your methods.

import type { EventDef } from '../contentTypes';

const inAct2 = (miles: number) => miles > 250 && miles <= 320;

export const ACT2_EVENTS: EventDef[] = [
  // ---------- deadpan ----------
  {
    id: 'union_van',
    register: 'deadpan',
    when: (s) => inAct2(s.miles),
    weight: 9,
    text:
      'A panel van from Local 1199 finds you at dusk. Water, socks, and a ' +
      'cooler of casseroles labeled in six different handwritings.\n\n' +
      '+18 lbs supplies, +1 medkit',
    effect: { supplies: 18, medkits: 1 },
  },
  {
    id: 'lemonade_stand',
    register: 'deadpan',
    when: (s) => inAct2(s.miles),
    weight: 7,
    text:
      'Two kids run a lemonade stand at the end of a cul-de-sac. The sign ' +
      'says 50¢ FOR MARCHERS, $5 FOR COWARDS. Their mother watches from ' +
      'the porch and does not correct the sign.\n\n+$12, the group smiles for a mile',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.min(100, m.morale + 6);
      }
      return { money: 12 };
    },
  },
  {
    id: 'golf_course',
    register: 'deadpan',
    when: (s) => inAct2(s.miles),
    weight: 6,
    text:
      'The shortest route runs through a golf course. You take it. A man ' +
      'in salmon shorts shouts that this is private property. He is ' +
      'standing on a public easement. Nobody tells him. Lose half a day ' +
      'arguing anyway.\n\n-6 lbs supplies',
    effect: { supplies: -6 },
  },
  {
    id: 'suburban_shower',
    register: 'deadpan',
    when: (s) => inAct2(s.miles),
    weight: 6,
    text:
      'A retired teacher opens her house: five showers, one washing ' +
      'machine, no questions. On the fridge, a photo of her at a march ' +
      'in 1968. "Different sign," she says. "Same walk."\n\nThe group rests well.',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') {
          m.morale = Math.min(100, m.morale + 8);
          m.health = Math.min(100, m.health + 4);
        }
      }
      return {};
    },
  },

  // ---------- grave ----------
  {
    id: 'curfew_snatch',
    register: 'grave',
    when: (s) => inAct2(s.miles),
    weight: (s) => 1.5 + s.crackdown / 20,
    targetsMember: true,
    text: (_s, name) =>
      `The county enacted a "temporary movement ordinance" at 9 PM. At ` +
      `9:12, ${name} was walking back from the gas station bathroom.\n\n` +
      `You find out from a neighbor kid who filmed it through a blind.\n\n${name} has been detained.`,
    memberEffect: { status: 'detained' },
  },
  {
    id: 'drone_shadow',
    register: 'grave',
    when: (s) => inAct2(s.miles),
    weight: (s) => 1 + s.heat / 18,
    text:
      'A drone picks you up at the county line and holds station over the ' +
      'group all day. Too high to read markings. Low enough that you stop ' +
      'talking, then stop singing, then just walk.\n\n+Heat. The silence costs more.',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.max(0, m.morale - 6);
      }
      return { heat: 5 };
    },
  },
  {
    id: 'doxxed_escalation',
    register: 'grave',
    when: (s) => inAct2(s.miles) && s.party.some((m) => m.status === 'doxxed'),
    once: true,
    weight: 4,
    text: (s) => {
      const doxxed = s.party.find((m) => m.status === 'doxxed');
      const name = doxxed?.name ?? 'someone';
      return (
        `A pickup slows beside the march. The passenger reads ${name}'s ` +
        `home address off a phone, out loud, twice, and drives away doing ` +
        `the speed limit exactly.\n\nNothing happened, a lawyer would say. ` +
        `Everyone understands what happened.`
      );
    },
    effect: (s) => {
      const doxxed = s.party.find((m) => m.status === 'doxxed');
      if (doxxed) doxxed.morale = Math.max(0, doxxed.morale - 20);
      return { heat: 3 };
    },
  },
  {
    id: 'sympathetic_cop',
    register: 'grave',
    when: (s) => inAct2(s.miles),
    once: true,
    weight: 3,
    text:
      'An off-duty sheriff\'s deputy flags you down at a rest stop, out of ' +
      'uniform, hands where you can see them, force of habit in reverse. ' +
      '"They\'re staging at the fairgrounds for tomorrow," he says. "Take ' +
      'Route 9. I didn\'t say it." He looks older than his face.',
    choices: [
      {
        label: 'Trust him. Take Route 9.',
        resultText:
          'Route 9 adds three quiet miles. At dusk you hear, far off ' +
          'behind you, the sound of the fairgrounds emptying at nothing.\n\n-Heat',
        effect: { heat: -8 },
      },
      {
        label: "Don't trust him. Hold your route.",
        resultText:
          'You hold your route. The staging was real; the line stops you ' +
          'for two hours of document theater, and takes a duffel as a ' +
          'souvenir.\n\n-10 lbs supplies, +Heat',
        effect: { supplies: -10, heat: 6 },
      },
    ],
  },

  // ---------- satire ----------
  {
    id: 'hoa_citation',
    register: 'satire',
    when: (s) => inAct2(s.miles),
    once: true,
    weight: 5,
    text:
      'The Willow Bend Homeowners Association issues the march a citation ' +
      'for "unpermitted hope" (Bylaw 12, Section C, Visual Clutter). The ' +
      'fine is $75 or the removal of your expressions. A man in a polo ' +
      'takes photos of your shoes for the file.',
    effect: { crackdown: 1 },
  },
  {
    id: 'liberty_gardens',
    register: 'satire',
    when: (s) => inAct2(s.miles),
    once: true,
    weight: 4,
    text:
      'The town of Elm Grove has renamed itself Liberty Gardens to ' +
      'qualify for the federal Patriotic Municipalities Grant. The old ' +
      'water tower still says ELM GROVE. A crew is painting over it at ' +
      'time-and-a-half, which is the grant, spent.',
    effect: {},
  },
  {
    id: 'both_sides_news',
    register: 'satire',
    when: (s) => inAct2(s.miles),
    once: true,
    weight: (s) => (s.support > 35 ? 5 : 2),
    text:
      'A local news crew wants a segment. For balance, they will pair ' +
      'your four-hundred-mile march with a man who honked at you once.',
    choices: [
      {
        label: 'Do the segment. Any lens is a lens.',
        resultText:
          'It airs as "PASSIONS HIGH ON BOTH SIDES." The honking man is ' +
          'identified as a "local transportation advocate." Still — your ' +
          'faces reach forty thousand living rooms, and living rooms have ' +
          'doors.\n\n+Support, +Heat',
        effect: { support: 6, heat: 5 },
      },
      {
        label: 'Decline politely.',
        resultText:
          'The segment runs anyway, using drone footage and the word ' +
          '"shadowy." The honking man gets four minutes.',
        effect: { support: -1 },
      },
    ],
  },
  {
    id: 'megachurch_lot',
    register: 'satire',
    when: (s) => inAct2(s.miles),
    once: true,
    weight: 4,
    text:
      'A megachurch the size of an airport offers its parking lot for the ' +
      'night — Lot F, near the retention pond — on the condition that ' +
      'nobody photographs the marquee, which currently reads OBEDIENCE ' +
      'IS THE HIGHEST FREEDOM.',
    choices: [
      {
        label: 'Take the lot. Sleep beats principle tonight.',
        resultText:
          'Flat asphalt, working floodlights, a security guard who ' +
          'pretends not to see the extra water you take. Everyone sleeps. ' +
          'Nobody photographs the marquee. Everyone memorizes it.\n\n+8 lbs supplies',
        effect: { supplies: 8, heat: -2 },
      },
      {
        label: 'Decline, and photograph the marquee.',
        resultText:
          'The photo does numbers. The church issues a statement about ' +
          'persecution. You sleep in a drainage easement, rich in ' +
          'followers, poor in lumbar support.\n\n+Support, +Heat, the group sleeps badly',
        effect: { support: 5, heat: 4, footage: 6 },
      },
    ],
  },
];
