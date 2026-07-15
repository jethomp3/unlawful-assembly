// The travel-screen marching strip: parallax ground and skyline,
// one walker per living member, weather effects.

import type { GameState } from '../engine/types';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { PALETTE, SIGN, WALKER_FRAMES } from './sprites';

const W = 320;
const H = 100;
const GROUND_Y = 84;

export interface MarchStrip {
  element: HTMLElement;
  tick(dt: number, state: GameState, moving: boolean): void;
}

export function createMarchStrip(): MarchStrip {
  const pc: PixelCanvas = createPixelCanvas(W, H);
  const frame = document.createElement('div');
  frame.className = 'march-frame';
  frame.append(pc.canvas);

  const observer = new ResizeObserver(() => {
    const parentWidth = frame.parentElement?.clientWidth ?? W * 2;
    pc.fit(parentWidth);
  });
  observer.observe(document.body);

  let scroll = 0;
  let walkPhase = 0;
  const rainDrops = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 53) % W,
    y: (i * 31) % H,
  }));

  function tick(dt: number, state: GameState, moving: boolean): void {
    const marching = moving && !state.over;
    const speed = marching ? 26 : 0;
    scroll += speed * dt;
    if (marching) walkPhase += dt * 6;

    const { ctx } = pc;
    ctx.fillStyle = PALETTE.k!;
    ctx.fillRect(0, 0, W, H);

    // Far skyline: slow parallax blocks (towns you are always between).
    ctx.fillStyle = PALETTE.f!;
    for (let i = 0; i < 10; i++) {
      const bx = ((i * 67 - scroll * 0.2) % (W + 60)) + 30;
      const x = bx < -30 ? bx + W + 60 : bx;
      const bh = 8 + ((i * 37) % 18);
      ctx.fillRect(Math.floor(x - 30), GROUND_Y - 20 - bh, 18, bh + 20);
    }

    // Telephone poles: mid parallax.
    ctx.fillStyle = PALETTE.d!;
    for (let i = 0; i < 5; i++) {
      const px = ((i * 90 - scroll * 0.7) % (W + 20)) + 10;
      const x = px < -10 ? px + W + 20 : px;
      ctx.fillRect(Math.floor(x - 10), GROUND_Y - 34, 2, 34);
      ctx.fillRect(Math.floor(x - 14), GROUND_Y - 32, 10, 1);
    }

    // Ground line and dashes.
    ctx.fillStyle = PALETTE.d!;
    ctx.fillRect(0, GROUND_Y, W, 1);
    ctx.fillStyle = PALETTE.f!;
    for (let i = 0; i < 12; i++) {
      const dx = ((i * 30 - scroll) % (W + 10)) + 5;
      const x = dx < -5 ? dx + W + 10 : dx;
      ctx.fillRect(Math.floor(x - 5), GROUND_Y + 6, 12, 1);
    }

    // The group: one walker per member still on the road.
    const walkers = state.party.filter(
      (m) => m.status !== 'gone' && m.status !== 'detained',
    );
    walkers.forEach((m, i) => {
      const frameIdx = Math.floor(walkPhase + i * 0.7) % 2;
      const sprite = WALKER_FRAMES[marching ? frameIdx : 0]!;
      const x = 120 - i * 18;
      const bob = marching ? Math.floor(walkPhase * 2 + i) % 2 : 0;
      const y = GROUND_Y - 12 - bob;
      ctx.drawImage(sprite, x, y);
      if (i === 0) ctx.drawImage(SIGN, x - 1, y - 7);
      // The hurt walk at the back and it shows.
      if (m.status === 'injured' || m.status === 'sick') {
        ctx.fillStyle = PALETTE.r!;
        ctx.fillRect(x + 2, y - 2, 2, 1);
      }
    });

    // Weather.
    if (state.weather === 'rain') {
      ctx.fillStyle = PALETTE.d!;
      for (const drop of rainDrops) {
        drop.y = (drop.y + 140 * dt) % H;
        drop.x = (drop.x - 30 * dt + W) % W;
        ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 1, 3);
      }
    } else if (state.weather === 'heatwave') {
      ctx.fillStyle = PALETTE.a!;
      const sx = W - 30;
      ctx.fillRect(sx, 12, 8, 8);
      ctx.fillRect(sx - 2, 15, 12, 2);
      ctx.fillRect(sx + 3, 10, 2, 12);
    } else if (state.weather === 'cold') {
      ctx.fillStyle = PALETTE.w!;
      for (const drop of rainDrops.slice(0, 20)) {
        drop.y = (drop.y + 30 * dt) % H;
        ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 1, 1);
      }
    }
  }

  return { element: frame, tick };
}
