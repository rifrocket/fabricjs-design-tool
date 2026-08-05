import { useState } from "react";
import type { ReactElement } from "react";
import { Info, ArrowRight } from "lucide-react";
import { FEATURE_DOCS } from "./featureDocs";

export function InfoTooltip({ featureKey }: { featureKey: string }): ReactElement | null {
  const [open, setOpen] = useState(false);
  const doc = FEATURE_DOCS[featureKey];
  if (!doc) return null;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`About ${doc.title}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-fdt-fg-muted transition-colors duration-150 hover:text-fdt-accent"
      >
        <Info size={14} strokeWidth={2} />
      </button>
      {open && (
        <div
          role="tooltip"
          className="fdt-animate-scale-in absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-3 text-left shadow-lg"
        >
          <p className="text-xs font-semibold text-fdt-fg">{doc.title}</p>
          <p className="mt-1 text-xs text-fdt-fg-muted">{doc.description}</p>
          <p className="mt-2 text-xs text-fdt-fg-muted">
            <span className="font-medium text-fdt-fg">Tip: </span>
            {doc.usageTip}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-fdt-bg p-1.5 text-[10px] text-fdt-accent">
            <code>{doc.codeSnippet}</code>
          </pre>
          {doc.docLink && (
            <a
              href={doc.docLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-fdt-accent hover:underline"
            >
              Learn more
              <ArrowRight size={12} strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </span>
  );
}
