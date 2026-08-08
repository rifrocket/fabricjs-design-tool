import type { ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";
import { SHAPE_COORDINATES } from "@rifrocket/fdt-plugin-shapes-basic";
import type { PolygonShapeType } from "@rifrocket/fdt-plugin-shapes-basic";

// The 6 primitive types registerBasicShapes() registers directly, plus every polygon type it
// derives from SHAPE_COORDINATES — kept in sync with that plugin's own source rather than
// hand-duplicated, so a shape added there automatically gets a picker button here too.
export const BASIC_SHAPE_TYPE_IDS = [
  "text",
  "rect",
  "circle",
  "line",
  "ellipse",
  "rounded-rectangle",
  ...(Object.keys(SHAPE_COORDINATES) as PolygonShapeType[]),
] as const;

const SHAPE_LABELS: Partial<Record<(typeof BASIC_SHAPE_TYPE_IDS)[number], string>> = {
  text: "Text",
  rect: "Rectangle",
  circle: "Circle",
  line: "Line",
  ellipse: "Ellipse",
  "rounded-rectangle": "Rounded rectangle",
  speechBubble: "Speech bubble",
};

function labelFor(typeId: string): string {
  return SHAPE_LABELS[typeId as (typeof BASIC_SHAPE_TYPE_IDS)[number]] ?? typeId.charAt(0).toUpperCase() + typeId.slice(1);
}

// Bare, unstyled shape-creation UI — one button per type @rifrocket/fdt-plugin-shapes-basic
// registers, each calling the same public engine.addObjectOfType() any consumer's own picker
// would call. Registered into the "tool-rail" panel slot by createShapesBasicPanelPlugin()'s
// install(); a host with its own styled picker (e.g. apps/demo's ShapeGallery) suppresses that
// slot and renders its own UI directly instead — same pattern already established for
// AlignmentControls/SnappingToggle.
export function ShapePicker(): ReactElement {
  const engine = useEditor();
  return (
    <div role="group" aria-label="Shapes">
      {BASIC_SHAPE_TYPE_IDS.map((typeId) => (
        <button key={typeId} type="button" onClick={() => void engine.addObjectOfType(typeId, {})}>
          {labelFor(typeId)}
        </button>
      ))}
    </div>
  );
}
