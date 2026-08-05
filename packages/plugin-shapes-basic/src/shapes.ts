import { Circle, Ellipse, Line, Polygon, Rect, Text } from "fabric";
import type { ObjectTypeRegistry } from "@rifrocket/fdt-core";
import { SHAPE_COLORS, SHAPE_COORDINATES } from "./shapeCoordinates";
import type { ShapeConfig } from "./types";
import {
  APPEARANCE_FIELDS,
  CIRCLE_FIELDS,
  ELLIPSE_FIELDS,
  LINE_FIELDS,
  POLYGON_SCALE_FIELDS,
  POSITION_FIELDS,
  RECT_CORNER_FIELDS,
  RECT_SIZE_FIELDS,
  TEXT_FIELDS,
  TRANSFORM_FIELDS,
} from "./propertyFields";

const DEFAULT_OFFSET = 100;

// Registers every default shape as an object type. Replaces v1's closed ShapeFactory
// static-method class with registry entries any consumer can add to or override.
export function registerBasicShapes(registry: ObjectTypeRegistry): void {
  registry.register<ShapeConfig>("text", {
    create: (config = {}) =>
      new Text("Sample Text", {
        left: DEFAULT_OFFSET,
        top: DEFAULT_OFFSET,
        fontSize: 24,
        fill: "#000000",
        fontFamily: "Arial",
        selectable: true,
        evented: true,
        ...config,
      }),
    propertyFields: TEXT_FIELDS,
  });

  registry.register<ShapeConfig>("rect", {
    create: (config = {}) =>
      new Rect({
        left: DEFAULT_OFFSET,
        top: DEFAULT_OFFSET,
        width: 100,
        height: 80,
        fill: "#ff0000",
        stroke: "#333333",
        strokeWidth: 1,
        selectable: true,
        evented: true,
        ...config,
      }),
    propertyFields: [...POSITION_FIELDS, ...RECT_SIZE_FIELDS, ...APPEARANCE_FIELDS, ...RECT_CORNER_FIELDS, ...TRANSFORM_FIELDS],
  });

  registry.register<ShapeConfig>("circle", {
    create: (config = {}) =>
      new Circle({
        left: DEFAULT_OFFSET,
        top: DEFAULT_OFFSET,
        radius: 50,
        fill: "#0000ff",
        stroke: "#333333",
        strokeWidth: 1,
        selectable: true,
        evented: true,
        ...config,
      }),
    propertyFields: [...POSITION_FIELDS, ...CIRCLE_FIELDS, ...APPEARANCE_FIELDS, ...TRANSFORM_FIELDS],
  });

  registry.register<ShapeConfig>("line", {
    create: (config = {}) =>
      new Line([50, 100, 200, 100], {
        stroke: "#333333",
        strokeWidth: 1,
        selectable: true,
        evented: true,
        ...config,
      }),
    propertyFields: LINE_FIELDS,
  });

  registry.register<ShapeConfig>("ellipse", {
    create: (config = {}) =>
      new Ellipse({
        left: 150,
        top: 150,
        rx: 60,
        ry: 40,
        fill: SHAPE_COLORS.ellipse,
        selectable: true,
        evented: true,
        ...config,
      }),
    propertyFields: [...POSITION_FIELDS, ...ELLIPSE_FIELDS, ...APPEARANCE_FIELDS, ...TRANSFORM_FIELDS],
  });

  // Fabric's `type` is a read-only getter derived from the class in v6 (`.set('type', ...)`
  // is a silent no-op) so shapes sharing a base Fabric class carry their registry id in
  // `shapeKind` instead, distinct from Rect's native `type` of "rect".
  registry.register<ShapeConfig>("rounded-rectangle", {
    create: (config = {}) => {
      const rect = new Rect({
        left: DEFAULT_OFFSET,
        top: DEFAULT_OFFSET,
        width: 120,
        height: 80,
        rx: 15,
        ry: 15,
        fill: SHAPE_COLORS.roundedRectangle,
        selectable: true,
        evented: true,
        ...config,
      });
      rect.set("shapeKind", "rounded-rectangle");
      return rect;
    },
    propertyFields: [...POSITION_FIELDS, ...RECT_SIZE_FIELDS, ...APPEARANCE_FIELDS, ...RECT_CORNER_FIELDS, ...TRANSFORM_FIELDS],
  });

  for (const [shapeType, coordinates] of Object.entries(SHAPE_COORDINATES)) {
    registry.register<ShapeConfig>(shapeType, {
      create: (config = {}) => {
        const polygon = new Polygon([...coordinates], {
          left: 250,
          top: 200,
          fill: SHAPE_COLORS[shapeType] ?? "#333333",
          selectable: true,
          evented: true,
          ...config,
        });
        polygon.set("shapeKind", shapeType);
        return polygon;
      },
      propertyFields: [...POSITION_FIELDS, ...POLYGON_SCALE_FIELDS, ...APPEARANCE_FIELDS, ...TRANSFORM_FIELDS],
    });
  }
}
