import { useState } from "react";
import type { ReactElement } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import {
  duplicateEffect,
  removeEffect,
  reorderEffect,
  resetEffect,
  toggleEffect,
  updateEffectProps,
} from "@rifrocket/fabricjs-design-tool";
import type { EffectStack } from "@rifrocket/fabricjs-design-tool";
import { buildEffectRows, useEditor } from "@rifrocket/fdt-react";
import { getEffectIcon } from "./effectIcons";
import { EffectPropertyControls } from "./EffectPropertyControls";

const ROW_BUTTON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg hover:text-fdt-fg";

export interface EffectStackListProps {
  stack: EffectStack;
  apply: (next: EffectStack) => void;
}

// Renders the applied effect stack: enable toggle, reorder, duplicate, remove, and an
// expand-to-edit property panel — one row expanded at a time. Every mutation goes through one of
// core's pure effectStack.ts helpers, then apply(), matching useObjectEffects' documented flow.
export function EffectStackList({ stack, apply }: EffectStackListProps): ReactElement | null {
  const engine = useEditor();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rows = buildEffectRows(stack, engine.registry.effects);

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map(({ instance, definition }, index) => {
        const Icon = getEffectIcon(definition.id);
        const expanded = expandedId === instance.instanceId;

        return (
          <li key={instance.instanceId} className="rounded-lg border border-fdt-border bg-fdt-bg-elevated">
            <div className="flex items-center gap-1.5 p-1.5">
              <Icon size={15} strokeWidth={1.75} className="shrink-0 text-fdt-fg-muted" />
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : instance.instanceId)}
                className={`flex flex-1 items-center gap-1 truncate text-left text-xs ${instance.enabled ? "text-fdt-fg" : "text-fdt-fg-muted line-through"}`}
              >
                {definition.label}
              </button>

              <button
                type="button"
                title={instance.enabled ? "Disable" : "Enable"}
                onClick={() => apply(toggleEffect(stack, instance.instanceId))}
                className={ROW_BUTTON_CLASS}
              >
                {instance.enabled ? <Eye size={14} strokeWidth={1.75} /> : <EyeOff size={14} strokeWidth={1.75} />}
              </button>
              <button
                type="button"
                title="Move up"
                disabled={index === 0}
                onClick={() => apply(reorderEffect(stack, index, index - 1))}
                className={`${ROW_BUTTON_CLASS} disabled:opacity-30`}
              >
                <ChevronUp size={14} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Move down"
                disabled={index === rows.length - 1}
                onClick={() => apply(reorderEffect(stack, index, index + 1))}
                className={`${ROW_BUTTON_CLASS} disabled:opacity-30`}
              >
                <ChevronDown size={14} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Duplicate"
                onClick={() => apply(duplicateEffect(stack, instance.instanceId))}
                className={ROW_BUTTON_CLASS}
              >
                <Copy size={13} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Remove effect"
                onClick={() => apply(removeEffect(stack, instance.instanceId))}
                className={`${ROW_BUTTON_CLASS} hover:text-fdt-danger`}
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </button>
            </div>

            {expanded && (
              <div className="border-t border-fdt-border px-2.5 pb-2.5">
                <EffectPropertyControls
                  schema={definition.schema}
                  instance={instance}
                  onChange={(patch) => apply(updateEffectProps(stack, instance.instanceId, patch))}
                />
                {definition.schema.length > 0 && (
                  <button
                    type="button"
                    onClick={() => apply(resetEffect(stack, instance.instanceId, definition))}
                    className="mt-2 flex items-center gap-1 text-[11px] text-fdt-fg-muted hover:text-fdt-fg"
                  >
                    <RotateCcw size={11} strokeWidth={1.75} />
                    Reset
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
