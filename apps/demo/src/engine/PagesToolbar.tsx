import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { CreditCard, RefreshCcw } from "lucide-react";
import { PageTabsBar, PairSideToggle, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { getObjectId } from "@rifrocket/fabricjs-design-tool";
import { logUiEvent } from "../dev-tools/uiEventLog";

const TOOL_BUTTON_CLASS =
  "flex h-8 items-center gap-1.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated px-2.5 text-xs font-medium text-fdt-fg transition-colors duration-150 hover:border-fdt-accent hover:text-fdt-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-fdt-border disabled:hover:text-fdt-fg";

// Everything above PageTabsBar demonstrates the front/back pairing feature end-to-end, on top of
// @rifrocket/fdt-plugin-pages' real public API — no hand-rolled duplicate logic here, per this
// repo's "demo must consume packages directly" convention.
export function PagesToolbar(): ReactElement {
  const { pages, activePageId, manager } = usePagesContext();
  const [selectionCount, setSelectionCount] = useState(0);

  const activePage = pages.find((page) => page.id === activePageId) ?? null;
  const activeEngine = activePageId ? manager.getEngine(activePageId) : undefined;
  const sibling = activePage?.pairId ? manager.getPairSibling(activePage.id) : undefined;

  // Tracks the active page's own selection so "Copy to other side" can disable itself when
  // there's nothing to copy — engine.selection has no reactive subscribe of its own (ContextMenu
  // reads it imperatively, at click time, for the same reason), so this listens to the
  // underlying Fabric canvas' own selection events directly, same as any other Fabric consumer
  // would outside this framework.
  useEffect(() => {
    if (!activeEngine) {
      setSelectionCount(0);
      return;
    }
    const canvas = activeEngine.getFabricCanvas();
    const sync = () => setSelectionCount(activeEngine.selection.getActiveObjects().length);
    sync();
    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("selection:cleared", sync);
    return () => {
      canvas.off("selection:created", sync);
      canvas.off("selection:updated", sync);
      canvas.off("selection:cleared", sync);
    };
  }, [activeEngine]);

  return (
    <div className="flex flex-col gap-1.5 border-t border-fdt-border bg-fdt-bg px-2 py-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          data-tour="new-pair-button"
          className={TOOL_BUTTON_CLASS}
          onClick={() => {
            const { front } = manager.addPagePair({
              name: "Business Card",
              front: { templateId: "business-card-front" },
              back: { templateId: "business-card-back" },
            });
            void manager.setActivePage(front.id);
            logUiEvent("Add business card pair");
          }}
        >
          <CreditCard size={13} strokeWidth={2} />
          New business card
        </button>

        <div data-tour="pair-toggle" className="inline-flex">
          <PairSideToggle />
        </div>

        <button
          type="button"
          disabled={!sibling || selectionCount === 0}
          title={
            !sibling
              ? "Only available on a front/back pair"
              : selectionCount === 0
                ? "Select an object to copy first"
                : `Copy ${selectionCount} object(s) to the ${sibling.pairSide}`
          }
          className={TOOL_BUTTON_CLASS}
          onClick={async () => {
            if (!activeEngine || !activePage || !sibling) return;
            const ids = activeEngine.selection.getActiveObjects().map((object) => getObjectId(object));
            await manager.copyObjectsBetweenPages(ids, activePage.id, sibling.id);
            logUiEvent(`Copy to ${sibling.pairSide}`);
          }}
        >
          <RefreshCcw size={13} strokeWidth={2} />
          Copy to other side
        </button>
      </div>

      <div data-tour="page-tabs-bar" className="w-full">
        <PageTabsBar />
      </div>
    </div>
  );
}
