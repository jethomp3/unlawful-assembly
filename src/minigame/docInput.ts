// Input abstraction: keyboard and touch produce the same intent struct,
// consumed once per simulation step by the controller.

export interface DocIntent {
  panX: number; // -1..1 (keyboard held direction)
  panY: number;
  /** Accumulated pointer drag since last step, in CSS pixels. */
  dragDx: number;
  dragDy: number;
  zoomDelta: number; // held zoom direction plus pinch, per step
  snap: boolean; // edge-triggered
  leave: boolean;
}

export class DocInput {
  private keys = new Set<string>();
  private snapQueued = false;
  private leaveQueued = false;

  // pointer state (drag pan / pinch zoom)
  private pointers = new Map<number, { x: number; y: number }>();
  private dragDx = 0;
  private dragDy = 0;
  private pinchZoom = 0;
  private lastPinchDist = 0;

  private detachFns: (() => void)[] = [];

  attach(canvas: HTMLCanvasElement): void {
    const down = (e: KeyboardEvent): void => {
      if (e.key === ' ') {
        this.snapQueued = true;
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        this.leaveQueued = true;
        return;
      }
      this.keys.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent): void => {
      this.keys.delete(e.key.toLowerCase());
    };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    this.detachFns.push(() => document.removeEventListener('keydown', down));
    this.detachFns.push(() => document.removeEventListener('keyup', up));

    const pDown = (e: PointerEvent): void => {
      canvas.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.lastPinchDist = 0;
      e.preventDefault();
    };
    const pMove = (e: PointerEvent): void => {
      const prev = this.pointers.get(e.pointerId);
      if (!prev) return;
      const curr = { x: e.clientX, y: e.clientY };

      if (this.pointers.size === 1) {
        // Drag pans the world under the lens (inverted).
        this.dragDx += curr.x - prev.x;
        this.dragDy += curr.y - prev.y;
      } else if (this.pointers.size === 2) {
        const pts = [...this.pointers.entries()].map(([id, p]) =>
          id === e.pointerId ? curr : p,
        );
        const dist = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
        if (this.lastPinchDist > 0) this.pinchZoom += (dist - this.lastPinchDist) / 100;
        this.lastPinchDist = dist;
      }
      this.pointers.set(e.pointerId, curr);
      e.preventDefault();
    };
    const pUp = (e: PointerEvent): void => {
      this.pointers.delete(e.pointerId);
      this.lastPinchDist = 0;
    };
    canvas.addEventListener('pointerdown', pDown);
    canvas.addEventListener('pointermove', pMove);
    canvas.addEventListener('pointerup', pUp);
    canvas.addEventListener('pointercancel', pUp);
    this.detachFns.push(() => {
      canvas.removeEventListener('pointerdown', pDown);
      canvas.removeEventListener('pointermove', pMove);
      canvas.removeEventListener('pointerup', pUp);
      canvas.removeEventListener('pointercancel', pUp);
    });
  }

  detach(): void {
    for (const fn of this.detachFns) fn();
    this.detachFns = [];
    this.keys.clear();
    this.pointers.clear();
  }

  queueSnap(): void {
    this.snapQueued = true;
  }
  queueLeave(): void {
    this.leaveQueued = true;
  }
  queueZoom(delta: number): void {
    this.pinchZoom += delta;
  }

  /** Read and reset per-step intent. */
  consume(): DocIntent {
    let panX = 0;
    let panY = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a')) panX -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) panX += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) panY -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) panY += 1;

    let zoomDelta = 0;
    if (this.keys.has('z') || this.keys.has('+') || this.keys.has('=')) zoomDelta += 1;
    if (this.keys.has('x') || this.keys.has('-')) zoomDelta -= 1;

    const intent: DocIntent = {
      panX,
      panY,
      dragDx: this.dragDx,
      dragDy: this.dragDy,
      zoomDelta: zoomDelta + this.pinchZoom * 8,
      snap: this.snapQueued,
      leave: this.leaveQueued,
    };

    this.dragDx = 0;
    this.dragDy = 0;
    this.pinchZoom = 0;
    this.snapQueued = false;
    this.leaveQueued = false;
    return intent;
  }
}
