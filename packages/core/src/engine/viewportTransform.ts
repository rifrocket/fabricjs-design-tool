// Converts a doc-space point to screen-space using Fabric's 6-number viewport transform matrix
// (canvas.viewportTransform). Shared by any overlay renderer that draws directly on a canvas
// context instead of through Fabric's own object pipeline (e.g. SnapEngine's guide lines).
export function applyViewportTransform(x: number, y: number, vpt: number[] | undefined): { x: number; y: number } {
  if (!vpt) return { x, y };
  return { x: x * vpt[0] + y * vpt[2] + vpt[4], y: x * vpt[1] + y * vpt[3] + vpt[5] };
}
