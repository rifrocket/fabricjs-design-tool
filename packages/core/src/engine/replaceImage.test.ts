import { describe, expect, it } from "vitest";
import { FabricImage } from "fabric";
import { extractImageTransform } from "./replaceImage";
import { imageSource } from "../testUtils/imageSource";

describe("extractImageTransform", () => {
  it("captures position, scale, rotation, and flip from a real image", () => {
    const image = new FabricImage(imageSource(200, 100), {
      left: 10,
      top: 20,
      scaleX: 1.5,
      scaleY: 2,
      angle: 45,
      flipX: true,
      flipY: false,
    });

    expect(extractImageTransform(image)).toEqual({
      left: 10,
      top: 20,
      scaleX: 1.5,
      scaleY: 2,
      angle: 45,
      flipX: true,
      flipY: false,
    });
  });
});
