import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { PageTabsBar, PagesProvider, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { stampToolPlugin } from "../../plugins/stampToolPlugin";
import { AppShell } from "../../shell/AppShell";
import { PageCanvasHost } from "./PageCanvasHost";
import { PAGES_CANVAS_CONTAINER_SELECTOR } from "./pagesCanvasContainerSelector";

const MAX_PAGES = 12;

// Deliberately isolated from EngineHost's *document model*: that shell is a tuned
// single-document setup (one CanvasEngine, TemplateContext, localStoragePlugin autosave).
// plugin-pages orchestrates N independent CanvasEngines with its own persistence model —
// reconciling the two document models is a real product decision, not attempted here.
// @rifrocket/fdt-plugin-pages/react also ships <MultiPageDesignEditor>, a one-line batteries-
// included multi-page editor, for consumers who don't need a custom shell/pan-zoom — this screen
// deliberately stays on the lower-level PagesProvider/usePagesContext primitives instead, for the
// same reason EngineHost.tsx stays on <Editor>'s primitives rather than <DesignEditor>'s default
// chrome: it needs PageCanvasHost's pan/zoom + page-boundary-rect treatment and its own AppShell.
// What *is* shared with EngineHost: AppShell itself (Header/LeftToolRail/RightSidebar/StatusBar)
// and pan/zoom — see AppShell.tsx's "pages" mode and PageCanvasHost.tsx, which gives each page's
// canvas the same fixed-viewport-plus-page-boundary-rect treatment CanvasWorkspace.tsx gives the
// single document.
//
// preset="default" already bundles shapes/clipboard/svg-import/image/effects/export-pdf/qrcode
// (see packages/react/src/preset/builtinPresets.ts) — this `plugins.add` override adds only what
// it doesn't bundle: importJsonPlugin, stampToolPlugin (mirrors EngineHost.tsx's own `add`
// override exactly, minus localStoragePlugin — that one needs an app-specific captureMeta
// callback tied to a single document, which plugin-pages' own, separate persistence model
// doesn't use).
//
// Known caveat, not introduced here: plugin-effects' render patch is a single global
// FabricObject.prototype.render monkey-patch bound to the first CanvasEngine it installs into
// (see design-docs/RELEASE_VALIDATION_REPORT.md §9) — with multiple pages meaning multiple
// engines, effects may only render correctly on whichever page's engine was created first.
export function MultiPageExample({ onExit }: { onExit: () => void }): ReactElement {
  return (
    <PagesProvider
      options={{ maxPages: MAX_PAGES, preset: "default", plugins: { add: [importJsonPlugin, stampToolPlugin] } }}
    >
      <MultiPageWorkspace onExit={onExit} />
    </PagesProvider>
  );
}

function MultiPageWorkspace({ onExit }: { onExit: () => void }): ReactElement {
  const { pages, activePageId, manager } = usePagesContext();
  const seededRef = useRef(false);

  // PagesManager starts with zero pages by design (see PagesManagerOptions) — this screen's
  // first-run convenience, not something the package does for you.
  useEffect(() => {
    if (seededRef.current || pages.length > 0) return;
    seededRef.current = true;
    const page = manager.addPage({ name: "Page 1" });
    void manager.setActivePage(page.id);
  }, [pages.length, manager]);

  const activePage = pages.find((page) => page.id === activePageId) ?? null;

  return (
    <AppShell
      mode="pages"
      onExit={onExit}
      tabsBar={<PageTabsBar />}
      canvasArea={<PageCanvasHost />}
      documentSize={activePage ? { width: activePage.width, height: activePage.height } : null}
      containerSelector={PAGES_CANVAS_CONTAINER_SELECTOR}
    />
  );
}
