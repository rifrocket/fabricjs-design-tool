import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { PageTabsBar, PagesProvider, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { alignmentPlugin } from "@rifrocket/fdt-plugin-alignment";
import { snappingPlugin } from "@rifrocket/fdt-plugin-snapping";
import { devtoolsPlugin } from "@rifrocket/fdt-plugin-devtools";
import { createEffectsPanelPlugin } from "@rifrocket/fdt-plugin-effects-panel";
import { createShapesBasicPanelPlugin } from "@rifrocket/fdt-plugin-shapes-basic-panel";
import { captureSnapshotExcludingBoundary } from "@rifrocket/fdt-plugin-pan-zoom";
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
// it doesn't bundle: importJsonPlugin, stampToolPlugin, plus alignment/snapping/devtools/
// effects-panel/shapes-basic-panel (mirrors EngineHost.tsx's own `add` override exactly, minus
// localStoragePlugin — that one needs an app-specific captureMeta callback tied to a single
// document, which plugin-pages' own, separate persistence model doesn't use). Those panel plugins
// are excluded from every built-in preset for the same circular-dependency reason EngineHost.tsx
// documents (they depend on @rifrocket/fdt-react themselves) — installed here too so
// RightSidebar/LeftToolRail's shared AlignmentToolbar/SnappingToggle/DevToolsPanel/EffectsPanel/
// ShapeGallery (rendered unconditionally in both "workspace" and "pages" AppShell modes) have
// their registries/uninstall semantics genuinely wired per page, not just their headless hooks
// working by accident against always-on core managers.
//
// plugin-effects' render patch is per-canvas (not a single global monkey-patch bound to whichever
// engine installs first) — fixed in @rifrocket/fdt-plugin-effects, see design-docs/
// PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md Addendum #2 — so effects render correctly across every
// page's own engine here, not just the first one created.
//
// PageCanvasHost gives every page's engine the same page-boundary rect (via usePannableDocument)
// CanvasWorkspace.tsx gives the single document — without captureSnapshot here, PagesManager's
// internal duplicatePage()/getSnapshotForPersistence()/refreshThumbnail() calls would leak that
// rect into every page's saved JSON/duplicate/thumbnail the same way the single-document flow used
// to before plugin-pan-zoom's captureSnapshotExcludingBoundary existed (see design-docs/
// PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md Addendum #3 and #6).
//
// No `shortcuts` wiring needed here at all — usePages() (which PagesProvider is built on) now
// registers the same default undo/redo/delete/deselect bindings <Editor>/<DesignEditor> always
// have, automatically, against whichever page is active. Previously this screen had zero
// keyboard shortcuts (only <MultiPageDesignEditor> wired them) — see Addendum #7.
export function MultiPageExample({ onExit }: { onExit: () => void }): ReactElement {
  return (
    <PagesProvider
      options={{
        maxPages: MAX_PAGES,
        preset: "default",
        captureSnapshot: captureSnapshotExcludingBoundary,
        plugins: {
          add: [
            importJsonPlugin,
            stampToolPlugin,
            alignmentPlugin,
            snappingPlugin,
            devtoolsPlugin,
            createEffectsPanelPlugin(),
            createShapesBasicPanelPlugin(),
          ],
        },
      }}
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
