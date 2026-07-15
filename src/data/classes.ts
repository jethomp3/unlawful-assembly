import type { ClassDef } from './contentTypes';

// Privilege is the difficulty setting. Banker / Carpenter / Farmer, reskinned.
export const CLASSES: ClassDef[] = [
  {
    id: 'tech',
    name: 'Tech Worker',
    difficulty: 'easy',
    blurb:
      'Remote job, good savings, a lawyer cousin. You can afford to be brave. ' +
      'You can also afford to go home.',
    perks: [
      'Starts with $2,400',
      'First arrest: released with a warning',
      'Final score x1',
    ],
    scoreMultiplier: 1,
    kit: {
      money: 2400,
      supplies: 200,
      medkits: 3,
      bailFund: 500,
      batteries: 6,
      support: 10,
      crackdown: 20,
    },
    dangerMod: 1.0,
    firstArrestWaived: true,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    difficulty: 'medium',
    blurb:
      'Union member. Twenty-nine students who ask you questions you can no ' +
      'longer answer with the approved curriculum.',
    perks: [
      'Starts with $1,200',
      'Union network: allies along the route',
      'Final score x2',
    ],
    scoreMultiplier: 2,
    kit: {
      money: 1200,
      supplies: 150,
      medkits: 2,
      bailFund: 300,
      batteries: 4,
      support: 15,
      crackdown: 20,
    },
    dangerMod: 1.1,
  },
  {
    id: 'organizer',
    name: 'Undocumented Organizer',
    difficulty: 'hard',
    blurb:
      'You have done this work for years for people who could not risk doing ' +
      'it themselves. Now the risk has found you anyway.',
    perks: [
      'Starts with $600',
      'Community intel: checkpoint strength known in advance',
      'Detention may mean deportation',
      'Final score x3',
    ],
    scoreMultiplier: 3,
    kit: {
      money: 600,
      supplies: 120,
      medkits: 1,
      bailFund: 200,
      batteries: 3,
      support: 20,
      crackdown: 25,
    },
    dangerMod: 1.5,
    checkpointForewarning: true,
    detentionDeportRisk: 0.5,
  },
];

export function classById(id: string): ClassDef {
  const def = CLASSES.find((c) => c.id === id);
  if (!def) throw new Error(`unknown class: ${id}`);
  return def;
}

export const DEFAULT_PARTY_NAMES = ['You', 'Maria', 'Marcus', 'Rosa', 'Dee'];
