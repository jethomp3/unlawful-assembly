// TODO(full game): Act 2 (miles 250-320) and Act 3 (miles 320-400) event
// tables, the Capital arrival events, and ending-specific epilogue events.
// Slice ships with these gated off by `when` so the engine path exists.

import type { EventDef } from '../contentTypes';

export const ACT2_EVENTS: EventDef[] = [
  {
    id: 'act2_placeholder',
    register: 'deadpan',
    weight: 0, // never fires; structure only
    when: (s) => s.miles > 250,
    text: 'TODO: Act 2 content — the suburbs, curfews, the Beltway approach.',
  },
];

export const ACT3_EVENTS: EventDef[] = [
  {
    id: 'act3_placeholder',
    register: 'grave',
    weight: 0,
    when: (s) => s.miles > 320,
    text: 'TODO: Act 3 content — the Capital perimeter, the demonstration eve.',
  },
];
