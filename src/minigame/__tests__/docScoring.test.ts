import { describe, expect, it } from 'vitest';
import { evaluateShot, officerFramed, ZOOM_BANDS } from '../docScoring';
import { createCamera } from '../camera';
import type { DocScene, Officer } from '../docScene';
import { shotAnchors } from '../docScene';

function officer(x: number, phase: Officer['phase'] = 'idle'): Officer {
  return {
    id: 0,
    x,
    y: 190,
    minX: x - 50,
    maxX: x + 50,
    speed: 10,
    dir: 1,
    phase,
    phaseT: 1,
    facing: 1,
    taken: { action: false, face: false, badge: false },
  };
}

function scene(officers: Officer[], blockers: DocScene['blockers'] = []): DocScene {
  return {
    kind: 'arrest',
    brief: '',
    officers,
    blockers,
    subject: { x: officers[0] ? officers[0].x + 14 : 0, y: 190 },
  };
}

function aimAt(cam: ReturnType<typeof createCamera>, x: number, y: number, zoom: number) {
  cam.zoom = zoom;
  cam.cx = x;
  cam.cy = y;
}

describe('evaluateShot', () => {
  it('scores a badge shot only in the tight zoom band', () => {
    const o = officer(320);
    const s = scene([o]);
    const cam = createCamera();
    const badge = shotAnchors(o).badge;

    aimAt(cam, badge.x, badge.y, 3.0);
    const hit = evaluateShot(s, cam, 0);
    expect(hit?.type).toBe('badge');
    expect(hit!.quality).toBeGreaterThan(0.8);
  });

  it('rejects a badge shot at wide zoom (falls back to another type)', () => {
    const o = officer(320);
    const s = scene([o]);
    const cam = createCamera();
    const badge = shotAnchors(o).badge;
    aimAt(cam, badge.x, badge.y, 1.0);
    const hit = evaluateShot(s, cam, 0);
    // At 1.0x the badge band (2.5-4.0) contributes nothing; if anything
    // scores it must not be the badge.
    if (hit) expect(hit.type).not.toBe('badge');
  });

  it('action shots require the action phase', () => {
    const o = officer(320, 'idle');
    const s = scene([o]);
    const cam = createCamera();
    const anchor = shotAnchors(o).action;
    aimAt(cam, anchor.x, anchor.y, 1.2);
    const miss = evaluateShot(s, cam, 0);
    expect(miss?.type ?? null).not.toBe('action');

    const o2 = officer(320, 'action');
    const s2 = scene([o2]);
    aimAt(cam, shotAnchors(o2).action.x, shotAnchors(o2).action.y, 1.2);
    const hit = evaluateShot(s2, cam, 0);
    expect(hit?.type).toBe('action');
    expect(hit!.footage).toBeGreaterThan(0);
  });

  it('does not double-count the same shot type on one officer', () => {
    const o = officer(320);
    const s = scene([o]);
    const cam = createCamera();
    const face = shotAnchors(o).face;
    aimAt(cam, face.x, face.y, 2.0);
    const first = evaluateShot(s, cam, 0);
    expect(first?.type).toBe('face');
    const second = evaluateShot(s, cam, 0);
    expect(second?.type ?? null).not.toBe('face');
  });

  it('occlusion wrecks quality', () => {
    const o = officer(320);
    const cam = createCamera();
    const face = shotAnchors(o).face;

    const clearScene = scene([officer(320)]);
    aimAt(cam, face.x, face.y, 2.0);
    const clearShot = evaluateShot(clearScene, cam, 0);

    const blocked = scene([officer(320)], [
      { x: face.x, y: face.y + 30, w: 30, h: 60, vx: 0 },
    ]);
    const blockedShot = evaluateShot(blocked, cam, 0);

    expect(clearShot!.quality).toBeGreaterThan((blockedShot?.quality ?? 0) * 5);
  });

  it('saturation halves value on the news-cycle curve', () => {
    const cam = createCamera();
    const o1 = officer(320);
    const face = shotAnchors(o1).face;
    aimAt(cam, face.x, face.y, 2.0);
    const fresh = evaluateShot(scene([officer(320)]), cam, 0);
    const tired = evaluateShot(scene([officer(320)]), cam, 3);
    expect(tired!.footage).toBeLessThan(fresh!.footage * 0.5);
  });

  it('zoom bands cover the full range without gaps', () => {
    const edges = [ZOOM_BANDS.action, ZOOM_BANDS.face, ZOOM_BANDS.badge];
    expect(edges[0]![1]).toBe(edges[1]![0]);
    expect(edges[1]![1]).toBe(edges[2]![0]);
  });
});

describe('officerFramed', () => {
  it('detects framed vs empty view', () => {
    const s = scene([officer(320)]);
    const cam = createCamera();
    aimAt(cam, 320, 175, 2);
    expect(officerFramed(s, cam)).toBe(true);
    aimAt(cam, 40, 40, 4);
    expect(officerFramed(s, cam)).toBe(false);
  });
});
