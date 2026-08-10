import type { ReactElement } from "react";
import { ArrowLeftRight } from "lucide-react";
import { usePagesContext } from "./usePagesContext";

// Exported standalone (not folded into PageTabsBar) so consumers can place it canvas-adjacent —
// where you're actually looking while editing a pair — rather than only in the tab strip below
// the canvas. Renders null when the active page isn't part of a pair, so it's safe to render
// unconditionally in custom chrome.
export function PairSideToggle(): ReactElement | null {
  const { pages, activePageId, manager } = usePagesContext();
  const activePage = pages.find((page) => page.id === activePageId);
  if (!activePage?.pairId) return null;

  const sibling = manager.getPairSibling(activePage.id);
  if (!sibling) return null;

  return (
    <button
      type="button"
      onClick={() => void manager.setActivePage(sibling.id)}
      title={`Switch to ${sibling.pairSide ?? "other side"}`}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated px-2.5 text-xs font-medium text-fdt-fg transition-colors duration-150 hover:border-fdt-accent hover:text-fdt-accent"
    >
      <ArrowLeftRight size={13} strokeWidth={2} />
      <span className="capitalize">{activePage.pairSide}</span>
      <span className="text-fdt-fg-muted">→</span>
      <span className="capitalize">{sibling.pairSide}</span>
    </button>
  );
}
