import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { Keyboard, X } from "lucide-react";
import { useEditor, useFocusTrap } from "@rifrocket/fdt-react";

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// Zero hardcoded shortcut text — every row comes straight from engine.shortcuts.list(), so
// this stays accurate as plugins register their own bindings (see setupDefaultShortcuts in
// @rifrocket/fdt-react, @rifrocket/fdt-plugin-clipboard, and stampToolPlugin in this demo).
export function ShortcutsCheatSheet(): ReactElement {
  const engine = useEditor();
  const [open, setOpen] = useState(false);
  // Stable reference — see QRCodeDialog.tsx for why useFocusTrap needs this, not an inline fn.
  const handleEscape = useCallback(() => setOpen(false), []);
  const containerRef = useFocusTrap<HTMLDivElement>({ active: open, onEscape: handleEscape });

  const bindings = engine.shortcuts.list().filter((binding) => binding.description);

  return (
    <>
      <button type="button" title="Keyboard shortcuts" onClick={() => setOpen(true)} className={ICON_BUTTON_CLASS}>
        <Keyboard size={16} strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="fdt-animate-scale-in max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-fdt-border bg-fdt-bg-elevated p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fdt-fg">Keyboard shortcuts</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {bindings.map((binding) => (
                <li key={binding.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-fdt-fg-muted">{binding.description}</span>
                  <kbd className="rounded border border-fdt-border bg-fdt-bg px-1.5 py-0.5 font-mono text-xs uppercase text-fdt-fg">
                    {binding.key}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
