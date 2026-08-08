import { useEffect, useMemo, useRef } from "react";
import type { ComponentType, ReactElement } from "react";
import type { CanvasEngine, PluginOverrides, PresetShortcutsConfig } from "@rifrocket/fabricjs-design-tool";
import {
  PanelSlot,
  mergeShortcuts,
  resolveDesignPreset,
  resolveTheme,
  setupDefaultShortcuts,
  useKeyboardShortcuts,
} from "@rifrocket/fdt-react";
import type { DesignEditorPreset, EditorTheme, PanelSlotName } from "@rifrocket/fdt-react";
import type { PagesManagerOptions } from "../types";
import type { EngineFactory } from "../PagesManager";
import { PagesCanvas } from "./PagesCanvas";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { PageTabsBar } from "./PageTabsBar";

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

  const options = useMemo(
    () => ({ maxPages, preset, plugins, engineOptions, templates, canvasElementFactory, thumbnails }),
    // Constructed once for PagesProvider's lifetime, matching <DesignEditor>'s own
    // construction-time-only contract for plugins/preset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <PagesProvider options={options} engineFactory={engineFactory}>
      <MultiPageChrome
        theme={resolvedTheme}
        shortcuts={resolvedShortcuts}
        slots={slots}
        tabsBar={tabsBar}
        className={className}
        ariaLabel={ariaLabel}
        onReady={onReady}
      />
    </PagesProvider>
  );
}

interface MultiPageChromeProps {
  theme: "light" | "dark";
  shortcuts: PresetShortcutsConfig | undefined;
  slots: Partial<Record<PanelSlotName, ComponentType>>;
  tabsBar: ComponentType | null | undefined;
  className: string | undefined;
  ariaLabel: string;
  onReady: ((engine: CanvasEngine, pageId: string) => void) | undefined;
}

function MultiPageChrome({ theme, shortcuts, slots, tabsBar, className, ariaLabel, onReady }: MultiPageChromeProps): ReactElement {
  const { pages, activePageId, activeEngine, manager } = usePagesContext();
  const seededRef = useRef(false);
  const TabsBar = tabsBar === undefined ? PageTabsBar : tabsBar;

  // PagesManager starts with zero pages by design (PagesManagerOptions has no seed-count
  // option) — a batteries-included component seeds page 1 itself, matching apps/demo's own
  // MultiPageExample.tsx first-run convenience before this component existed.
  useEffect(() => {
    if (seededRef.current || pages.length > 0) return;
    seededRef.current = true;
    const page = manager.addPage();
    void manager.setActivePage(page.id);
  }, [pages.length, manager]);

  // Real, independently-found gap this component fixes: PagesManager/usePages/PagesProvider/
  // PagesCanvas never call setupDefaultShortcuts anywhere — multi-page mode has had zero
  // keyboard shortcuts (no undo/redo/delete) until now. Re-wired on every page switch since
  // shortcuts must target whichever engine is currently active.
  useEffect(() => {
    if (!activeEngine) return;
    const unregisterDefaults = setupDefaultShortcuts(activeEngine, shortcuts?.disable);
    const unregisterAdded = Object.entries(shortcuts?.add ?? {}).map(([combo, { handler, description }]) =>
      activeEngine.shortcuts.register(combo, () => handler(activeEngine), description),
    );
    return () => {
      unregisterDefaults();
      unregisterAdded.forEach((unregister) => unregister());
    };
  }, [activeEngine, shortcuts]);

  useKeyboardShortcuts(activeEngine?.shortcuts ?? null);

  useEffect(() => {
    if (activeEngine && activePageId) onReady?.(activeEngine, activePageId);
  }, [activeEngine, activePageId, onReady]);

  return (
    <div className={className} data-fdt-theme={theme} role="application" aria-label={ariaLabel}>
      <PagesCanvas />
      {/* EditorContext is already provided by PagesProvider (value={activeEngine}) — gating on
          activeEngine here matches <Editor>'s own "only render panel slots once there's a live
          engine" behavior, since PanelSlot's useEditor() throws on a null context value. */}
      {activeEngine && (
        <>
          <PanelSlot name="toolbar-start" override={slots["toolbar-start"]} />
          <PanelSlot name="sidebar-right" override={slots["sidebar-right"]} />
          <PanelSlot name="properties-footer" override={slots["properties-footer"]} />
        </>
      )}
      {TabsBar && <TabsBar />}
    </div>
  );
}
