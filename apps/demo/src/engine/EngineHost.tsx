import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { DesignEditor, EditorContext } from "@rifrocket/fdt-react";
import type { CanvasEngine, DocumentSnapshotData, PluginOverrides } from "@rifrocket/fabricjs-design-tool";
import { restoreSnapshot } from "@rifrocket/fabricjs-design-tool";
import {
  useContainerSize,
  centerContent,
  createPageBoundaryRect,
  captureSnapshotExcludingBoundary,
} from "@rifrocket/fdt-plugin-pan-zoom";
import { loadDesignFromStorage } from "@rifrocket/fdt-plugin-local-storage";
import { PagesProvider, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { sharedEditorPlugins } from "../plugins/sharedEditorPlugins";
import { useTemplateContext } from "../templates/TemplateContext";
import { useThemeContext } from "../theme/ThemeContext";
import { AppShell } from "../shell/AppShell";
import type { PagesCollapseResult } from "../shell/AppShell";
import { SelectionQuickActions } from "../features/selection/SelectionQuickActions";
import { logUiEvent } from "../dev-tools/uiEventLog";
import { CANVAS_CONTAINER_SELECTOR } from "../features/viewport/canvasContainerSelector";
import type { StarterDesignMeta } from "../templates/types";
import { PageCanvasHost } from "./PageCanvasHost";
import { PagesToolbar } from "./PagesToolbar";
import { PAGES_CANVAS_CONTAINER_SELECTOR } from "./pagesCanvasContainerSelector";
import { BUSINESS_CARD_FRONT, BUSINESS_CARD_BACK } from "./businessCardTemplates";

interface ReadyState {
  templateId: string;
  engine: CanvasEngine;
}

interface PendingSeed {
  snapshot: DocumentSnapshotData;
  name: string;
  width: number;
  height: number;
}

const MAX_PAGES = 12;

// Used only until useContainerSize()'s ResizeObserver reports the workspace container's real
// size on first mount.
const FALLBACK_VIEWPORT_SIZE = { width: 800, height: 600 };

// Multi-page is an in-place toggle on this same screen (multiPageEnabled), not a separate
// top-level view — the single document and the multi-page document are still genuinely different
// runtimes (one CanvasEngine vs. PagesManager's N), but the *document* moves between them through
// real, public, symmetric conversions: PagesManager.seedFromDocument() going single->multi and the
// new PagesManager.exportPageAsDocument() going multi->single. TemplateProvider/autosave/
// ClearSavedDesignButton stay single-document concepts exactly as before — turning multi-page off
// restores a plain single document, indistinguishable from never having turned it on.
//
// EngineHost itself never unmounts (App.tsx renders it once), but each mode's own subtree
// (SingleDocumentWorkspace / MultiPageWorkspace, below) genuinely mounts and unmounts across the
// toggle — deliberately, not incidentally: useContainerSize() (plugin-pan-zoom) binds to its
// selector's DOM element exactly once, on mount, by design (a stable, long-lived container is its
// whole contract) — so each workspace needs a fresh component instance, and thus a fresh
// useContainerSize() lifecycle, every time it re-enters, rather than living inside a permanently-
// mounted EngineHost where the underlying container element gets replaced out from under it.
export function EngineHost(): ReactElement {
  const { setCustomSize } = useTemplateContext();
  const [multiPageEnabled, setMultiPageEnabled] = useState(false);

  // Bridges a snapshot across the toggle in each direction — read once, by whichever workspace
  // mounts next, then cleared. Refs (not state) since they're write-then-read-once handoffs, not
  // values either workspace renders from directly.
  const pendingSeedRef = useRef<PendingSeed | null>(null);
  const pendingRestoreRef = useRef<DocumentSnapshotData | null>(null);

  const handleEnableMultiPage = (seed: PendingSeed): void => {
    pendingSeedRef.current = seed;
    logUiEvent("Enable multi-page");
    setMultiPageEnabled(true);
  };

  const handleDisableMultiPage = (doc: PagesCollapseResult): void => {
    pendingRestoreRef.current = doc.snapshot;
    if (doc.page.width && doc.page.height) {
      setCustomSize(doc.page.width, doc.page.height);
    }
    setMultiPageEnabled(false);
  };

  if (multiPageEnabled) {
    return (
      <PagesProvider
        options={{
          maxPages: MAX_PAGES,
          preset: "default",
          captureSnapshot: captureSnapshotExcludingBoundary,
          templates: {
            "business-card-front": BUSINESS_CARD_FRONT,
            "business-card-back": BUSINESS_CARD_BACK,
          },
          plugins: { add: sharedEditorPlugins },
        }}
      >
        <MultiPageWorkspace onDisableMultiPage={handleDisableMultiPage} pendingSeedRef={pendingSeedRef} />
      </PagesProvider>
    );
  }

  return <SingleDocumentWorkspace onEnableMultiPage={handleEnableMultiPage} pendingRestoreRef={pendingRestoreRef} />;
}

// <DesignEditor> only renders 3 named slots, not arbitrary children, so the app chrome is built
// outside it and given engine access by re-providing EditorContext here.
//
// Remounts via key={activeTemplate.id} on template switch — a new template is a different
// starter document, not a resize, so it needs a clean engine + fresh history. Also remounts
// wholesale whenever EngineHost toggles back from multi-page (see EngineHost's own comment on
// why that's deliberate) — readyState/isInitialLoadRef naturally reset fresh each time as a
// result, which is exactly what's wanted: !pendingRestore already guards the one case (an
// autosave-restore firing instead of a collapse-restore) where a fresh isInitialLoadRef could
// otherwise do the wrong thing.
//
// The canvas element's size tracks the workspace viewport (useContainerSize()), not the
// template — the template's dimensions instead size a page-boundary rect (createPageBoundaryRect)
// so the page can pan/zoom within a fixed-size viewport. No backgroundColor is passed to <Editor>
// for the same reason: the page background lives on that rect too.
function SingleDocumentWorkspace({
  onEnableMultiPage,
  pendingRestoreRef,
}: {
  onEnableMultiPage: (seed: PendingSeed) => void;
  pendingRestoreRef: React.RefObject<DocumentSnapshotData | null>;
}): ReactElement {
  const { activeTemplate } = useTemplateContext();
  const { resolvedTheme } = useThemeContext();
  const [readyState, setReadyState] = useState<ReadyState | null>(null);
  const containerSize = useContainerSize(CANVAS_CONTAINER_SELECTOR);
  const viewportSize = containerSize ?? FALLBACK_VIEWPORT_SIZE;

  // Distinguishes "just loaded" from "template switched"; only flipped once handleReady finishes
  // on a still-live engine, so a superseded call can't burn the one shot at restoring.
  const isInitialLoadRef = useRef(true);

  // Kept in sync every render so captureMeta (below) reads the current template/size when a
  // debounced autosave fires, not whatever it was when the plugin was constructed.
  const activeTemplateRef = useRef(activeTemplate);
  activeTemplateRef.current = activeTemplate;

  const plugins = useMemo<PluginOverrides>(() => ({ add: sharedEditorPlugins }), []);

  // Passed to <DesignEditor autosave> below. captureMeta reads activeTemplateRef.current (not
  // activeTemplate directly) so a debounced autosave firing after a template switch still
  // captures the *current* template, not whatever it was when this was constructed — same
  // reasoning as the ref itself, just now feeding a prop instead of a directly-constructed plugin.
  const autosaveOptions = useMemo(
    () => ({
      captureSnapshot: captureSnapshotExcludingBoundary,
      captureMeta: (): StarterDesignMeta => ({
        templateId: activeTemplateRef.current.id,
        width: activeTemplateRef.current.width,
        height: activeTemplateRef.current.height,
      }),
    }),
    [],
  );

  // Derived at render time rather than reset in an effect, so it evaluates to null for every
  // consumer the instant activeTemplate changes, without depending on effect-ordering against <Editor>.
  const engine = readyState?.templateId === activeTemplate.id ? readyState.engine : null;

  const handleReady = async (nextEngine: CanvasEngine): Promise<void> => {
    // Snapping starts disabled (preset="default" sets snapping.enabled: false) — SnapEngine's
    // O(objects) per-frame search made moving objects feel like guides were "forcing" alignment;
    // still toggleable via the status bar.

    // Not cleared here yet — only once this exact engine is confirmed to have survived (below),
    // mirroring isInitialLoadRef's own established pattern. Clearing it unconditionally at the
    // top would lose the pending restore for good if this call turns out to be a StrictMode
    // phantom whose engine gets torn down mid-await: the *next* (real) call would then see it
    // already cleared and silently fall through to a blank/template-default document instead.
    const pendingRestore = pendingRestoreRef.current;

    // Restoring a save only makes sense on the session's first load, not every template switch —
    // that would silently override the template the user just picked with whatever was last autosaved.
    // A collapse-restore (turning multi-page back off) takes priority over both.
    const savedDesign = !pendingRestore && isInitialLoadRef.current ? loadDesignFromStorage<StarterDesignMeta>() : null;

    try {
      if (pendingRestore) {
        await restoreSnapshot(nextEngine, pendingRestore);
      } else if (savedDesign) {
        // restoreSnapshot -> engine.importFile("json", ...) depends on importJsonPlugin being
        // installed (see the `plugins` prop passed to <DesignEditor> below).
        await restoreSnapshot(nextEngine, savedDesign.snapshot);
      } else {
        for (const spec of activeTemplate.objects ?? []) {
          const object = await nextEngine.addObjectOfType(spec.typeId, spec.config);
          if (spec.text !== undefined) {
            nextEngine.setObjectProperty(object, "text", spec.text);
          }
        }
      }
    } catch (error) {
      // handleReady awaits, so <Editor> can tear this exact engine down mid-flight (React 19
      // StrictMode's double-invocation, or a fast template switch) — isDestroyed() distinguishes
      // a real error from one caused by the teardown itself.
      if (nextEngine.isDestroyed()) return;
      throw error;
    }
    if (nextEngine.isDestroyed()) return;
    isInitialLoadRef.current = false;
    pendingRestoreRef.current = null;

    // Added via engine.renderer.addNode() (not engine.addObject()) so the page-boundary rect is
    // never history-tracked/undoable/deletable — addNode is the same raw, non-history-tracked
    // scene mutation canvas.add() always was. Added after content since restoreSnapshot()
    // replaces the whole canvas; sendToBack() restores the "always at the back" invariant.
    const boundaryRect = createPageBoundaryRect(activeTemplate);
    nextEngine.renderer.addNode(boundaryRect);
    nextEngine.layers.sendToBack(boundaryRect);

    // addObjectOfType is history-tracked, so starter content would otherwise be undoable away —
    // history.clear() prevents that (a no-op when restoreSnapshot already cleared it).
    // HistoryManager.clear() doesn't notify the store, so canUndo/canRedo are resynced by hand.
    nextEngine.history.clear();
    nextEngine.store.setState({ canUndo: nextEngine.history.canUndo(), canRedo: nextEngine.history.canRedo() });
    centerContent(nextEngine, activeTemplate.width, activeTemplate.height, CANVAS_CONTAINER_SELECTOR);
    setReadyState({ templateId: activeTemplate.id, engine: nextEngine });
    logUiEvent(
      pendingRestore ? "Restored single document" : savedDesign ? "Restored saved design" : `Loaded template: ${activeTemplate.label}`,
    );
  };

  const handleEnableMultiPageClick = (): void => {
    if (!engine) return;
    onEnableMultiPage({
      snapshot: captureSnapshotExcludingBoundary(engine),
      name: activeTemplate.label,
      width: activeTemplate.width,
      height: activeTemplate.height,
    });
  };

  return (
    <EditorContext.Provider value={engine}>
      <AppShell
        mode="workspace"
        onEnableMultiPage={handleEnableMultiPageClick}
        documentLabel={`${activeTemplate.label} · ${activeTemplate.width} × ${activeTemplate.height}px`}
        documentSize={{ width: activeTemplate.width, height: activeTemplate.height }}
        containerSelector={CANVAS_CONTAINER_SELECTOR}
        editor={
          <DesignEditor
            key={activeTemplate.id}
            preset="default"
            plugins={plugins}
            autosave={autosaveOptions}
            theme={resolvedTheme}
            width={viewportSize.width}
            height={viewportSize.height}
            className="relative"
            ariaLabel={`${activeTemplate.label} canvas`}
            slots={{ "toolbar-start": SelectionQuickActions, "sidebar-right": () => null, "tool-rail": () => null }}
            onReady={(next) => void handleReady(next)}
          />
        }
      />
    </EditorContext.Provider>
  );
}

function MultiPageWorkspace({
  onDisableMultiPage,
  pendingSeedRef,
}: {
  onDisableMultiPage: (doc: PagesCollapseResult) => void;
  pendingSeedRef: React.RefObject<PendingSeed | null>;
}): ReactElement {
  const { pages, activePageId, manager } = usePagesContext();
  const seededRef = useRef(false);

  // PagesManager starts with zero pages by design (see PagesManagerOptions) — on first mount,
  // seed from whatever the single document held at the moment multi-page was enabled
  // (handleEnableMultiPage), or start blank if this is somehow reached without that (defensive
  // only; the toggle button is the sole path here today).
  useEffect(() => {
    if (seededRef.current || pages.length > 0) return;
    seededRef.current = true;
    const pending = pendingSeedRef.current;
    pendingSeedRef.current = null;
    const page = pending
      ? manager.seedFromDocument(pending.snapshot, { name: pending.name, width: pending.width, height: pending.height })
      : manager.addPage({ name: "Page 1" });
    void manager.setActivePage(page.id);
  }, [pages.length, manager, pendingSeedRef]);

  const activePage = pages.find((page) => page.id === activePageId) ?? null;

  return (
    <AppShell
      mode="pages"
      onDisableMultiPage={onDisableMultiPage}
      tabsBar={<PagesToolbar />}
      canvasArea={<PageCanvasHost />}
      documentSize={activePage ? { width: activePage.width, height: activePage.height } : null}
      containerSelector={PAGES_CANVAS_CONTAINER_SELECTOR}
    />
  );
}
