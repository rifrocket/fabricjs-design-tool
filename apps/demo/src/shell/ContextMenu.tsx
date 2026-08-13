import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactElement } from "react";
import { BringToFront, SendToBack, Copy, Layers, Trash2 } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import { cloneFabricObject } from "@rifrocket/fdt-plugin-clipboard";
import { logUiEvent } from "../dev-tools/uiEventLog";

interface MenuState {
  x: number;
  y: number;
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-fdt-fg transition-colors duration-100 hover:bg-fdt-bg-elevated";

// Right-click menu for the current selection, mirroring the shortcuts already registered by
// @rifrocket/fdt-plugin-clipboard — a second, discoverable entry point to the same engine calls.
// Rendered via a real portal into #fdt-overlay-root (see index.html) so it always paints
// above the canvas regardless of DOM nesting/stacking contexts.
export function ContextMenu(): ReactElement | null {
  const engine = useEditor();
  const [menu, setMenu] = useState<MenuState | null>(null);

  useEffect(() => {
    // wrapperEl is Fabric's own DOM wrapper node — no RendererApi equivalent
    // (FUTURE_IMPLEMENTATION.md Chunk 8.3), so this stays on getFabricCanvas().
    const target = engine.getFabricCanvas().wrapperEl;

    const handleContextMenu = (event: globalThis.MouseEvent) => {
      event.preventDefault();
      if (!engine.selection.getActive()) return;
      setMenu({ x: event.clientX, y: event.clientY });
    };
    const close = () => setMenu(null);

    target.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", close);
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());

    return () => {
      target.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", close);
    };
  }, [engine]);

  if (!menu) return null;

  // uiLabel is only passed for actions with no HistoryManager representation (z-order,
  // group/ungroup) — duplicate/delete are command-backed and show up in HistoryPanel instead
  // (@rifrocket/fdt-plugin-devtools), so they don't need a uiEventLog entry too.
  const run = (fn: () => void, uiLabel?: string) => {
    fn();
    if (uiLabel) logUiEvent(uiLabel);
    setMenu(null);
  };

  const portalRoot = document.getElementById("fdt-overlay-root");
  if (!portalRoot) return null;

  return createPortal(
    <div
      role="menu"
      className="fdt-animate-scale-in fixed z-[60] w-44 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-1 shadow-2xl"
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        role="menuitem"
        className={ITEM_CLASS}
        onClick={() => run(() => engine.layers.bringToFront(engine.selection.getActive()!), "Bring to front")}
      >
        <BringToFront size={15} strokeWidth={2} className="text-fdt-fg-muted" />
        Bring to front
      </button>
      <button
        type="button"
        role="menuitem"
        className={ITEM_CLASS}
        onClick={() => run(() => engine.layers.sendToBack(engine.selection.getActive()!), "Send to back")}
      >
        <SendToBack size={15} strokeWidth={2} className="text-fdt-fg-muted" />
        Send to back
      </button>
      <button
        type="button"
        role="menuitem"
        className={ITEM_CLASS}
        onClick={() =>
          run(async () => {
            const objects = engine.selection.getActiveObjects();
            const duplicated = await Promise.all(objects.map((object) => cloneFabricObject(object)));
            duplicated.forEach((object) => engine.addObject(object));
            engine.selection.selectMultiple(duplicated);
          })
        }
      >
        <Copy size={15} strokeWidth={2} className="text-fdt-fg-muted" />
        Duplicate
      </button>
      <button
        type="button"
        role="menuitem"
        className={ITEM_CLASS}
        onClick={() => run(() => engine.selection.group(), "Group")}
      >
        <Layers size={15} strokeWidth={2} className="text-fdt-fg-muted" />
        Group
      </button>
      <button
        type="button"
        role="menuitem"
        className={ITEM_CLASS}
        onClick={() => run(() => engine.selection.ungroup(), "Ungroup")}
      >
        <Layers size={15} strokeWidth={2} className="rotate-90 text-fdt-fg-muted" />
        Ungroup
      </button>
      <div className="my-1 h-px bg-fdt-border" />
      <button
        type="button"
        role="menuitem"
        className={`${ITEM_CLASS} text-fdt-danger`}
        onClick={() => run(() => engine.deleteSelection())}
      >
        <Trash2 size={15} strokeWidth={2} />
        Delete
      </button>
    </div>,
    portalRoot,
  );
}
