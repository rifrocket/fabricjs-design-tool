import { describe, expect, it, vi } from "vitest";
import { ObjectTypeRegistry } from "@rifrocket/fdt-core";
import { registerImageType } from "./imageType";

const { fakeImage, fromURL } = vi.hoisted(() => {
  const fakeImage = {
    width: 800,
    height: 400,
    set: vi.fn(),
  };
  const fromURL = vi.fn(async () => fakeImage);
  return { fakeImage, fromURL };
});

vi.mock("fabric", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fabric")>();
  return { ...actual, FabricImage: { fromURL } };
});

describe("registerImageType", () => {
  it("registers an 'image' object type", () => {
    const registry = new ObjectTypeRegistry();
    registerImageType(registry);
    expect(registry.has("image")).toBe(true);
  });

  it("creates a FabricImage from the given src, auto-scaled to fit within the default max dimension", async () => {
    const registry = new ObjectTypeRegistry();
    registerImageType(registry);

    const image = await registry.create("image", { src: "https://example.com/photo.png" });

    expect(fromURL).toHaveBeenCalledWith("https://example.com/photo.png", { crossOrigin: "anonymous" });
    expect(image).toBe(fakeImage);
    expect(fakeImage.set).toHaveBeenCalledWith(
      expect.objectContaining({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5, selectable: true, evented: true }),
    );
    expect(fakeImage.set).toHaveBeenCalledWith("shapeKind", "image");
  });

  it("respects explicit left/top/scale overrides", async () => {
    const registry = new ObjectTypeRegistry();
    registerImageType(registry);

    await registry.create("image", { src: "x", left: 5, top: 6, scaleX: 2, scaleY: 3 });

    expect(fakeImage.set).toHaveBeenCalledWith(expect.objectContaining({ left: 5, top: 6, scaleX: 2, scaleY: 3 }));
  });
});
