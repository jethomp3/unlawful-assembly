// The hunting trip. Costs a battery; converts nerve and framing into
// footage; footage feeds the movement. Linger too long and the day
// notices you back.

import type { Screen } from '../ui/screen';
import type { ScreenManager } from '../ui/screenManager';
import { el, menu, pressSpace, prose, rule } from '../ui/dom';
import { statusBar } from '../ui/statusBar';
import type { GameState } from '../engine/types';
import type { Rng } from '../engine/rng';
import type { ClassDef } from '../data/contentTypes';
import { addJournal, applyDelta } from '../engine/state';
import { TUNING } from '../engine/meters';
import { createPixelCanvas } from '../render/pixelCanvas';
import {
  createCamera,
  clampCamera,
  VIEW_W,
  VIEW_H,
  ZOOM_MAX,
  ZOOM_MIN,
} from './camera';
import { generateScene, updateScene, type DocScene } from './docScene';
import { renderDocScene, snapThumbnail } from './docRender';
import { evaluateShot, officerFramed, type ShotEval } from './docScoring';
import { DocInput } from './docInput';

const SESSION_SECONDS = 60;
const STEP = 1 / 60;

interface ShotRecord {
  eval: ShotEval;
  thumb: HTMLCanvasElement;
}

export function documentationScreen(
  manager: ScreenManager,
  state: GameState,
  rng: Rng,
  classDef: ClassDef,
  onDone: () => void,
): Screen {
  const scene: DocScene = generateScene(state, rng);
  state.rngState = rng.getState();

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', undefined, 'Documentation'));
      body.append(rule());
      body.append(prose(scene.brief));
      body.append(el('div', undefined, ' '));
      body.append(
        el(
          'div',
          'dim',
          scene.kind === 'nothing'
            ? 'There is nothing here to shoot. The battery, at least, survives.'
            : 'Arrows/drag: pan camera   Z/X or pinch: zoom   SPACE: shutter   ESC: leave\n' +
                'Wide shots need context. Faces need a closer lens. Badge numbers ' +
                'need all the zoom you have — and zoom is conspicuous.',
        ),
      );
      body.append(rule());
      body.append(
        menu(
          scene.kind === 'nothing'
            ? [{ key: '1', label: 'Walk back to camp', onSelect: onDone }]
            : [
                {
                  key: '1',
                  label: 'Raise the camera (1 battery)',
                  onSelect: () => {
                    state.batteries -= 1;
                    manager.swapTop(playScreen(manager, state, rng, classDef, scene, onDone));
                  },
                },
                { key: '2', label: 'Not today', onSelect: onDone },
              ],
        ),
      );
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

function playScreen(
  manager: ScreenManager,
  state: GameState,
  rng: Rng,
  classDef: ClassDef,
  scene: DocScene,
  onDone: () => void,
): Screen {
  const pc = createPixelCanvas(VIEW_W, VIEW_H);
  const cam = createCamera();
  const input = new DocInput();
  const shots: ShotRecord[] = [];

  let timeLeft = SESSION_SECONDS;
  let danger = 0;
  let warned = false;
  let moveAlongT = 0; // seconds since the "MOVE ALONG" bark
  let acc = 0;
  let flashT = 0;
  let lastShotLabel = '';
  let ended = false;

  const dangerBar = el('div');
  const shotLine = el('div', 'dim');
  shotLine.setAttribute('aria-live', 'polite');
  shotLine.style.minHeight = '1.4em';

  function cssScale(): number {
    return pc.canvas.clientWidth > 0 ? pc.canvas.clientWidth / VIEW_W : 2;
  }

  function endSession(reason: 'left' | 'timer'): void {
    if (ended) return;
    ended = true;
    input.detach();
    state.rngState = rng.getState();
    manager.swapTop(resultsScreen(state, shots, reason, onDone));
  }

  function step(dt: number): void {
    const intent = input.consume();

    // Camera: pan feels like a lens — slower when zoomed in.
    const panSpeed = 140 / cam.zoom;
    cam.cx += intent.panX * panSpeed * dt;
    cam.cy += intent.panY * panSpeed * dt;
    cam.cx -= intent.dragDx / (cssScale() * cam.zoom);
    cam.cy -= intent.dragDy / (cssScale() * cam.zoom);
    cam.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, cam.zoom + intent.zoomDelta * 1.6 * dt));
    clampCamera(cam);

    updateScene(scene, dt, rng);

    // Danger: lingering is a tell; a raised long lens is a confession.
    let rate = 1.6 * classDef.dangerMod * (0.7 + state.crackdown / 120);
    if (cam.zoom >= 2) rate += 2.2;
    if (!officerFramed(scene, cam)) rate = -3;
    danger = Math.min(100, Math.max(0, danger + rate * dt));

    if (danger >= 60 && !warned) {
      warned = true;
      shotLine.textContent = 'One of them keeps looking your way.';
    }
    if (danger >= 85) {
      moveAlongT += dt;
      if (moveAlongT > 3) {
        danger = 100;
      }
    } else {
      moveAlongT = 0;
    }
    if (danger >= 100) {
      caught();
      return;
    }

    // Shutter.
    if (intent.snap) {
      danger = Math.min(100, danger + 8);
      flashT = 0.12;
      const result = evaluateShot(scene, cam, state.newsCycleSaturation);
      if (result) {
        shots.push({ eval: result, thumb: snapThumbnail(pc.canvas) });
        lastShotLabel = `${result.type.toUpperCase()} — ${result.label} (+${result.footage} footage)`;
      } else {
        lastShotLabel = 'Nothing usable in frame.';
      }
      shotLine.textContent = lastShotLabel;
    }

    if (intent.leave) {
      endSession('left');
      return;
    }

    timeLeft -= dt;
    if (timeLeft <= 0) endSession('timer');
  }

  function caught(): void {
    if (ended) return;
    ended = true;
    input.detach();

    // Consequence roll, weighted by Crackdown. The footage is the first casualty.
    const roll = rng.next();
    const detainThreshold = 0.25 + state.crackdown / 300;
    let text: string;
    const leader = state.party[0]!;

    if (roll < detainThreshold) {
      if (classDef.firstArrestWaived && !state.flags['perk.firstArrest']) {
        state.flags['perk.firstArrest'] = 1;
        text =
          'Hands on your arms, your name run through a terminal — and then a ' +
          'supervisor squints at your employer and waves you off. "Get out of ' +
          'here." Your phone, however, stays with them.\n\nPrivilege is a stat. ' +
          'You just spent it.';
      } else {
        leader.status = 'detained';
        leader.statusDay = state.day;
        text =
          'They take the phone first, then you. The van is cleaner than ' +
          'you expected. That is somehow the worst detail.';
        addJournal(state, 'Arrested while documenting.', 'loss');
      }
    } else if (roll < 0.6) {
      leader.status = 'injured';
      leader.statusDay = state.day;
      leader.health = Math.max(1, leader.health - 20);
      text =
        'You do not see the first shove. The camera arcs into the street ' +
        'and so do you. The footage does not survive. You barely do better.';
      addJournal(state, 'Beaten while documenting.', 'loss');
    } else {
      text =
        '"Delete it or lose it." He watches you delete it. He takes the ' +
        'battery anyway, on principle. The principle is that he can.';
      addJournal(state, 'Phone seized while documenting.');
    }

    applyDelta(state, { heat: 6 });
    state.rngState = rng.getState();
    manager.swapTop(caughtScreen(state, text, onDone));
  }

  return {
    mount(root) {
      const body = el('div', 'screen-body');

      const stage = el('div', 'doc-stage');
      stage.append(pc.canvas);

      const leaveBtn = el('button', 'doc-overlay-btn doc-leave', 'LEAVE');
      leaveBtn.addEventListener('click', () => input.queueLeave());
      const snapBtn = el('button', 'doc-overlay-btn doc-snap', 'SNAP');
      snapBtn.addEventListener('click', () => input.queueSnap());
      const zoomIn = el('button', 'doc-overlay-btn doc-zoom-in', '+');
      zoomIn.addEventListener('click', () => input.queueZoom(0.25));
      const zoomOut = el('button', 'doc-overlay-btn doc-zoom-out', '-');
      zoomOut.addEventListener('click', () => input.queueZoom(-0.25));
      stage.append(leaveBtn, snapBtn, zoomIn, zoomOut);

      body.append(stage);
      body.append(dangerBar);
      body.append(shotLine);
      root.append(body);

      pc.fit(root.clientWidth - 40);
      input.attach(pc.canvas);
    },
    unmount() {
      input.detach();
    },
    onKey() {
      // All gameplay keys are handled by DocInput; block menu defaults.
      return true;
    },
    tick(dt) {
      if (ended) return;
      acc += dt;
      while (acc >= STEP) {
        acc -= STEP;
        step(STEP);
        if (ended) return;
      }

      renderDocScene(pc.ctx, cam, scene, timeLeft);
      if (flashT > 0) {
        flashT -= dt;
        pc.ctx.fillStyle = 'rgba(232,255,232,0.5)';
        pc.ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      const blocks = Math.round(danger / 10);
      const tone = danger >= 85 ? 'MOVE ALONG' : danger >= 60 ? 'noticed' : 'unseen';
      dangerBar.textContent = `danger [${'#'.repeat(blocks)}${'.'.repeat(10 - blocks)}] ${tone}`;
      dangerBar.className = danger >= 85 ? 'red' : danger >= 60 ? 'amber' : 'dim';
    },
  };
}

