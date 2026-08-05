import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";

interface Guide {
  id: number;
  axis: "horizontal" | "vertical";
  position: number;
}

let counter = 0;

// Cosmetic-only: SnapEngine has no extension point for custom guide magnetism, so these lines
// are purely visual reference marks — dragging past one won't attract to it like real snapping does.
// left/top is the page's current on-screen location (computed by the caller from pan/zoom),
// since the page can be panned anywhere within the fixed-size viewport.
export function GuidesOverlay({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}): ReactElement {
  const [guides, setGuides] = useState<Guide[]>([]);

  const addGuide = (axis: Guide["axis"], event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = axis === "horizontal" ? event.clientY - rect.top : event.clientX - rect.left;
    counter += 1;
    setGuides((prev) => [...prev, { id: counter, axis, position }]);
  };

  const removeGuide = (id: number) => setGuides((prev) => prev.filter((guide) => guide.id !== id));

  return (
    <div className="pointer-events-none absolute z-20" style={{ left, top, width, height }}>
      {/* Thin hit-zones along the top/left edges: double-click to drop a guide there. */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-0 h-2 cursor-row-resize"
        onDoubleClick={(event) => addGuide("horizontal", event)}
      />
      <div
        className="pointer-events-auto absolute inset-y-0 left-0 w-2 cursor-col-resize"
        onDoubleClick={(event) => addGuide("vertical", event)}
      />
      {guides.map((guide) =>
        guide.axis === "horizontal" ? (
          <div
            key={guide.id}
            role="separator"
            title="Guide — click to remove"
            onClick={() => removeGuide(guide.id)}
            className="pointer-events-auto absolute inset-x-0 h-px cursor-pointer bg-fdt-accent/70 hover:bg-fdt-danger"
            style={{ top: guide.position }}
          />
        ) : (
          <div
            key={guide.id}
            role="separator"
            title="Guide — click to remove"
            onClick={() => removeGuide(guide.id)}
            className="pointer-events-auto absolute inset-y-0 w-px cursor-pointer bg-fdt-accent/70 hover:bg-fdt-danger"
            style={{ left: guide.position }}
          />
        ),
      )}
    </div>
  );
}
