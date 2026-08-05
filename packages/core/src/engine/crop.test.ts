import { describe, expect, it } from "vitest";
import { FabricImage } from "fabric";
import { cropImage, resetCrop } from "./crop";
import { imageSource } from "../testUtils/imageSource";

describe("cropImage", () => {
  it("sets cropX/cropY/width/height from the crop rect", () => {
    const image = new FabricImage(imageSource(400, 300));

    cropImage(image, { left: 20, top: 10, width: 100, height: 80 });

    expect(image.cropX).toBe(20);
    expect(image.cropY).toBe(10);
    expect(image.width).toBe(100);
    expect(image.height).toBe(80);
  });
});

describe("resetCrop", () => {
  it("restores cropX/cropY to 0 and width/height to the source image's natural size", () => {
    const image = new FabricImage(imageSource(400, 300));
    cropImage(image, { left: 20, top: 10, width: 100, height: 80 });

    resetCrop(image);

    expect(image.cropX).toBe(0);
    expect(image.cropY).toBe(0);
    expect(image.width).toBe(400);
    expect(image.height).toBe(300);
  });
});
