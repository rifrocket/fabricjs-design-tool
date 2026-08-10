# @rifrocket/fdt-react

React adapter for `@rifrocket/fabricjs-design-tool` — `<Editor>`, `<DesignEditor>`, `useEditor`, `useEditorState`, and the slot-based component system.

**Status:** scaffold only, not published.

`react` and `react-dom` are peer dependencies; `@rifrocket/fabricjs-design-tool` (plus the plugin packages `<DesignEditor>`'s built-in presets bundle — see `src/preset/builtinPresets.ts`) are workspace dependencies.

## Quick start

```tsx
import { DesignEditor } from "@rifrocket/fdt-react";

<DesignEditor preset="default" width={800} height={600} onReady={(engine) => console.log(engine)} />;
```

`preset="default"` installs the built-in, dependency-light plugins (shapes, clipboard, svg-import, image, effects, export-pdf, qrcode). `preset="minimal"` drops qrcode/export-pdf/svg-import. `preset="none"` (or omitting `preset`) installs nothing — equivalent to `<Editor>` with no plugins. Override per-field:

> **Vocabulary note:** an "editor preset" (this page) is a bundle of plugins/UI for the editor itself — unrelated to a "document template" (e.g. `apps/demo`'s business-card/flyer/poster starting points). A consuming app can have both at once; keep the two terms separate in your own code and docs.

```tsx
<DesignEditor
  preset="default"
  plugins={{ exclude: ["qrcode"], add: [alignmentPlugin] }}
  propertyFields={{ text: [...DEFAULT_TEXT_FIELDS, myBrandField] }}
  autosave={{ key: "my-app:design" }}
/>
```

**`preset`/`plugins` are construction-time only** — same contract as `<Editor plugins>` below: changing them on an already-mounted `<DesignEditor>` does nothing until it remounts (e.g. via a changing `key={documentId}`). There's no safe general story for hot-swapping an installed plugin set (uninstall ordering, plugin-held state), so this is a deliberate limitation, not a bug.

Not bundled into either built-in preset: `@rifrocket/fdt-plugin-alignment`, `-snapping`, `-devtools`, `-import-json`, and `-effects-panel`. Each of those depends on `@rifrocket/fdt-react` itself (they render panel components via `useEditor()`), so this package bundling them back would be a circular package dependency. Add them the same way you'd add any third-party plugin:

```tsx
import { alignmentPlugin } from "@rifrocket/fdt-plugin-alignment";
import { devtoolsPlugin } from "@rifrocket/fdt-plugin-devtools";

<DesignEditor preset="default" plugins={{ add: [alignmentPlugin, ...(import.meta.env.DEV ? [devtoolsPlugin] : [])] }} />;
```

For everything below "one preset, minor overrides" — a from-scratch plugin list, no preset machinery at all — use `<Editor plugins={[...]}>` directly, or `@rifrocket/fabricjs-design-tool`'s `createEditor()`/`createEngine()` outside React entirely.

## Building a custom application shell

`<Editor>`/`<DesignEditor>` only render 4 fixed panel slots (`toolbar-start`, `tool-rail`, `sidebar-right`, `properties-footer`) inside their own wrapping `<div>`. That covers a self-contained editor widget, but not a real application shell — a header, multiple sidebars, a status bar, floating panels, or anything else laid out around the canvas rather than inside `<Editor>`'s own markup.

For that, drop down to `useCanvasEngine()` — the same headless hook `<Editor>` is built on — and **re-provide `EditorContext`** around your own layout. This is the one, fully-supported pattern for going beyond the 4 slots; it's not a workaround.

```tsx
import { useRef } from "react";
import { EditorContext, useCanvasEngine, PropertiesPanel, LayersPanel } from "@rifrocket/fdt-react";
import { myPlugins } from "./plugins";

function CustomShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { engine } = useCanvasEngine(canvasRef, { plugins: myPlugins, width: 1024, height: 768 });

  return (
    <EditorContext.Provider value={engine}>
      <div className="app-shell">
        <AppHeader />
        <div className="app-body">
          <LeftToolbar />
          <canvas ref={canvasRef} />
          <aside className="right-sidebar">
            <LayersPanel />
            <PropertiesPanel />
          </aside>
        </div>
        <StatusBar />
      </div>
    </EditorContext.Provider>
  );
}
```

Once `EditorContext` is provided, every hook and panel component in this package (`useEditor`, `useEditorState`, `PropertiesPanel`, `LayersPanel`, `Ruler`, ...) works anywhere under `<CustomShell>` — not just inside `<Editor>`'s own tree. `engine` is `null` until the mount effect that constructs it has run; guard render of anything that needs it (as the example above implicitly does by only reaching child components once `engine` exists via context — components that call `useEditor()` throw if rendered before that).

`plugins` here is **construction-time only**, exactly like `<Editor plugins>`/`<DesignEditor preset>` — see `useCanvasEngine`'s own doc comment.
