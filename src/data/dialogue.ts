// "Talk to the group": one line per member, keyed by status then morale band.

import type { PartyMember } from '../engine/types';

const BY_STATUS: Partial<Record<PartyMember['status'], string[]>> = {
  injured: [
    '"It looks worse than it is." It looks bad.',
    '"I can keep up. Just... maybe not today."',
  ],
  sick: [
    'They wave you off mid-cough. "Save the medkit. Someone will need it more."',
    '"I\'ll be fine by the bridge." They believe it, which helps exactly one of you.',
  ],
  doxxed: [
    '"My sister keeps sending me screenshots. I asked her to stop. She can\'t."',
    'They keep their hood up now, even at night. "It\'s not for the cold."',
  ],
  detained: ['(being held — the lawyer\'s voicemail is full)'],
  gone: [''],
};

const HIGH_MORALE = [
  '"You hear them in that last town? We\'re not crazy. That\'s the thing. We\'re not crazy."',
  '"My feet hurt in a way I\'m weirdly proud of."',
  '"When we get there — when, not if — I\'m sleeping for a week. After."',
  '"I keep thinking about who marched so I could vote. Figure I owe the next ones the same walk."',
];

const MID_MORALE = [
  '"I\'m fine. Ask me tomorrow though."',
  '"Do you think it\'s working? Don\'t answer fast. Think about it first."',
  '"I stopped reading the comments. Best decision of the whole march."',
  '"Long way still. Long way behind us too, I guess."',
];

const LOW_MORALE = [
  '"I called home last night. I shouldn\'t have called home."',
  '"Every town we pass I think: they could just close the road. Any of them. Any day."',
  '"I\'m not quitting. I just need you to know it\'s a choice I make again every morning."',
  '"What if we get there and it doesn\'t matter?" They don\'t wait for an answer.',
];

export function memberLine(m: PartyMember, roll: number): string {
  const statusLines = BY_STATUS[m.status];
  if (statusLines && statusLines.length > 0 && m.status !== 'ok') {
    return statusLines[Math.floor(roll * statusLines.length)]!;
  }
  const pool = m.morale >= 65 ? HIGH_MORALE : m.morale >= 30 ? MID_MORALE : LOW_MORALE;
  return pool[Math.floor(roll * pool.length)]!;
}
