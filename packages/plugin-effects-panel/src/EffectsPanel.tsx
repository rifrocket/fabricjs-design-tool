import type { ReactElement, ReactNode } from "react";
import { resetAllEffects } from "@rifrocket/fabricjs-design-tool";
import { useEditor, useObjectEffects } from "@rifrocket/fdt-react";
import { EffectStackList } from "./EffectStackList";
import { EffectGallery } from "./EffectGallery";

export interface EffectsPanelProps {
  /** Rendered next to the "Effects" heading — e.g. a host app's own docs/tooltip widget. */
  headingExtra?: ReactNode;
}

// Renders nothing when there's no selection — stays self-contained for direct reuse regardless
// of whether the host already guards on selection count itself.
export function EffectsPanel({ headingExtra }: EffectsPanelProps = {}): ReactElement | null {
  const engine = useEditor();
  const [object] = engine.selection.getActiveObjects();
  const { stack, apply } = useObjectEffects(object);

  if (!object) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
          Effects
          {headingExtra}
        </div>
        {stack.length > 0 && (
          <button
            type="button"
            onClick={() => apply(resetAllEffects())}
            className="text-[11px] text-fdt-danger hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      <EffectStackList stack={stack} apply={apply} />
      <EffectGallery stack={stack} apply={apply} />
    </div>
  );
}
