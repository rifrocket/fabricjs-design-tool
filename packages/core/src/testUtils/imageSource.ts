// A minimal real image source for tests — not a mock of Fabric itself, just a plain object
// standing in for an <img>, since this sandbox has no browser Image constructor. Fabric only
// reads width/height/naturalWidth/naturalHeight off it at runtime; the cast documents that
// this intentionally doesn't (and doesn't need to) satisfy the full HTMLImageElement interface.
export function imageSource(width: number, height: number): HTMLImageElement {
  return { width, height, naturalWidth: width, naturalHeight: height } as unknown as HTMLImageElement;
}
