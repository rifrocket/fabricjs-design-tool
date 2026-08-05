export interface RulerTick {
  position: number;
  value: number;
  isMajor: boolean;
}

export interface RulerOptions {
  length: number;
  zoom: number;
  pan: number;
  targetSpacing?: number;
  majorEvery?: number;
}

// Computes ruler tick marks in screen space from a viewport zoom/pan, choosing a "nice"
// document-space interval (1, 2, 5 x10^n) so ticks stay readably spaced at any zoom level.
export function computeRulerTicks(options: RulerOptions): RulerTick[] {
  const { length, zoom, pan, targetSpacing = 60, majorEvery = 5 } = options;
  if (zoom <= 0 || length <= 0) return [];

  const interval = niceInterval(targetSpacing / zoom);
  const startValue = Math.floor(-pan / zoom / interval) * interval;
  const endValue = (length - pan) / zoom;

  const ticks: RulerTick[] = [];
  let index = Math.round(startValue / interval);
  for (let value = startValue; value <= endValue; value += interval, index += 1) {
    const position = value * zoom + pan;
    if (position < 0 || position > length) continue;
    ticks.push({ position, value, isMajor: index % majorEvery === 0 });
  }
  return ticks;
}

// Rounds a raw interval up to the nearest "nice" 1/2/5 x10^n step.
function niceInterval(raw: number): number {
  const exponent = Math.floor(Math.log10(raw));
  const base = 10 ** exponent;
  const fraction = raw / base;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3.5 ? 2 : fraction < 7.5 ? 5 : 10;
  return niceFraction * base;
}
