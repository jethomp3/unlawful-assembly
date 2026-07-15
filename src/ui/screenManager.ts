import type { Screen } from './screen';
import { el } from './dom';

/**
 * Screen stack inside the persistent .screen "monitor" element.
 * Only the top screen is mounted and ticked; covered screens keep their
 * state objects and re-mount (re-render from GameState) when uncovered.
 */
export class ScreenManager {
  private stack: Screen[] = [];
  private frame: HTMLElement;
  private lastTime = 0;

  constructor(appRoot: HTMLElement) {
    this.frame = el('div', 'screen');
    appRoot.append(this.frame);

    document.addEventListener('keydown', (e) => this.handleKey(e));
    requestAnimationFrame((t) => this.loop(t));
  }

  get top(): Screen | undefined {
    return this.stack[this.stack.length - 1];
  }

  push(screen: Screen): void {
    this.top?.unmount?.();
    this.stack.push(screen);
    this.mountTop();
  }

  pop(): void {
    const leaving = this.stack.pop();
    leaving?.unmount?.();
    this.mountTop();
  }

  /** Pop everything and start fresh with `screen` as the new base. */
  replace(screen: Screen): void {
    while (this.stack.length) {
      this.stack.pop()?.unmount?.();
    }
    this.stack.push(screen);
    this.mountTop();
  }

  /** Swap only the top screen (e.g. stepping through queued event screens). */
  swapTop(screen: Screen): void {
    const leaving = this.stack.pop();
    leaving?.unmount?.();
    this.stack.push(screen);
    this.mountTop();
  }

  private mountTop(): void {
    this.frame.replaceChildren();
    const top = this.top;
    if (top) top.mount(this.frame);
    // Focus the frame region so keyboard users land somewhere sensible.
    const firstButton = this.frame.querySelector<HTMLElement>('button:not(:disabled)');
    firstButton?.focus({ preventScroll: true });
  }

  private handleKey(e: KeyboardEvent): void {
    const top = this.top;
    if (!top) return;

    // Don't steal keys from text inputs (party naming, epitaphs).
    const target = e.target as HTMLElement | null;
    const typing = target?.tagName === 'INPUT';

    if (top.onKey && !typing && top.onKey(e)) {
      e.preventDefault();
      return;
    }

    if (typing) return;

    if (e.key === ' ' || e.key === 'Enter') {
      const spaceBtn = this.frame.querySelector<HTMLButtonElement>('[data-space]');
      if (spaceBtn && e.key === ' ') {
        e.preventDefault();
        spaceBtn.click();
        return;
      }
      if (e.key === 'Enter' && target?.tagName === 'BUTTON') return; // native
      if (spaceBtn && e.key === 'Enter') {
        e.preventDefault();
        spaceBtn.click();
        return;
      }
    }

    // Digit/letter menu keys.
    if (/^[0-9a-z]$/i.test(e.key)) {
      const btn = this.frame.querySelector<HTMLButtonElement>(
        `[data-key="${e.key.toLowerCase()}" i]`,
      );
      if (btn && !btn.disabled) {
        e.preventDefault();
        btn.click();
      }
    }
  }

  private loop(time: number): void {
    const dt = this.lastTime ? Math.min(0.1, (time - this.lastTime) / 1000) : 0;
    this.lastTime = time;
    this.top?.tick?.(dt);
    requestAnimationFrame((t) => this.loop(t));
  }
}
