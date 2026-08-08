import { useEffect, useMemo, useRef } from "react";
import type { ComponentType, ReactElement } from "react";
import { resolvePropertyFields } from "@rifrocket/fabricjs-design-tool";
import type {
  CanvasEngine,
  DocumentSnapshotData,
  PluginOverrides,
  PresetShortcutsConfig,
  PropertyFieldDefinition,
} from "@rifrocket/fabricjs-design-tool";
import { PanelSlot, mergeShortcuts, resolveDesignPreset, resolveTheme } from "@rifrocket/fdt-react";
import type { DesignEditorPreset, EditorTheme, PanelSlotName } from "@rifrocket/fdt-react";
import type { NewPageInit, PagesManagerOptions } from "../types";
import type { EngineFactory, PagesManager } from "../PagesManager";
import { savePagesToStorage, loadPagesFromStorage } from "../persistence";
import type { StorageLike } from "../persistence";
import { PagesCanvas } from "./PagesCanvas";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { PageTabsBar } from "./PageTabsBar";

const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 500;

export interface MultiPageAutosaveOptions {
  key?: string;
  debounceMs?: number;
  storage?: StorageLike;
}

export interface MultiPageDesignEditorProps
  extends Pick<PagesManagerOptions, "maxPages" | "engineOptions" | "templates" | "canvasElementFactory" | "thumbnails"> {
  /** Same escape hatch as <PagesProvider engineFactory> — non-browser hosts/tests only; leave unset in real usage. */
  engineFactory?: EngineFactory;
  /**
   * Same preset union <DesignEditor> accepts — "default"/"minimal" resolve to the same plugin
   * bundles, applied identically to every page's own CanvasEngine (see plugin-pages' own
   * per-page-engine model). Construction-time only: changing this on a live component does
   * nothing until a `key`-driven remount, same contract as <DesignEditor preset>.
   */
  preset?: DesignEditorPreset | "default" | "minimal" | "none";
  plugins?: PluginOverrides;
  theme?: EditorTheme;
  /** Merged with the preset's own `shortcuts`, same semantics as <DesignEditor shortcuts>. */
  shortcuts?: PresetShortcutsConfig;
  slots?: Partial<Record<PanelSlotName, ComponentType>>;
  /** Rendered below the canvas. Defaults to the built-in PageTabsBar; pass `null` to hide it. */
  tabsBar?: ComponentType | null;
  className?: string;
  ariaLabel?: string;
  /**
   * Adopts an existing document as page 1 instead of the default blank auto-seed — the
   * supported migration path for "my existing single-CanvasEngine app now needs multiple
   * pages." Pass `captureSnapshot(existingEngine)` (from `@rifrocket/fabricjs-design-tool`) as
   * `snapshot`, plus optional page metadata (`name`/`width`/`height`/`backgroundColor`) —
   * typically the existing document's own dimensions, since `DocumentSnapshotData` itself
   * carries no size. Construction-time only, like `preset`/`plugins`: read once when page 1 is
   * seeded, not re-applied if this prop changes later.
   */
  initialDocument?: { snapshot: DocumentSnapshotData; meta?: NewPageInit };
  /**
   * `null` suppresses the preset's fields for that type entirely — same semantics as
   * `<DesignEditor propertyFields>`. Applied once per page's engine, the moment that page's
   * engine is created (not re-applied on every page switch, even though `onReady` itself fires
   * more than once — see `onReady`'s own doc below).
   */
  propertyFields?: Record<string, PropertyFieldDefinition[] | null>;
  /**
   * Sugar for `plugin-pages`' own persistence primitives (`capturePagesSnapshot`/
   * `savePagesToStorage`/`loadPagesFromStorage`) — NOT `@rifrocket/fdt-plugin-local-storage`,
   * which only ever handles one document. `true` uses this package's own storage defaults; pass
   * an options object for a custom key/debounce/storage. A prior save (if one exists) is
   * restored on first mount, taking priority over `initialDocument` — matching
   * `<DesignEditor autosave>`'s "restore wins over a freshly-provided starting document"
   * precedent. Saves are debounced per this option's own `debounceMs` (default 500ms),
   * independent of `thumbnails.debounceMs`.
   */
  autosave?: true | MultiPageAutosaveOptions;
  /**
   * Fires once construction seeds page 1, and again every time the active page changes — unlike
   * <DesignEditor onReady> (construction-time only), "the current engine" itself changes here as
   * pages switch, so this intentionally fires more than once.
   */
  onReady?: (engine: CanvasEngine, pageId: string) => void;
}

