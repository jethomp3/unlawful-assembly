// The viewfinder model. The whole canvas is the viewfinder; the world
// is wider than the frame and the camera pans/zooms over it.

export const VIEW_W = 320;
export const VIEW_H = 200;
export const WORLD_W = 640;
export const WORLD_H = 240;

export const ZOOM_MIN = 1.0;
export const ZOOM_MAX = 4.0;

export interface Camera {
  cx: number; // world coords at view center
  cy: number;
  zoom: number;
}

export function createCamera(): Camera {
  return { cx: WORLD_W / 2, cy: WORLD_H / 2, zoom: 1.0 };
}

export function clampCamera(cam: Camera): void {
  cam.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, cam.zoom));
  const halfW = VIEW_W / 2 / cam.zoom;
  const halfH = VIEW_H / 2 / cam.zoom;
  cam.cx = Math.min(WORLD_W - halfW, Math.max(halfW, cam.cx));
  cam.cy = Math.min(WORLD_H - halfH, Math.max(halfH, cam.cy));
}

export function worldToScreen(cam: Camera, wx: number, wy: number): { x: number; y: number } {
  return {
    x: (wx - cam.cx) * cam.zoom + VIEW_W / 2,
    y: (wy - cam.cy) * cam.zoom + VIEW_H / 2,
  };
}

/** Is this world point inside the current frame? */
export function inFrame(cam: Camera, wx: number, wy: number, margin = 0): boolean {
  const { x, y } = worldToScreen(cam, wx, wy);
  return x >= margin && x <= VIEW_W - margin && y >= margin && y <= VIEW_H - margin;
}

/** Normalized distance (0 center .. 1 corner) of a world point from the crosshair. */
export function framingError(cam: Camera, wx: number, wy: number): number {
  const { x, y } = worldToScreen(cam, wx, wy);
  const dx = (x - VIEW_W / 2) / (VIEW_W / 2);
  const dy = (y - VIEW_H / 2) / (VIEW_H / 2);
  return Math.min(1, Math.hypot(dx, dy));
}
