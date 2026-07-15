import type { EventDef } from '../contentTypes';
import { ACT1_EVENTS } from './act1';
import { ACT2_EVENTS, ACT3_EVENTS } from './stubs';

export const ALL_EVENTS: EventDef[] = [...ACT1_EVENTS, ...ACT2_EVENTS, ...ACT3_EVENTS];
