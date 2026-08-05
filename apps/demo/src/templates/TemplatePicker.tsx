import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { useFocusTrap } from "@rifrocket/fdt-react";
import { useTemplateContext } from "./TemplateContext";
import { InfoTooltip } from "../docs/InfoTooltip";

export function TemplatePicker(): ReactElement {
  const [open, setOpen] = useState(false);
  const { templates, activeTemplate, setActiveTemplateId } = useTemplateContext();
  // Stable reference — see QRCodeDialog.tsx for why useFocusTrap needs this, not an inline fn.
  const handleEscape = useCallback(() => setOpen(false), []);
  const containerRef = useFocusTrap<HTMLDivElement>({ active: open, onEscape: handleEscape });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-fdt-fg transition-colors duration-150 hover:bg-fdt-bg-elevated"
      >
        <LayoutGrid size={15} strokeWidth={2} className="text-fdt-fg-muted" />
        {activeTemplate.label}
        <ChevronDown size={13} strokeWidth={2.5} className="text-fdt-fg-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={containerRef}
            className="fdt-animate-scale-in absolute left-0 top-full z-50 mt-2 grid w-[560px] grid-cols-4 gap-2 rounded-xl border border-fdt-border bg-fdt-bg-elevated p-3 shadow-xl"
          >
            <div className="col-span-4 mb-1 flex items-center gap-1.5 text-xs font-semibold text-fdt-fg-muted">
              Choose a template
              <InfoTooltip featureKey="templates" />
            </div>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setActiveTemplateId(template.id);
                  setOpen(false);
                }}
                aria-current={template.id === activeTemplate.id}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors duration-150 ${
                  template.id === activeTemplate.id
                    ? "border-fdt-accent bg-fdt-bg"
                    : "border-fdt-border bg-fdt-bg hover:border-fdt-accent"
                }`}
              >
                <span
                  className="flex w-full items-center justify-center rounded border border-fdt-border/60"
                  style={{
                    aspectRatio: `${template.width} / ${template.height}`,
                    backgroundColor: template.backgroundColor ?? "#ffffff",
                    maxHeight: 56,
                  }}
                />
                <span className="text-[11px] leading-tight text-fdt-fg">{template.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
