// Tiny DOM helpers. No framework; screens rebuild themselves on mount.

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export interface MenuItem {
  key: string; // the digit/letter shown and bound
  label: string;
  disabled?: boolean;
  note?: string; // dim suffix, e.g. current setting
  onSelect: () => void;
}

export function menu(items: MenuItem[]): HTMLElement {
  const wrap = el('div', 'menu');
  for (const item of items) {
    const btn = el('button');
    btn.dataset.key = item.key;
    btn.disabled = !!item.disabled;
    const key = el('span', 'key', `${item.key}.`);
    btn.append(key, document.createTextNode(` ${item.label}`));
    if (item.note) btn.append(el('span', 'dim', `  ${item.note}`));
    btn.addEventListener('click', () => {
      if (!btn.disabled) item.onSelect();
    });
    wrap.append(btn);
  }
  return wrap;
}

/** The blinking "Press SPACE BAR to continue" line. Clickable/tappable too. */
export function pressSpace(label: string, onContinue: () => void): HTMLElement {
  const btn = el('button', 'press-space dim', label);
  btn.dataset.space = 'true';
  btn.style.background = 'none';
  btn.style.border = 'none';
  btn.style.font = 'inherit';
  btn.style.cursor = 'pointer';
  btn.addEventListener('click', onContinue);
  return btn;
}

export function rule(): HTMLElement {
  return el('hr', 'rule');
}

/** Multi-paragraph prose block, preserving line breaks. */
export function prose(text: string, className = 'prose'): HTMLElement {
  return el('div', className, text);
}
