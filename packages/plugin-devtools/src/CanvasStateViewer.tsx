import { useState } from "react";
import type { ReactElement } from "react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import type { ExportResult } from "@rifrocket/fdt-core";

export function CanvasStateViewer(): ReactElement {
  const engine = useEditor();
  const zoom = useEditorState((state) => state.zoom);
  const panX = useEditorState((state) => state.panX);
  const panY = useEditorState((state) => state.panY);
  const objectCount = useEditorState((state) => state.objectIds.length);
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);
  const [showJson, setShowJson] = useState(false);

  return (
    <div>
      <dl>
        <dt>Zoom</dt>
        <dd>{zoom.toFixed(2)}×</dd>
        <dt>Pan</dt>
        <dd>
          {Math.round(panX)}, {Math.round(panY)}
        </dd>
        <dt>Objects</dt>
        <dd>{objectCount}</dd>
        <dt>Selected</dt>
        <dd>{selectedCount}</dd>
        <dt>Snapping</dt>
        <dd>{engine.snapping.isEnabled() ? "on" : "off"}</dd>
      </dl>
      <button type="button" onClick={() => setShowJson((prev) => !prev)}>
        {showJson ? "Hide" : "Show"} raw JSON
      </button>
      {showJson && <pre>{(engine.export("json") as ExportResult).data as string}</pre>}
    </div>
  );
}
