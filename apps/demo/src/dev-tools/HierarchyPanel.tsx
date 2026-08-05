import type { ReactElement } from "react";
import { Group } from "fabric";
import type { FabricObject } from "fabric";
import { ChevronDown, Circle } from "lucide-react";
import { getObjectId, resolveObjectTypeId } from "@rifrocket/fdt-core";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import { useDebugMode } from "./DebugModeToggle";

// Deliberately NOT migrated onto @rifrocket/fdt-plugin-devtools's HierarchyPanel — this
// version's debug-mode object-id overlay (useDebugMode()) has no analog in the shipped plugin.

function HierarchyNode({ object, depth }: { object: FabricObject; depth: number }): ReactElement {
  const engine = useEditor();
  const debugMode = useDebugMode();
  const children = object instanceof Group ? object.getObjects() : [];

  return (
    <li>
      <button
        type="button"
        onClick={() => engine.selection.select(object)}
        style={{ paddingLeft: depth * 14 }}
        className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs text-fdt-fg hover:bg-fdt-bg-elevated"
      >
        <span aria-hidden="true" className="text-fdt-fg-muted">
          {children.length > 0 ? <ChevronDown size={12} strokeWidth={2} /> : <Circle size={5} fill="currentColor" strokeWidth={0} />}
        </span>
        {resolveObjectTypeId(object)}
        {debugMode && <span className="ml-auto text-[10px] text-fdt-fg-muted">{getObjectId(object)}</span>}
      </button>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <HierarchyNode key={getObjectId(child)} object={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyPanel(): ReactElement {
  const engine = useEditor();
  useEditorState((state) => state.objectIds);
  const objects = engine.layers.getObjects();

  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">Object hierarchy</div>
      {objects.length === 0 ? (
        <p className="text-xs text-fdt-fg-muted">No objects yet.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {objects.map((object) => (
            <HierarchyNode key={getObjectId(object)} object={object} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
}
