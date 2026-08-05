import { useState } from "react";
import type { ReactElement } from "react";
import { LayersPanel } from "@rifrocket/fdt-react";
import { FEATURE_DOCS } from "./featureDocs";

// Reuses the exact same authored data as docs/InfoTooltip.tsx — one source, two consumption
// points (inline contextual tooltip vs. this browsable reference list).
export function ApiUsageSnippets(): ReactElement {
  const [showBuiltInLayers, setShowBuiltInLayers] = useState(false);
  const docs = Object.values(FEATURE_DOCS);

  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">API usage</div>
      <ul className="flex flex-col gap-2">
        {docs.map((doc) => (
          <li key={doc.key} className="rounded-md border border-fdt-border bg-fdt-bg p-2">
            <p className="text-xs font-medium text-fdt-fg">{doc.title}</p>
            <pre className="mt-1 overflow-x-auto text-[10px] text-fdt-accent">
              <code>{doc.codeSnippet}</code>
            </pre>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-fdt-border pt-3">
        <button
          type="button"
          onClick={() => setShowBuiltInLayers((prev) => !prev)}
          className="text-xs text-fdt-accent hover:underline"
        >
          {showBuiltInLayers ? "Hide" : "Show"} @rifrocket/fdt-react's built-in &lt;LayersPanel/&gt;
        </button>
        <p className="mt-1 text-[10px] text-fdt-fg-muted">
          This demo's own layers list (Layers tab) adds drag-reorder on top — this is the unmodified,
          drop-in library component for comparison.
        </p>
        {showBuiltInLayers && (
          <div className="mt-2 rounded-md border border-fdt-border bg-fdt-bg p-2 text-xs">
            <LayersPanel />
          </div>
        )}
      </div>
    </div>
  );
}
