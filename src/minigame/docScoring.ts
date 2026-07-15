// Shot evaluation: quality = framing x zoomFit x timing x occlusion.
// Higher-zoom shot types are worth more footage and more risk.

import type { Camera } from './camera';
import { framingError, inFrame, worldToScreen, VIEW_W, VIEW_H } from './camera';
import type { DocScene, Officer } from './docScene';
import { shotAnchors } from './docScene';
import { saturationFactor } from '../engine/meters';

export type ShotType = 'action' | 'face' | 'badge';

export const ZOOM_BANDS: Record<ShotType, [number, number]> = {
  action: [1.0, 1.75],
  face: [1.75, 2.5],
  badge: [2.5, 4.0],
};

const BASE_VALUE: Record<ShotType, number> = {
  action: 30,
  face: 20,
  badge: 40,
};

export interface ShotEval {
  type: ShotType;
  officer: Officer;
  quality: number; // 0..1
  footage: number;
  label: string;
}

function zoomFit(type: ShotType, zoom: number): number {
  const [lo, hi] = ZOOM_BANDS[type];
  if (zoom >= lo && zoom <= hi) return 1;
  const dist = zoom < lo ? lo - zoom : zoom - hi;
  return Math.max(0, 1 - dist / 0.75);
}

function occluded(scene: DocScene, cam: Camera, wx: number, wy: number): boolean {
  const target = worldToScreen(cam, wx, wy);
  for (const b of scene.blockers) {
    const topLeft = worldToScreen(cam, b.x - b.w / 2, b.y - b.h);
    const botRight = worldToScreen(cam, b.x + b.w / 2, b.y);
    if (
      target.x >= topLeft.x &&
      target.x <= botRight.x &&
      target.y >= topLeft.y &&
      target.y <= botRight.y
    ) {
      return true;
    }
  }
  return false;
}

function qualityLabel(type: ShotType, quality: number): string {
  if (quality >= 0.75) {
    return `CLEAR — ADMISSIBLE. ${
      type === 'badge'
        ? 'A badge number. They hate that.'
        : type === 'face'
          ? 'A face with a name somewhere.'
          : 'It will be described as an isolated incident.'
    }`;
  }
  if (quality >= 0.45) return 'USABLE. A lawyer could work with this.';
  return 'BLURRY. "Image too unclear for identification."';
}

/**
 * Evaluate the shutter press: find the best-scoring shot type not yet
 * taken on any framed officer. Returns null if nothing scoreable is framed.
 */
export function evaluateShot(
  scene: DocScene,
  cam: Camera,
  saturation: number,
): ShotEval | null {
  let best: ShotEval | null = null;

  for (const o of scene.officers) {
    const anchors = shotAnchors(o);
    for (const type of ['badge', 'face', 'action'] as ShotType[]) {
      if (o.taken[type]) continue;
      const anchor = anchors[type];
      if (!inFrame(cam, anchor.x, anchor.y)) continue;

      // The wide shot needs the context: officer AND subject in frame,
      // and it only counts while the act is actually happening.
      if (type === 'action') {
        if (o.phase !== 'action') continue;
        if (scene.subject && !inFrame(cam, scene.subject.x, scene.subject.y)) continue;
      }

      const framing = 1 - framingError(cam, anchor.x, anchor.y);
      const fit = zoomFit(type, cam.zoom);
      if (fit <= 0) continue;
      // Timing rewards shooting during the act; it boosts value, not clarity.
      const timing = type === 'action' ? 2.0 : o.phase === 'action' ? 1.3 : 1.0;
      const occ = occluded(scene, cam, anchor.x, anchor.y) ? 0.1 : 1.0;

      const quality = Math.min(1, framing * fit * occ);
      const footage = BASE_VALUE[type] * quality * timing;

      if (!best || footage > best.footage) {
        best = {
          type,
          officer: o,
          quality,
          footage,
          label: qualityLabel(type, quality),
        };
      }
    }
  }

  if (best) {
    best.officer.taken[best.type] = true;
    best.footage *= saturationFactor(saturation);
    best.footage = Math.round(best.footage * 10) / 10;
  }
  return best;
}

/** Is any officer currently visible in frame? Danger decays when not. */
export function officerFramed(scene: DocScene, cam: Camera): boolean {
  return scene.officers.some((o) => {
    const s = worldToScreen(cam, o.x, o.y - 15);
    return s.x >= -20 && s.x <= VIEW_W + 20 && s.y >= -20 && s.y <= VIEW_H + 20;
  });
}
