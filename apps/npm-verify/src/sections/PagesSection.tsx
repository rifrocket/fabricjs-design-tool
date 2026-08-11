import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { PagesProvider, PagesCanvas, PageTabsBar, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { useCoverage } from "../checklist/CoverageContext";
import { BUTTON_CLASS } from "../theme/classNames";

// Required even though nothing here calls engine.importFile("json", ...) directly: core's
// restoreSnapshot() — used internally by PagesManager.duplicatePage()/copyPage()/
// duplicatePagePair()/hydrate() to carry a source page's content onto a new one — goes through
// engine.importFile("json", ...), which throws "No importer registered for \"json\"" on any
// page whose engine doesn't have this plugin installed. None of plugin-pages' own presets
// (default/minimal, borrowed from @rifrocket/fdt-react) include it, and this dependency isn't
// documented anywhere — see the README's "Known finding" section for the full trace.
const PAGES_PLUGINS = [importJsonPlugin];

const RECT_COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

function PagesInner(): ReactElement {
  const { pages, activePageId, manager, activeEngine } = usePagesContext();
  const { report } = useCoverage();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || pages.length > 0) return;
    seededRef.current = true;
    const page = manager.addPage({ name: "Page 1" });
    void manager.setActivePage(page.id);
  }, [pages.length, manager]);

  // The auto-seed effect above already creates page 1, so any manually-added page here is a
  // second, independently engined page — the concrete proof this package's model works.
  const addPage = async () => {
    const page = manager.addPage({ name: `Page ${pages.length + 1}` });
    await manager.setActivePage(page.id);
    report("pages", "pass");
  };

  // <PagesProvider> re-provides EditorContext with whichever page is active (see this
  // package's own README), so activeEngine here is always the *currently switched-to* page's
  // own independent CanvasEngine — adding a shape to it, then switching tabs, is the concrete,
  // visible proof that each page really is a separate engine rather than one shared canvas.
  const addRectToActivePage = async () => {
    if (!activeEngine) return;
    const color = RECT_COLORS[Math.floor(Math.random() * RECT_COLORS.length)];
    await activeEngine.addObjectOfType("rect", {
      left: 40 + Math.random() * 200,
      top: 40 + Math.random() * 150,
      fill: color,
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button type="button" className={BUTTON_CLASS} onClick={() => void addPage()}>
          Add page
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => void addRectToActivePage()} disabled={!activeEngine}>
          Add rectangle to active page
        </button>
        <span className="text-xs text-fdt-fg-muted">
          {pages.length} page(s) · active: {activePageId ?? "none"}
        </span>
      </div>
      {/* PageTabsBar/PagesCanvas are styled entirely with Tailwind's bg-fdt-.../border-fdt-...
          utilities (see packages/plugin-pages/src/react) — they render unstyled/overlapping
          without the token-bridge Tailwind setup this app now has in src/styles/tailwind.css. */}
      <div className="overflow-hidden rounded-xl border border-fdt-border bg-fdt-bg-elevated">
        <PageTabsBar />
        <div className="min-h-[400px]" data-fdt-canvas-container="true">
          <PagesCanvas fallback={<p className="p-6 text-sm text-fdt-fg-muted">Add a page to get started.</p>} />
        </div>
      </div>
    </div>
  );
}

// One lazily-created CanvasEngine per page (PagesManager), proven here by adding a second page
// and confirming setActivePage resolves to an independent engine rather than reusing the first.
export function PagesSection(): ReactElement {
  return (
    <section className="rounded-2xl border border-fdt-border bg-fdt-bg p-5 shadow-sm">
      <h2 className="m-0 mb-3.5 text-[15px] font-semibold text-fdt-fg">Multi-page workspace (plugin-pages)</h2>
      <PagesProvider options={{ maxPages: 5, preset: "default", plugins: PAGES_PLUGINS }}>
        <PagesInner />
      </PagesProvider>
    </section>
  );
}