function caughtScreen(state: GameState, text: string, onDone: () => void): Screen {
  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(el('h2', 'red', 'SPOTTED'));
      body.append(rule());
      body.append(prose(text, 'prose red'));
      body.append(pressSpace('Press SPACE BAR to continue', onDone));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}

function resultsScreen(
  state: GameState,
  shots: ShotRecord[],
  reason: 'left' | 'timer',
  onDone: () => void,
): Screen {
  const footage = Math.round(shots.reduce((s, r) => s + r.eval.footage, 0) * 10) / 10;
  const supportGain = Math.round(footage * TUNING.footageSupportRate * 10) / 10;
  const donation = Math.round(
    footage * TUNING.footageDonationRate * (0.5 + state.support / 150),
  );

  // Bank it: the news cycle absorbs only so much.
  applyDelta(state, { footage, support: supportGain, money: donation });
  state.newsCycleSaturation += TUNING.saturationPerSession;
  if (footage > 0) {
    addJournal(state, `Posted footage: +${supportGain} support, +$${donation} in donations.`);
  }

  return {
    mount(root) {
      const body = el('div', 'screen-body');
      body.append(
        el('h2', undefined, reason === 'timer' ? 'The light goes' : 'You lower the camera'),
      );
      body.append(rule());

      if (shots.length === 0) {
        body.append(
          prose(
            'No usable footage. The things you saw stay seen by nobody, ' +
              'which is how they prefer it.',
          ),
        );
      } else {
        const row = el('div', 'spread');
        for (const s of shots.slice(0, 6)) row.append(s.thumb);
        body.append(row);
        body.append(el('div', undefined, ' '));
        for (const s of shots) {
          body.append(el('div', 'dim', `${s.eval.type.toUpperCase()}: ${s.eval.label}`));
        }
        body.append(rule());
        body.append(el('div', undefined, `Footage value: ${footage}`));
        body.append(el('div', undefined, `Support: +${supportGain}`));
        body.append(el('div', undefined, `Donations: +$${donation}`));
        if (state.newsCycleSaturation > 1.5) {
          body.append(
            el('div', 'amber', 'The news cycle is saturating. Tomorrow this is worth less.'),
          );
        }
      }

      body.append(pressSpace('Press SPACE BAR to continue', onDone));
      body.append(statusBar(state));
      root.append(body);
    },
  };
}
