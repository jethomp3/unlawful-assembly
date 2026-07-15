// The slice's event table: the first 250 miles.
// Three registers, deliberately shuffled: deadpan retro, grave, satire.

import type { EventDef } from '../contentTypes';

export const ACT1_EVENTS: EventDef[] = [
  // ---------- deadpan retro (resource events) ----------
  {
    id: 'diner_owner',
    register: 'deadpan',
    weight: 10,
    text:
      'A diner owner flags you down at the edge of town. "My grandfather ' +
      'marched. Sit down, all of you." The group eats for free.\n\n+14 lbs supplies',
    effect: { supplies: 14, support: 1 },
  },
  {
    id: 'blisters',
    register: 'deadpan',
    weight: 10,
    targetsMember: true,
    text: (_s, name) => `${name} has blisters. Lose 1 day.`,
    effect: { daysLost: 1 },
  },
  {
    id: 'water_donation',
    register: 'deadpan',
    weight: 8,
    text:
      'Off-duty nurses hand out water bottles and check feet at a gas ' +
      'station. One of them falls in with you for a mile, then goes back ' +
      'to her shift.\n\n+10 lbs supplies, +1 medkit',
    effect: { supplies: 10, medkits: 1 },
  },
  {
    id: 'lost_shoe',
    register: 'deadpan',
    weight: 6,
    targetsMember: true,
    text: (_s, name) =>
      `${name}'s boot sole came off at mile marker 61. Duct tape holds ` +
      `civilization together. Lose half a day.\n\n-6 lbs supplies`,
    effect: { supplies: 6 },
  },
  {
    id: 'wrong_turn',
    register: 'deadpan',
    weight: 6,
    text: 'You followed the county detour signs. The county detour signs were wrong. Lose 1 day.',
    effect: { daysLost: 1 },
  },
  {
    id: 'livestream_viral',
    register: 'deadpan',
    weight: (s) => (s.profile === 'loud' ? 9 : 3),
    text:
      "Last night's livestream hit 200,000 views while you slept. Most " +
      'comments are supportive. The rest know where you are.\n\n+Support, +Heat',
    effect: { support: 5, heat: 4, money: 60 },
  },
  {
    id: 'church_basement',
    register: 'deadpan',
    weight: 7,
    text:
      'A congregation lets you sleep in the fellowship hall. There is a ' +
      'casserole. There is always a casserole.\n\nThe group rests well.',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.min(100, m.morale + 8);
      }
      return {};
    },
  },
  {
    id: 'tire_slashed',
    register: 'deadpan',
    weight: 6,
    text:
      'Someone slashed the tires on your supply cart overnight and left a ' +
      'note that says GO HOME. You are, technically, trying to go to a ' +
      'better one.\n\n-12 lbs supplies',
    effect: { supplies: -12 },
  },

  // ---------- grave (member-targeting, the cost) ----------
  {
    id: 'underpass_vans',
    register: 'grave',
    weight: (s) => 2 + s.crackdown / 18 + s.heat / 25,
    targetsMember: true,
    text: (_s, name) =>
      `At the underpass, two unmarked vans. Men in plain clothes with ` +
      `patches they bought online. They have a list. ${name} is on it.\n\n` +
      `It takes eleven seconds. Nobody gets a badge number.\n\n${name} has been detained.`,
    memberEffect: { status: 'detained' },
  },
  {
    id: 'doxxed',
    register: 'grave',
    weight: (s) => 1.5 + s.heat / 20,
    targetsMember: true,
    once: true,
    text: (_s, name) =>
      `${name}'s face, name, and home address are on a forum tonight, over ` +
      `the word TRAITOR. Their mother calls, crying, asking them to come home.\n\n` +
      `${name} stays. ${name} does not sleep.`,
    memberEffect: { status: 'doxxed', moraleDelta: -25 },
  },
  {
    id: 'tear_gas_residue',
    register: 'grave',
    weight: (s) => 1 + s.crackdown / 25,
    targetsMember: true,
    text: (_s, name) =>
      `A county deputy empties a canister at a crowd you were only walking ` +
      `past. ${name} catches it worse than the rest of you. All night they ` +
      `breathe like a rusted gate.\n\n${name} is sick.`,
    memberEffect: { status: 'sick', healthDelta: -15 },
  },
  {
    id: 'whistle_town',
    register: 'grave',
    once: true,
    weight: (s) => (s.miles > 60 ? 4 : 0),
    text:
      'In this town they whistle: two short, one long, passed porch to ' +
      'porch, faster than the vans can drive. You hear it start behind you ' +
      'as you walk in, and by the time you reach the square the streets are ' +
      'empty and the raid finds nothing.\n\nAn old man on a bench does not ' +
      'look up. "Third one this month," he says. "You get good at it."',
    effect: { support: 3, crackdown: 1 },
  },
  {
    id: 'family_raid_choice',
    register: 'grave',
    once: true,
    weight: (s) => 2 + s.crackdown / 20,
    choices: [
      {
        label: 'Intervene. Put bodies and cameras between them.',
        resultText:
          'You stand in the driveway and film. They have a quota, not a ' +
          'mission; tonight the paperwork beats the cruelty, and they leave. ' +
          'The family will not stop shaking. Neither will Dee.\n\n+Support, +Heat',
        effect: { support: 6, heat: 8, footage: 10 },
      },
      {
        label: 'Keep walking. You cannot save everyone and also arrive.',
        resultText:
          'You keep walking. The sound a door makes when it is kicked in ' +
          'is not loud. That is the thing nobody tells you. It is not loud ' +
          'at all.\n\nThe group is quiet for the rest of the day.',
        effect: { crackdown: 1 },
      },
    ],
    text:
      'One block over: engines, a megaphone, a woman shouting a name. A ' +
      'raid, mid-supper. You have maybe ninety seconds to decide what kind ' +
      'of people you are.',
  },
  {
    id: 'checkpoint_shakedown',
    register: 'grave',
    weight: (s) => 1 + s.crackdown / 22,
    text:
      'A "supply inspection" at a county line. The deputies take what they ' +
      'like and call it evidence. There is no receipt. There is no crime. ' +
      'There is a smirk.\n\n-15 lbs supplies, -$40',
    effect: { supplies: -15, money: -40 },
  },

  // ---------- satire (the country, changing) ----------
  {
    id: 'eo_flags',
    register: 'satire',
    once: true,
    weight: 5,
    text:
      'EXECUTIVE ORDER 14-201: All flags must be flown at a size ' +
      '"proportionate to patriotism." A federal Flag Adequacy Task Force ' +
      'is established. Its budget is larger than the Weather Service.',
    effect: { crackdown: 2 },
  },
  {
    id: 'eo_vocabulary',
    register: 'satire',
    once: true,
    weight: (s) => (s.crackdown > 30 ? 5 : 2),
    text:
      'The Department of Justice announces that the word "protest" will be ' +
      'retired from official usage in favor of "pre-riot." Asked whether ' +
      'this affects the First Amendment, the spokesman says the First ' +
      'Amendment "remains fully operational."',
    effect: { crackdown: 2 },
  },
  {
    id: 'sponsored_checkpoint',
    register: 'satire',
    once: true,
    weight: (s) => (s.crackdown > 40 ? 5 : 1),
    text:
      'The checkpoint outside Millard is sponsored. There is a banner: ' +
      'THIS SECURITY PAUSE BROUGHT TO YOU BY A MATTRESS COMPANY. The ' +
      'officer who searches your bags recites a promo code, twice, as ' +
      'required by contract.',
    effect: { crackdown: 1 },
  },
  {
    id: 'patriot_points',
    register: 'satire',
    once: true,
    weight: (s) => (s.crackdown > 35 ? 4 : 2),
    text:
      'A new federal app awards Patriot Points for reporting "suspicious ' +
      'pedestrians." A man at a rest stop shows you his score, apologizes, ' +
      'and reports you anyway. He is saving up for the airline tier.\n\n+Heat',
    effect: { heat: 6 },
  },
  {
    id: 'greenland_early',
    register: 'satire',
    once: true,
    weight: (s) => (s.day > 10 ? 3 : 0),
    text:
      'On every TV in the truck stop: the President, in front of a map of ' +
      'Greenland, which has been relabeled REAL AMERICA (PENDING). The ' +
      'anchors debate whether it is a joke. They have been debating whether ' +
      'it is a joke for eleven years.',
    effect: {},
  },
  {
    id: 'militia_escort',
    register: 'satire',
    weight: (s) => (s.support > 30 ? 3 : 1),
    text:
      'Six men in tactical vests follow the march in golf carts for an ' +
      'hour, filming you filming them filming you. One cart runs out of ' +
      'charge. Nobody helps him. It is the funniest thing anyone has seen ' +
      'in weeks.\n\n+Morale, +Heat',
    effect: (s) => {
      for (const m of s.party) {
        if (m.status === 'ok') m.morale = Math.min(100, m.morale + 5);
      }
      return { heat: 3 };
    },
  },

  // ---------- choice events (the small dilemmas) ----------
  {
    id: 'reporter_interview',
    register: 'deadpan',
    once: true,
    weight: (s) => (s.support > 20 ? 4 : 2),
    text:
      'A reporter from a national outlet wants you on camera, name and ' +
      'face. "Anonymous marchers are a mob," she says. "A name is a story."',
    choices: [
      {
        label: 'Give her the interview. Names matter.',
        resultText:
          'It runs that night. Your mother sees it. So does everyone ' +
          'else.\n\n+Support, +Heat',
        effect: { support: 8, heat: 7 },
      },
      {
        label: 'Decline. Live to march tomorrow.',
        resultText:
          'She shrugs. The segment runs anyway, calling the march ' +
          '"leaderless," which stings mostly because of how hard you work ' +
          'to lead it.',
        effect: { support: 1 },
      },
    ],
  },
  {
    id: 'undercover_spotted',
    register: 'grave',
    once: true,
    weight: (s) => 1 + s.heat / 20,
    text:
      'Maria clocks him first: new boots, clean pack, asks too many ' +
      'questions about "plans." He has been walking with you for two days. ' +
      'He is a cop, or worse, a hobbyist.',
    choices: [
      {
        label: 'Expose him loudly, in front of everyone.',
        resultText:
          'He leaves without arguing, which tells you everything. That ' +
          'night the group argues about who else it could be. Trust is the ' +
          'first casualty; it just dies slowest.\n\n+Heat',
        effect: { heat: 6, support: 2 },
      },
      {
        label: 'Feed him nonsense and let him file it.',
        resultText:
          'For three days you discuss, loudly, a completely fictional plan ' +
          'to hold a bake sale on federal land. Somewhere, an analyst is ' +
          'typing "bundt" into a threat matrix.',
        effect: { crackdown: -2 },
      },
    ],
  },
];
