// A minimal Canvas2D stand-in backed by a real Uint8ClampedArray — this repo's node test
// environment has no real <canvas>, so pixelOps tests exercise their actual math against this
// instead of a mock, the same convention canvasExporter.test.ts uses for the canvas surface.
export function createFakePixelCanvas(width: number, height: number, fill: [number, number, number, number]): HTMLCanvasElement {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
  }

  const context = {
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data, width: w, height: h, colorSpace: "srgb" }),
    putImageData: (imageData: { data: Uint8ClampedArray }) => {
      data.set(imageData.data);
    },
  };

  return {
    width,
    height,
    getContext: () => context,
  } as unknown as HTMLCanvasElement;
}
