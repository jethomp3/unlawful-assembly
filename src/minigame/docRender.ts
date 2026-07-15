// Canvas rendering for the Documentation mini-game: the world through
// the viewfinder. All prose/meters are DOM; this draws only pixels.

import type { Camera } from './camera';
import { VIEW_H, VIEW_W, WORLD_W, worldToScreen } from './camera';
import type { DocScene, Officer } from './docScene';
import { PALETTE } from '../render/sprites';

const G = PALETTE.g!;
const D = PALETTE.d!;
const F = PALETTE.f!;
const W_ = PALETTE.w!;
const A = PALETTE.a!;
const R = PALETTE.r!;
const K = PALETTE.k!;

function px(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  wx: number,
  wy: number,
  w: number,
  h: number,
  color: string,
): void {
  const { x, y } = worldToScreen(cam, wx, wy);
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w * cam.zoom), Math.ceil(h * cam.zoom));
}

function drawOfficer(ctx: CanvasRenderingContext2D, cam: Camera, o: Officer): void {
  const f = o.facing;
  // legs
  px(ctx, cam, o.x - 3, o.y - 10, 2, 10, D);
  px(ctx, cam, o.x + 1, o.y - 10, 2, 10, D);
  // torso (armored: slightly wide)
  px(ctx, cam, o.x - 4, o.y - 24, 8, 14, D);
  // badge: a tiny bright pixel on the chest — the thing worth 4x zoom
  px(ctx, cam, o.x + f * 2 - 1, o.y - 22, 2, 2, A);
  // head + helmet
  px(ctx, cam, o.x - 3, o.y - 31, 6, 7, G);
  px(ctx, cam, o.x - 4, o.y - 33, 8, 4, D);
  // visor
  px(ctx, cam, o.x - 3 + (f > 0 ? 2 : 0), o.y - 29, 4, 2, K);

  // arm + baton by phase
  if (o.phase === 'windup') {
    px(ctx, cam, o.x + f * 4, o.y - 26, 2, 6, D); // arm raised back
    px(ctx, cam, o.x + f * 5, o.y - 32, 2, 7, W_); // baton up: the telegraph
  } else if (o.phase === 'action') {
    px(ctx, cam, o.x + f * 4, o.y - 22, 5, 2, D); // arm extended
    px(ctx, cam, o.x + f * 8, o.y - 21, 6, 2, R); // baton mid-swing
  } else {
    px(ctx, cam, o.x + f * 4, o.y - 22, 2, 8, D); // arm at side
  }
}

export function renderDocScene(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  scene: DocScene,
  timeLeft: number,
): void {
  ctx.fillStyle = K;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Backdrop: a street of dark storefronts.
  for (let i = 0; i < 8; i++) {
    const bx = i * 90;
    px(ctx, cam, bx, 150, 70, 40, F);
    px(ctx, cam, bx + 8, 158, 16, 12, K);
    px(ctx, cam, bx + 40, 158, 16, 12, K);
  }
  // Ground.
  px(ctx, cam, 0, 190, WORLD_W, 2, D);
  for (let i = 0; i < 24; i++) px(ctx, cam, i * 28, 200, 12, 1, F);

  // Vans, if it's that kind of scene.
  if (scene.kind === 'raid') {
    px(ctx, cam, 60, 168, 46, 22, F);
    px(ctx, cam, 66, 172, 12, 8, K);
    px(ctx, cam, 500, 168, 46, 22, F);
  }

  // The subject: a small figure, low.
  if (scene.subject) {
    const s = scene.subject;
    px(ctx, cam, s.x - 5, s.y - 4, 10, 3, G); // prone body
    px(ctx, cam, s.x + 5, s.y - 6, 3, 3, G); // head
  }

  // Officers.
  for (const o of scene.officers) drawOfficer(ctx, cam, o);

  // Foreground crowd blockers: dark silhouettes closest to the lens.
  for (const b of scene.blockers) {
    px(ctx, cam, b.x - b.w / 2, b.y - b.h, b.w, b.h, K);
    px(ctx, cam, b.x - b.w / 2 + 1, b.y - b.h + 1, b.w - 2, b.h - 2, F);
    px(ctx, cam, b.x - 3, b.y - b.h - 4, 7, 5, F); // head
  }

  // ---- viewfinder chrome (screen space) ----
  ctx.fillStyle = D;
  // corner brackets
  const L = 10;
  for (const [cx, cy, dx, dy] of [
    [4, 4, 1, 1],
    [VIEW_W - 5, 4, -1, 1],
    [4, VIEW_H - 5, 1, -1],
    [VIEW_W - 5, VIEW_H - 5, -1, -1],
  ] as const) {
    ctx.fillRect(cx, cy, dx * L, 1);
    ctx.fillRect(cx, cy, 1, dy * L);
  }
  // crosshair
  ctx.fillRect(VIEW_W / 2 - 6, VIEW_H / 2, 4, 1);
  ctx.fillRect(VIEW_W / 2 + 3, VIEW_H / 2, 4, 1);
  ctx.fillRect(VIEW_W / 2, VIEW_H / 2 - 6, 1, 4);
  ctx.fillRect(VIEW_W / 2, VIEW_H / 2 + 3, 1, 4);
  // REC dot + zoom + timer, tiny fixed labels
  ctx.fillStyle = R;
  ctx.fillRect(8, 8, 3, 3);
  ctx.fillStyle = G;
  ctx.font = '7px monospace';
  ctx.fillText(`${cam.zoom.toFixed(1)}x`, 14, 14);
  ctx.fillText(`${Math.max(0, Math.ceil(timeLeft))}s`, VIEW_W - 24, 14);
}

/** Copy the current viewport into a small thumbnail for the results screen. */
export function snapThumbnail(source: HTMLCanvasElement): HTMLCanvasElement {
  const thumb = document.createElement('canvas');
  thumb.width = 80;
  thumb.height = 50;
  thumb.className = 'pixel';
  thumb.style.width = '80px';
  thumb.style.height = '50px';
  thumb.style.border = '1px solid #1d9e1d';
  const tctx = thumb.getContext('2d')!;
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, 80, 50);
  return thumb;
}
