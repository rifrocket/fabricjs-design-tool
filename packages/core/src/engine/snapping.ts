import { Point } from "fabric";
import type { FabricObject } from "fabric";

export interface ObjectCoords {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
  center: Point;
}

export interface VerticalGuide {
  x: number;
  y1: number;
  y2: number;
}

export interface HorizontalGuide {
  y: number;
  x1: number;
  x2: number;
}

export interface SnapResult {
  // How far to shift the moving object's left/top to land flush on the match — already
  // resolved against whichever point (an edge or the center) actually matched, so applying it
  // is always correct regardless of which one triggered the snap. See findBestAxisMatch below
  // for why this must be a delta and not a raw target coordinate.
  deltaX: number | null;
  deltaY: number | null;
  verticalGuides: VerticalGuide[];
  horizontalGuides: HorizontalGuide[];
}

const GUIDE_OVERHANG = 20;

export function getObjectCoords(object: FabricObject): ObjectCoords {
  const bounds = object.getBoundingRect();
  return {
    tl: new Point(bounds.left, bounds.top),
    tr: new Point(bounds.left + bounds.width, bounds.top),
    bl: new Point(bounds.left, bounds.top + bounds.height),
    br: new Point(bounds.left + bounds.width, bounds.top + bounds.height),
    center: object.getCenterPoint(),
  };
}

export function isWithinThreshold(a: number, b: number, threshold: number): boolean {
  return Math.abs(a - b) <= threshold;
}

export function getClosestValue(value: number, candidates: number[]): number | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((closest, candidate) =>
    Math.abs(value - candidate) < Math.abs(value - closest) ? candidate : closest,
  );
}

// An axis-aligned bounding box has exactly 3 distinct positions per axis — its near edge,
// center, and far edge (tl.x === bl.x, tr.x === br.x, tl.y === tr.y, bl.y === br.y). Comparing
// all 4 corners plus center (5x5 = 25 combinations) against another object re-tests the same
// 3 unique X/Y values multiple times, silently double- or triple-counting a single coincidental
// alignment as if it were several distinct matches — a direct cause of "too many guide lines."
function xValues(coords: ObjectCoords): number[] {
  return [coords.tl.x, coords.center.x, coords.tr.x];
}

function yValues(coords: ObjectCoords): number[] {
  return [coords.tl.y, coords.center.y, coords.bl.y];
}

interface AxisCandidate {
  values: number[];
  // The full coords of the object these values came from, for computing the rendered guide's
  // span — null for the canvas-center pseudo-candidate, which spans the whole canvas instead.
  coords: ObjectCoords | null;
}

interface AxisMatch {
  delta: number;
  distance: number;
  guideValue: number;
  coords: ObjectCoords | null;
}

// Scans every candidate's axis values against the moving object's own and keeps only the
// single closest match — the smallest gap wins. This is what makes exactly one guide line
// render per axis (not one per coincidental alignment across every nearby object), and,
// critically, `delta` is computed from whichever *specific* value matched (an edge or the
// center), not always the center — applying `movingValue + delta` always lands the matched
// point flush on the target, however the match was found.
function findBestAxisMatch(movingValues: number[], candidates: AxisCandidate[], threshold: number): AxisMatch | null {
  let best: AxisMatch | null = null;

  for (const candidate of candidates) {
    for (const movingValue of movingValues) {
      for (const otherValue of candidate.values) {
        const distance = Math.abs(movingValue - otherValue);
        if (distance > threshold) continue;
        if (best && distance >= best.distance) continue;
        best = { delta: otherValue - movingValue, distance, guideValue: otherValue, coords: candidate.coords };
      }
    }
  }

  return best;
}

// Pure geometry: given the moving object's coords and every other object's coords, finds the
// single best edge/center alignment match per axis within threshold, the exact delta to shift
// the moving object by to land flush on it, and at most one guide line per axis to render. No
// live canvas required.
export function findSnapCandidates(
  moving: ObjectCoords,
  others: ObjectCoords[],
  canvasSize: { width: number; height: number },
  threshold: number,
): SnapResult {
  const otherXCandidates: AxisCandidate[] = others.map((coords) => ({ values: xValues(coords), coords }));
  const otherYCandidates: AxisCandidate[] = others.map((coords) => ({ values: yValues(coords), coords }));

  const canvasCenterX = canvasSize.width / 2;
  const canvasCenterY = canvasSize.height / 2;
  otherXCandidates.push({ values: [canvasCenterX], coords: null });
  otherYCandidates.push({ values: [canvasCenterY], coords: null });

  const bestX = findBestAxisMatch(xValues(moving), otherXCandidates, threshold);
  const bestY = findBestAxisMatch(yValues(moving), otherYCandidates, threshold);

  const verticalGuides: VerticalGuide[] = [];
  if (bestX) {
    verticalGuides.push({
      x: bestX.guideValue,
      y1: bestX.coords ? Math.min(moving.tl.y, bestX.coords.tl.y) - GUIDE_OVERHANG : 0,
      y2: bestX.coords ? Math.max(moving.br.y, bestX.coords.br.y) + GUIDE_OVERHANG : canvasSize.height,
    });
  }

  const horizontalGuides: HorizontalGuide[] = [];
  if (bestY) {
    horizontalGuides.push({
      y: bestY.guideValue,
      x1: bestY.coords ? Math.min(moving.tl.x, bestY.coords.tl.x) - GUIDE_OVERHANG : 0,
      x2: bestY.coords ? Math.max(moving.br.x, bestY.coords.br.x) + GUIDE_OVERHANG : canvasSize.width,
    });
  }

  return {
    deltaX: bestX ? bestX.delta : null,
    deltaY: bestY ? bestY.delta : null,
    verticalGuides,
    horizontalGuides,
  };
}
