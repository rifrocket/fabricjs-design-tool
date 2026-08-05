import { useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { DesignEditor, EditorContext } from "@rifrocket/fdt-react";
import type { CanvasEngine, PluginOverrides } from "@rifrocket/fabricjs-design-tool";
import { restoreSnapshot } from "@rifrocket/fabricjs-design-tool";
import { useContainerSize, centerContent } from "@rifrocket/fdt-plugin-pan-zoom";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { localStoragePlugin, loadDesignFromStorage } from "@rifrocket/fdt-plugin-local-storage";
import { stampToolPlugin } from "../plugins/stampToolPlugin";
import { useTemplateContext } from "../templates/TemplateContext";
import { useThemeContext } from "../theme/ThemeContext";
import { AppShell } from "../shell/AppShell";
import { SelectionQuickActions } from "../features/selection/SelectionQuickActions";
import { logUiEvent } from "../dev-tools/uiEventLog";
import { createPageBoundaryRect, captureDesignSnapshot } from "../features/viewport/pageViewport";
import { CANVAS_CONTAINER_SELECTOR } from "../features/viewport/canvasContainerSelector";
import type { PageMeta } from "../templates/types";

interface ReadyState {
  templateId: string;
  engine: CanvasEngine;
}

// Used only until useContainerSize()'s ResizeObserver reports the workspace container's real
// size on first mount.
const FALLBACK_VIEWPORT_SIZE = { width: 800, height: 600 };

// <DesignEditor> only renders 3 named slots, not arbitrary children, so the app chrome is built
// outside it and given engine access by re-providing EditorContext here.
//
// Remounts via key={activeTemplate.id} on template switch — a new template is a different
// starter document, not a resize, so it needs a clean engine + fresh history.
//
// The canvas element's size tracks the workspace viewport (useContainerSize()), not the
// template — the template's dimensions instead size a page-boundary rect (createPageBoundaryRect,
// pageViewport.ts) so the page can pan/zoom within a fixed-size viewport. No backgroundColor is
// passed to <Editor> for the same reason: the page background lives on that rect too.
export function EngineHost(): ReactElement {
  const { activeTemplate } = useTemplateContext();
  const { resolvedTheme } = useThemeContext();
  const [readyState, setReadyState] = useState<ReadyState | null>(null);
  const containerSize = useContainerSize(CANVAS_CONTAINER_SELECTOR);
  const viewportSize = containerSize ?? FALLBACK_VIEWPORT_SIZE;

  // EngineHost mounts once per session (unlike <Editor>, which remounts per template), so this
  // ref distinguishes "just loaded" from "template switched"; only flipped once handleReady
  // finishes on a still-live engine, so a superseded call can't burn the one shot at restoring.
  const isInitialLoadRef = useRef(true);

  // Kept in sync every render so captureMeta (below) reads the current template/size when a
  // debounced autosave fires, not whatever it was when the plugin was constructed.
  const activeTemplateRef = useRef(activeTemplate);
  activeTemplateRef.current = activeTemplate;

  // preset="default" already installs shapes/clipboard/svg-import/image/effects/export-pdf/qrcode;
  // this `add` override adds only what it doesn't bundle. Memoized since <DesignEditor> only
  // reads `plugins` at construction, not on every render.
  const plugins = useMemo<PluginOverrides>(
    () => ({
      add: [
        importJsonPlugin,
        stampToolPlugin,
        localStoragePlugin<PageMeta>({
          captureSnapshot: captureDesignSnapshot,
          captureMeta: () => ({
            templateId: activeTemplateRef.current.id,
            width: activeTemplateRef.current.width,
            height: activeTemplateRef.current.height,
          }),
        }),
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Derived at render time rather than reset in an effect, so it evaluates to null for every
  // consumer the instant activeTemplate changes, without depending on effect-ordering against <Editor>.
  const engine = readyState?.templateId === activeTemplate.id ? readyState.engine : null;

  const handleReady = async (nextEngine: CanvasEngine): Promise<void> => {
    // Snapping starts disabled (preset="default" sets snapping.enabled: false) — SnapEngine's
    // O(objects) per-frame search made moving objects feel like guides were "forcing" alignment;
    // still toggleable via the status bar.

    // Restoring a save only makes sense on the session's first load, not every template switch —
    // that would silently override the template the user just picked with whatever was last autosaved.
    const savedDesign = isInitialLoadRef.current ? loadDesignFromStorage<PageMeta>() : null;

    try {
      if (savedDesign) {
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

    // Added via canvas.add() (not engine.addObject()) so the page-boundary rect is never
    // history-tracked/undoable/deletable. Added after content since restoreSnapshot() replaces
    // the whole canvas; sendToBack() restores the "always at the back" invariant.
    const boundaryRect = createPageBoundaryRect(activeTemplate);
    nextEngine.getFabricCanvas().add(boundaryRect);
    nextEngine.layers.sendToBack(boundaryRect);

    // addObjectOfType is history-tracked, so starter content would otherwise be undoable away —
    // history.clear() prevents that (a no-op when restoreSnapshot already cleared it).
    // HistoryManager.clear() doesn't notify the store, so canUndo/canRedo are resynced by hand.
    nextEngine.history.clear();
    nextEngine.store.setState({ canUndo: nextEngine.history.canUndo(), canRedo: nextEngine.history.canRedo() });
    centerContent(nextEngine, activeTemplate.width, activeTemplate.height, CANVAS_CONTAINER_SELECTOR);
    setReadyState({ templateId: activeTemplate.id, engine: nextEngine });
    logUiEvent(savedDesign ? "Restored saved design" : `Loaded template: ${activeTemplate.label}`);
  };

  return (
    <EditorContext.Provider value={engine}>
      <AppShell
        editor={
          <DesignEditor
            key={activeTemplate.id}
            preset="default"
            plugins={plugins}
            theme={resolvedTheme}
            width={viewportSize.width}
            height={viewportSize.height}
            className="relative"
            ariaLabel={`${activeTemplate.label} canvas`}
            slots={{ "toolbar-start": SelectionQuickActions }}
            onReady={(next) => void handleReady(next)}
          />
        }
      />
    </EditorContext.Provider>
  );
}
