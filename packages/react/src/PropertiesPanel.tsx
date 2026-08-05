import type { ComponentType, ReactElement } from "react";
import { resolveObjectTypeId } from "@rifrocket/fabricjs-design-tool";
import type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";
import { useEditor } from "./useEditor";
import { useEditorState } from "./useEditorState";
import { resolvePropertyFields } from "./resolvePropertyFields";
import { buildPropertyFieldRows } from "./buildPropertyFieldRows";

// Re-exported from @rifrocket/fabricjs-design-tool, where it has to live so that
// @rifrocket/fdt-properties's shared field components can type against it without depending on
// this package (see core's objectTypeRegistry.ts for the full reasoning) — kept as a named
// export here too since this is where consumers writing a custom field component look for it.
export type { PropertyFieldProps } from "@rifrocket/fabricjs-design-tool";

// Renders one row per registerPropertyFields() entry (or one 2-column row per half+half pair —
// see buildPropertyFieldRows.ts) for the first selected object's type, replacing v1's
// RightSidebar hardcoded per-type switch statement.
export function PropertiesPanel(): ReactElement | null {
  const engine = useEditor();
  useEditorState((state) => state.selectedObjectIds);
  // Re-render on property mutations too, not just selection changes — otherwise a field here
  // edits the object correctly but this panel never reflects it (see EngineState.propertyVersion).
  useEditorState((state) => state.propertyVersion);
  const [object] = engine.selection.getActiveObjects();

  if (!object) return null;

  const typeId = resolveObjectTypeId(object);
  const fields = resolvePropertyFields(engine.registry.objectTypes, typeId).filter((field) => field.component);
  const rows = buildPropertyFieldRows(fields);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key}>
          {row.sectionHeader && (
            <div
              className={`mb-2 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted ${
                row.sectionHeader.isFirstSection ? "" : "border-t border-fdt-border pt-3"
              }`}
            >
              {row.sectionHeader.text}
            </div>
          )}
          <div className={row.fields.length === 2 ? "grid grid-cols-2 gap-3" : undefined}>
            {row.fields.map((field) => {
              const Component = field.component as ComponentType<PropertyFieldProps>;
              return (
                <Component
                  key={field.key}
                  object={object}
                  field={field}
                  onChange={(value) => engine.setObjectProperty(object, field.key, value)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
