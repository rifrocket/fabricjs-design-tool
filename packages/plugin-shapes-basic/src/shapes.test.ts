import { describe, expect, it } from "vitest";
import { Ellipse, Line, Polygon, Rect } from "fabric";
import { ObjectTypeRegistry } from "@rifrocket/fdt-core";
import { registerBasicShapes } from "./shapes";
import { SHAPE_COORDINATES } from "./shapeCoordinates";

describe("registerBasicShapes", () => {
  it("registers a primitive shape for every basic type", () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    expect(registry.list()).toEqual(
      expect.arrayContaining(["text", "rect", "circle", "line", "ellipse", "rounded-rectangle"]),
    );
  });

  it("registers one polygon type per shape coordinate entry", () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    for (const shapeType of Object.keys(SHAPE_COORDINATES)) {
      expect(registry.has(shapeType)).toBe(true);
    }
  });

  it("creates a real Fabric object with config values applied on top of the defaults", async () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    const rect = await registry.create("rect", { left: 42, fill: "#00ff00" });

    expect(rect).toBeInstanceOf(Rect);
    expect(rect.left).toBe(42);
    expect(rect.fill).toBe("#00ff00");
  });

  // fabric.Text's constructor needs a real DOM (grapheme splitting checks for `document`),
  // which isn't available in this Node test environment. Line/Ellipse have no such
  // requirement and are safe to construct here.
  it("creates line and ellipse objects of the right Fabric class", async () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    expect(await registry.create("line", {})).toBeInstanceOf(Line);
    expect(await registry.create("ellipse", {})).toBeInstanceOf(Ellipse);
  });

  // Fabric v6's `type` is a read-only getter derived from the class, so `.set('type', ...)`
  // silently no-ops (this is what v1's `polygon.type = shapeType` direct assignment hit too).
  // Shape identity for polygon-based shapes is carried in `shapeKind` instead.
  it("tags a polygon shape with its shape kind, since Fabric's own `type` getter is read-only", async () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    const star = await registry.create("star", {});

    expect(star).toBeInstanceOf(Polygon);
    expect(star.get("shapeKind")).toBe("star");
  });

  it("tags a rounded rectangle with its shape kind, distinct from a plain rect", async () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    const roundedRect = await registry.create("rounded-rectangle", {});

    expect(roundedRect).toBeInstanceOf(Rect);
    expect(roundedRect.get("shapeKind")).toBe("rounded-rectangle");
  });

  it("registers propertyFields for every type atomically at registration time", () => {
    const registry = new ObjectTypeRegistry();
    registerBasicShapes(registry);

    const keysFor = (typeId: string) => registry.get(typeId)?.propertyFields?.map((f) => f.key);

    expect(keysFor("rect")).toEqual(
      expect.arrayContaining(["left", "top", "fill", "stroke", "strokeWidth", "width", "height", "rx", "ry"]),
    );
    expect(keysFor("circle")).toEqual(expect.arrayContaining(["fill", "radius"]));
    expect(keysFor("ellipse")).toEqual(expect.arrayContaining(["fill", "rx", "ry"]));
    expect(keysFor("line")).toEqual(expect.arrayContaining(["stroke", "strokeWidth", "opacity", "angle"]));
    expect(keysFor("text")).toEqual(expect.arrayContaining(["text", "fontFamily", "fontWeight", "fontStyle"]));
    expect(keysFor("rounded-rectangle")).toEqual(expect.arrayContaining(["width", "height", "rx", "ry"]));

    for (const shapeType of Object.keys(SHAPE_COORDINATES)) {
      expect(keysFor(shapeType)).toEqual(expect.arrayContaining(["fill", "scaleX", "scaleY"]));
    }
  });
});
