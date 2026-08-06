import { useState } from "react";
import type { ReactElement } from "react";
import { addEffect } from "@rifrocket/fabricjs-design-tool";
import type { EffectCategory, EffectStack } from "@rifrocket/fabricjs-design-tool";
import { useEditor } from "@rifrocket/fdt-react";
import { getEffectIcon } from "./effectIcons";

type CategoryFilter = EffectCategory | "all";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "creative", label: "Creative" },
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
];

export interface EffectGalleryProps {
  stack: EffectStack;
  apply: (next: EffectStack) => void;
}

// Category-chip filtered grid of preset buttons — the structural analog of ShapeGallery, minus
// the modal shell, since this already lives inside the Effects tab rather than needing its own
// dialog. Clicking a preset appends it to the stack with its schema's own defaults.
export function EffectGallery({ stack, apply }: EffectGalleryProps): ReactElement {
  const engine = useEditor();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const effects =
    category === "all" ? engine.registry.effects.list() : engine.registry.effects.listByCategory(category);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            aria-current={category === cat.id}
            className={`rounded-full px-2.5 py-1 text-[11px] transition-colors duration-150 ${
              category === cat.id
                ? "bg-fdt-accent/10 text-fdt-accent"
                : "text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {effects.length === 0 ? (
        <p className="text-xs text-fdt-fg-muted">No effects in this category.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {effects.map((definition) => {
            const Icon = getEffectIcon(definition.id);
            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => apply(addEffect(stack, definition))}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-2.5 text-fdt-fg transition-colors duration-150 hover:border-fdt-accent hover:bg-fdt-bg"
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-center text-[10px] leading-tight text-fdt-fg-muted">{definition.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
