import type { LandmarkDef } from './contentTypes';

export const TOTAL_MILES = 400;
export const DEMONSTRATION_DAY = 40;

/** Arrival at this landmark ends the vertical slice with the score screen. */
export const SLICE_END_ID = 'meridian_bridge';

export const ROUTE: LandmarkDef[] = [
  {
    id: 'hollis_falls',
    name: 'Hollis Falls',
    mile: 0,
    kind: 'start',
    arrivalText: 'Home. For now.',
  },
  {
    id: 'camden_line',
    name: 'Camden County Line',
    mile: 45,
    kind: 'town',
    arrivalText:
      'A hand-painted sign at the county line reads WE STILL LIVE HERE. ' +
      'A woman on a porch raises a fist without looking up from her beans.',
    arrivalEffect: { supplies: 10, support: 2 },
  },
  {
    id: 'merrick_university',
    name: 'State University at Merrick',
    mile: 90,
    kind: 'town',
    arrivalText:
      'Students meet you at the quad. Half of them film everything. ' +
      'The other half have learned not to be filmed. The march grows ' +
      'louder for a night, and the donation jar fills.',
    arrivalEffect: { money: 120, support: 6, heat: 4 },
  },
  {
    id: 'interstate_overpass',
    name: 'Interstate 9 Overpass',
    mile: 120,
    kind: 'checkpoint',
    arrivalText:
      'Under the overpass, the road narrows to a single lane between ' +
      'concrete barriers. Shields glint in the shade.',
    checkpointId: 'guard_overpass',
  },
  {
    id: 'saint_brigids',
    name: "Saint Brigid's Sanctuary Church",
    mile: 160,
    kind: 'sanctuary',
    arrivalText:
      'The pastor does not ask for names. Cots in the basement, soup on ' +
      'the stove, a lookout in the bell tower. For one night, everyone sleeps.',
    arrivalEffect: { supplies: 20, medkits: 1 },
  },
  {
    id: 'calder_works',
    name: 'Calder Works',
    mile: 210,
    kind: 'town',
    arrivalText:
      'The factory closed in 2009. The town stayed. Old union men walk ' +
      'the first mile out with you, arguing about which strike was worse.',
    arrivalEffect: { support: 4, supplies: 8 },
  },
  {
    id: 'meridian_bridge',
    name: 'Meridian River Bridge',
    mile: 250,
    kind: 'checkpoint',
    arrivalText:
      'The Meridian is wide and brown and patient. There is one bridge. ' +
      'Everyone who marches to the Capital crosses here, and everyone ' +
      'who wants to stop a march knows it.',
    // Full game: second major checkpoint. Slice: arrival = end of slice.
  },
  {
    id: 'fort_ashby',
    name: 'Fort Ashby Suburbs',
    mile: 320,
    kind: 'town',
    // TODO(full game): Act 3 content. Suburban ambivalence, curfew events.
    arrivalText: 'Lawn signs for both sides, sometimes on the same lawn.',
  },
  {
    id: 'capital',
    name: 'The Capital',
    mile: 400,
    kind: 'capital',
    // TODO(full game): demonstration finale, ending selection by Support/Crackdown.
    arrivalText: 'The dome, at last, small and white as a tooth.',
  },
];

export function nextLandmark(routeIndex: number): LandmarkDef | undefined {
  return ROUTE[routeIndex];
}
