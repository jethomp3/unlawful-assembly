// Sprites as string grids: '.' = transparent, letters index the palette.
// Rendered once to offscreen canvases.

export const PALETTE: Record<string, string> = {
  g: '#33ff33', // phosphor green
  d: '#1d9e1d', // dim green
  f: '#0e4d0e', // faint green
  w: '#e8ffe8', // near-white
  a: '#ffb000', // amber accent
  r: '#ff4433', // red accent
  k: '#041104', // screen background
};

export function spriteFromGrid(rows: string[], scale = 1): HTMLCanvasElement {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext('2d')!;
  for (let y = 0; y < h; y++) {
    const row = rows[y]!;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]!;
      if (ch === '.') continue;
      const color = PALETTE[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

// Two walk frames, 6x12: a marcher with a small pack and a sign.
export const WALKER_FRAMES: HTMLCanvasElement[] = [
  spriteFromGrid([
    '..gg..',
    '..gg..',
    '.dggd.',
    'd.gg.d',
    '..gg..',
    '..gg..',
    '..gg..',
    '.g..g.',
    '.g..g.',
    'g....g',
    'g....g',
    'g....g',
  ]),
  spriteFromGrid([
    '..gg..',
    '..gg..',
    '.dggd.',
    '.dggd.',
    '..gg..',
    '..gg..',
    '..gg..',
    '..gg..',
    '.g.g..',
    '.g.g..',
    '.g..g.',
    '.g..g.',
  ]),
];

// A protest sign carried by the lead walker.
export const SIGN = spriteFromGrid([
  'aaaaaaa',
  'a.....a',
  'a.a.a.a',
  'aaaaaaa',
  '...a...',
  '...a...',
]);
