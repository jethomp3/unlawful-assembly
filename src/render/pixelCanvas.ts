// Fixed internal resolution, integer upscale, crisp pixels.

export interface PixelCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Recompute CSS size to the largest integer scale that fits `maxCssWidth`. */
  fit(maxCssWidth: number): void;
}

export function createPixelCanvas(width: number, height: number): PixelCanvas {
  const canvas = document.createElement('canvas');
  canvas.className = 'pixel';
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  function fit(maxCssWidth: number): void {
    const scale = Math.max(1, Math.floor(maxCssWidth / width));
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  }

  return { canvas, ctx, width, height, fit };
}
