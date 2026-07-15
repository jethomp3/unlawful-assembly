export interface Screen {
  /** Build this screen's DOM inside `root` (a fresh, empty container). */
  mount(root: HTMLElement): void;
  /** Optional cleanup (timers, observers). DOM removal is the manager's job. */
  unmount?(): void;
  /**
   * First shot at a keydown. Return true if handled; otherwise the manager
   * applies defaults (digits click [data-key], space clicks [data-space]).
   */
  onKey?(e: KeyboardEvent): boolean;
  /** Called every animation frame while this screen is on top. */
  tick?(dt: number): void;
}
