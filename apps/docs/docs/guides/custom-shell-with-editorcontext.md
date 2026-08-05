---
sidebar_position: 3
title: Building a Custom Shell with EditorContext
---

# Building a Custom Shell with EditorContext

`<Editor>`/`<DesignEditor>` render three fixed panel slots (`toolbar-start`, `sidebar-right`, `properties-footer`) inside their own wrapping `<div>`. That's a complete, self-contained editor widget — but it isn't a real application shell: a header, multiple independent sidebars, a status bar, or floating panels laid out around the canvas rather than inside `<Editor>`'s own markup.

For that, drop to `useCanvasEngine()` — the same headless hook `<Editor>` itself is built on — and **re-provide `EditorContext`** around your own layout. This is a fully-supported, first-class pattern, not a workaround.

## The full pattern

```tsx
import { useRef } from "react";
import {
  EditorContext,
  useCanvasEngine,
  useEditor,
  PropertiesPanel,
  LayersPanel,
} from "@rifrocket/fdt-react";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";
import { clipboardPlugin } from "@rifrocket/fdt-plugin-clipboard";

const plugins = [shapesBasicPlugin, clipboardPlugin];

function CustomShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { engine } = useCanvasEngine(canvasRef, { plugins, width: 1024, height: 768 });

  if (!engine) return null; // engine is null until the mount effect constructs it

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

function StatusBar() {
  const engine = useEditor(); // works anywhere under EditorContext.Provider, not just inside <Editor>
  return <footer>{engine.store.getState().objectIds.length} objects</footer>;
}
```

## Why this works

Once `EditorContext` is provided, every hook and panel component in `@rifrocket/fdt-react` (`useEditor`, `useEditorState`, `PropertiesPanel`, `LayersPanel`, `Ruler`, plugin panels like `AlignmentControls`) works anywhere under `<CustomShell>` — not just inside `<Editor>`'s own tree. Components calling `useEditor()` throw if rendered before the engine exists in context, so guard render of anything that needs it — the `if (!engine) return null;` above is doing exactly that.

## Combining with pan/zoom

`useCanvasEngine()` only constructs the engine; it doesn't add interaction chrome. Pair it with [`@rifrocket/fdt-plugin-pan-zoom`](/docs/plugins/pan-zoom)'s hooks for wheel-zoom and spacebar-drag-pan on your own fixed-size viewport container:

```tsx
import { useCanvasPanZoom, useContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";

function CustomShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerSize = useContainerSize(".canvas-viewport");
  const { engine } = useCanvasEngine(canvasRef, { plugins, ...containerSize });
  useCanvasPanZoom(engine, { containerSelector: ".canvas-viewport" });

  // ...
}
```

## Same construction-time-only rule applies

`plugins` passed to `useCanvasEngine()` is read once, at construction — exactly like `<Editor plugins>`/`<DesignEditor preset>`. To change the installed plugin set, remount (e.g. via a changing `key` on `<CustomShell>` or on whatever renders it) rather than mutating the array in place. See [Installing Plugins](/docs/plugins/installing-plugins) for the full explanation.
