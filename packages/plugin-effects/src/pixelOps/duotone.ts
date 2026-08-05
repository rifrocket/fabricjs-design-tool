import { hexToRgb } from "./color";

export interface DuotoneOptions {
  shadowColor: string;
  highlightColor: string;
  intensity?: number;
}

// Remaps each pixel's luminance onto a 2-color gradient between shadowColor and highlightColor —
// no fabric.filters equivalent exists for this, unlike Blur/Pixelate/Sepia/etc.
export function applyDuotone(canvasEl: HTMLCanvasElement, options: DuotoneOptions): void {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvasEl;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const [sr, sg, sb] = hexToRgb(options.shadowColor);
  const [hr, hg, hb] = hexToRgb(options.highlightColor);
  const intensity = (options.intensity ?? 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const luminance = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const r = sr + (hr - sr) * luminance;
    const g = sg + (hg - sg) * luminance;
    const b = sb + (hb - sb) * luminance;
    data[i] = data[i] + (r - data[i]) * intensity;
    data[i + 1] = data[i + 1] + (g - data[i + 1]) * intensity;
    data[i + 2] = data[i + 2] + (b - data[i + 2]) * intensity;
  }

  ctx.putImageData(imageData, 0, 0);
}