// The multi-page counterpart to <DesignEditor>: one line for a batteries-included editor backed
// by plugin-pages' N-CanvasEngine model instead of <Editor>'s single engine. Not a prop on
// <DesignEditor> itself — @rifrocket/fdt-react can't depend on @rifrocket/fdt-plugin-pages
// without a circular package dependency (plugin-pages' ./react subpath already depends on
// fdt-react for defaultPreset/minimalPreset and useEditor()-based UI), the same constraint
// documented in builtinPresets.ts for alignment/snapping/devtools/effects-panel.
//
// Deliberately has no pan/zoom or page-boundary-rect treatment, mirroring <Editor>'s own bare-
// canvas scope for the single-page case — apps needing that build their own chrome on
// usePagesContext()/PagesCanvas directly, the same way apps/demo's EngineHost.tsx builds its own
// chrome on useCanvasEngine() instead of using <DesignEditor>'s default layout.
export function MultiPageDesignEditor(props: MultiPageDesignEditorProps): ReactElement {
  const {
    preset: presetInput,
    plugins,
    theme,
    shortcuts,
    slots = {},
    tabsBar,
    className,
    ariaLabel = "Design canvas",
    maxPages,
    engineOptions,
    templates,
    canvasElementFactory,
    thumbnails,
    engineFactory,
    initialDocument,
    propertyFields: propertyFieldOverrides,
    autosave,
    onReady,
  } = props;

  // resolveDesignPreset/mergeShortcuts are reused (not reimplemented) from @rifrocket/fdt-react
  // so preset resolution is identical to <DesignEditor>'s. The resolved preset object is then
  // handed straight through to PagesProvider's own `options.preset`/`options.plugins` — plugin-pages'
  // PagesManager already resolves exclude/add/replace via the same core resolvePluginList() this
  // package can't call twice without duplicating logic, so no plugin-list resolution happens here.
  const preset = useMemo(() => resolveDesignPreset(presetInput), [presetInput]);
  const resolvedTheme = resolveTheme(theme ?? preset.react?.theme ?? "system");
  const resolvedShortcuts = useMemo(() => mergeShortcuts(preset.shortcuts, shortcuts), [preset, shortcuts]);
  const resolvedPropertyFields = useMemo(
    () => resolvePropertyFields(preset, propertyFieldOverrides),
    [preset, propertyFieldOverrides],
  );

  const autosaveOptions = useMemo<MultiPageAutosaveOptions | undefined>(
    () => (autosave ? (autosave === true ? {} : autosave) : undefined),
    // Construction-time only, like preset/plugins — read once via this same [] pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  // One shared debounce timer across every page — a burst of edits across multiple pages in
  // quick succession still results in one save, not one per page, matching
  // plugin-local-storage's single-timer autosave model.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const options = useMemo(
    () => ({
      maxPages,
      preset,
      plugins,
      engineOptions,
      templates,
      canvasElementFactory,
      thumbnails,
      onContentChange: autosaveOptions
        ? (_pageId: string, manager: PagesManager) => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
              savePagesToStorage(manager, autosaveOptions.key, autosaveOptions.storage);
            }, autosaveOptions.debounceMs ?? DEFAULT_AUTOSAVE_DEBOUNCE_MS);
          }
        : undefined,
    }),
    // Constructed once for PagesProvider's lifetime, matching <DesignEditor>'s own
    // construction-time-only contract for plugins/preset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // shortcuts isn't part of the frozen `options` memo above (unlike preset/plugins/maxPages/etc,
  // which are genuinely construction-time-only) — usePages() reads options.shortcuts live on
  // every render and re-applies it whenever the active engine changes, so a fresh object here
  // each render is intentional, not a memoization gap.
  return (
    <PagesProvider options={{ ...options, shortcuts: resolvedShortcuts }} engineFactory={engineFactory}>
      <MultiPageChrome
        theme={resolvedTheme}
        slots={slots}
        tabsBar={tabsBar}
        className={className}
        ariaLabel={ariaLabel}
        initialDocument={initialDocument}
        propertyFields={resolvedPropertyFields}
        autosaveOptions={autosaveOptions}
        onReady={onReady}
      />
    </PagesProvider>
  );
}

