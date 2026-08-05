import { hexToRgb } from "./color";

export interface VignetteOptions {
  strength?: number;
  spread?: number;
  color?: string;
}

// Radially darkens toward the edges of the bitmap — no fabric.filters equivalent exists for this.
export function applyVignette(canvasEl: HTMLCanvasElement, options: VignetteOptions): void {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvasEl;
  const [cr, cg, cb] = hexToRgb(options.color ?? "#000000");
  const strength = (options.strength ?? 50) / 100;
  const spread = Math.min(0.99, (options.spread ?? 50) / 100);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY) || 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] === 0) continue;
      const dx = x - centerX;
      const dy = y - centerY;
      const normalizedDist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const falloff = Math.min(1, Math.max(0, (normalizedDist - spread) / (1 - spread)));
      const darken = falloff * strength;
      data[index] = data[index] + (cr - data[index]) * darken;
      data[index + 1] = data[index + 1] + (cg - data[index + 1]) * darken;
      data[index + 2] = data[index + 2] + (cb - data[index + 2]) * darken;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