interface MultiPageChromeProps {
  theme: "light" | "dark";
  slots: Partial<Record<PanelSlotName, ComponentType>>;
  tabsBar: ComponentType | null | undefined;
  className: string | undefined;
  ariaLabel: string;
  initialDocument: { snapshot: DocumentSnapshotData; meta?: NewPageInit } | undefined;
  propertyFields: Record<string, PropertyFieldDefinition[]>;
  autosaveOptions: MultiPageAutosaveOptions | undefined;
  onReady: ((engine: CanvasEngine, pageId: string) => void) | undefined;
}

function MultiPageChrome({
  theme,
  slots,
  tabsBar,
  className,
  ariaLabel,
  initialDocument,
  propertyFields,
  autosaveOptions,
  onReady,
}: MultiPageChromeProps): ReactElement {
  const { pages, activePageId, activeEngine, manager } = usePagesContext();
  const seededRef = useRef(false);
  const TabsBar = tabsBar === undefined ? PageTabsBar : tabsBar;

  // PagesManager starts with zero pages by design (PagesManagerOptions has no seed-count
  // option) — a batteries-included component seeds page 1 itself, matching apps/demo's own
  // MultiPageExample.tsx first-run convenience before this component existed. A prior autosave
  // (if one exists) takes priority over `initialDocument`, matching <DesignEditor autosave>'s own
  // "restore wins over a freshly-provided starting document" precedent (EngineHost.tsx's
  // handleReady). Otherwise, `initialDocument` (read once, guarded by seededRef the same way
  // `preset`/`plugins` are construction-time-only) adopts an existing document via
  // seedFromDocument() instead of a blank addPage() — the supported single-page -> multi-page
  // migration path.
  useEffect(() => {
    if (seededRef.current || pages.length > 0) return;
    seededRef.current = true;

    const restored = autosaveOptions && loadPagesFromStorage(autosaveOptions.key, autosaveOptions.storage);
    if (restored) {
      manager.hydrate(restored);
      const firstPage = [...restored.pages].sort((a, b) => a.order - b.order)[0];
      if (firstPage) void manager.setActivePage(firstPage.id);
      return;
    }

    const page = initialDocument
      ? manager.seedFromDocument(initialDocument.snapshot, initialDocument.meta)
      : manager.addPage();
    void manager.setActivePage(page.id);
  }, [pages.length, manager, initialDocument, autosaveOptions]);

  // Default keyboard shortcuts (undo/redo/delete/deselect, plus this component's own `shortcuts`
  // prop) are wired by usePages() itself now, via the `shortcuts` field threaded into
  // PagesProvider's `options` above — shared with every other PagesProvider consumer instead of
  // being duplicated here.

  // Applied once per engine (guarded by this WeakSet, not re-applied on a revisit to an
  // already-created page) — registerPropertyFields() appends rather than replaces, so calling it
  // again on the same engine every time onReady re-fires on page-switch would duplicate every
  // field. <DesignEditor>'s equivalent only needs no such guard because its onReady is
  // construction-time-only; this component's fires per page-switch by design (see its own doc).
  const appliedPropertyFieldsRef = useRef(new WeakSet<CanvasEngine>());
  useEffect(() => {
    if (!activeEngine || !activePageId) return;
    if (!appliedPropertyFieldsRef.current.has(activeEngine)) {
      appliedPropertyFieldsRef.current.add(activeEngine);
      for (const [typeId, fields] of Object.entries(propertyFields)) {
        if (fields.length > 0 && activeEngine.registry.objectTypes.has(typeId)) {
          activeEngine.registry.registerPropertyFields(typeId, fields);
        }
      }
    }
    onReady?.(activeEngine, activePageId);
  }, [activeEngine, activePageId, propertyFields, onReady]);

  return (
    <div className={className} data-fdt-theme={theme} role="application" aria-label={ariaLabel}>
      <PagesCanvas />
      {/* EditorContext is already provided by PagesProvider (value={activeEngine}) — gating on
          activeEngine here matches <Editor>'s own "only render panel slots once there's a live
          engine" behavior, since PanelSlot's useEditor() throws on a null context value. */}
      {activeEngine && (
        <>
          <PanelSlot name="toolbar-start" override={slots["toolbar-start"]} />
          <PanelSlot name="tool-rail" override={slots["tool-rail"]} />
          <PanelSlot name="sidebar-right" override={slots["sidebar-right"]} />
          <PanelSlot name="properties-footer" override={slots["properties-footer"]} />
        </>
      )}
      {TabsBar && <TabsBar />}
    </div>
  );
}
