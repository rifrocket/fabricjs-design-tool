---
sidebar_position: 5
title: The React Adapter
---

# The React Adapter

`@rifrocket/fdt-react` is intentionally thin. `<Editor>` doesn't add any capability `@rifrocket/fabricjs-design-tool` doesn't already have — it wires `createEngine()` into React's lifecycle, provides the resulting `CanvasEngine` through context, and renders four named panel slots.

## What `<Editor>` actually does

```tsx
export function Editor(props: EditorProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { engine } = useCanvasEngine(canvasRef, { plugins, width, height, backgroundColor, snapping, onReady });

  return (
    <div data-fdt-theme={resolveTheme(theme)} role="application">
      <canvas ref={canvasRef} />
      {engine && (
        <EditorContext.Provider value={engine}>
          <PanelSlot name="toolbar-start" override={slots["toolbar-start"]} />
          <PanelSlot name="tool-rail" override={slots["tool-rail"]} />
          <PanelSlot name="sidebar-right" override={slots["sidebar-right"]} />
          <PanelSlot name="properties-footer" override={slots["properties-footer"]} />
        </EditorContext.Provider>
      )}
    </div>
  );
}
```

`useCanvasEngine()` — the hook `<Editor>` itself is built on — constructs a `CanvasEngine` in a mount effect against a `<canvas>` ref, installs the given `plugins` via `engine.useAll()`, and tears it down (`engine.destroy()`) on unmount. It's exported directly, because it's the headless building block for going beyond `<Editor>`'s fixed layout.

## The construction-time-only contract

`plugins`, `snapping` (on `<Editor>`), and `preset`/`plugins` (on `<DesignEditor>`) are all read **once**, at construction — changing them on an already-mounted component does nothing until it remounts. There is no safe general story for hot-swapping an installed plugin set: uninstalling a plugin correctly would need to know what state it's holding and how to unwind registry entries other plugins may have since depended on, which `engine.unuse()` doesn't fully solve today (see [FAQ](/docs/faq)). To change plugins, remount with a different `key`:

```tsx
<Editor key={documentId} plugins={pluginsForDocument(documentId)} />
```

This is a deliberate, documented limitation, not an oversight — treat any prop described as "construction-time only" the same way you'd treat a React `key` prop conceptually: it selects *which instance* gets built, not a value that reactively updates an existing one.

## Building a custom shell: `EditorContext` re-provision

`<Editor>`/`<DesignEditor>` only render 4 fixed panel slots inside their own wrapping `<div>`. That's enough for a self-contained editor widget, but not a real application shell — a header, multiple sidebars, a status bar, or floating panels laid out around the canvas rather than inside `<Editor>`'s own markup.

For that, drop to `useCanvasEngine()` directly and **re-provide `EditorContext`** around your own layout — this is the exact pattern `<Editor>` uses internally, exposed as a first-class, fully-supported option:

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

Once `EditorContext` is provided, every hook and panel component in `@rifrocket/fdt-react` (`useEditor`, `useEditorState`, `PropertiesPanel`, `LayersPanel`, ...) works anywhere under `<CustomShell>` — not just inside `<Editor>`'s own tree. `engine` is `null` until the mount effect that constructs it has run, so guard any render that needs it; components calling `useEditor()` throw if rendered before the engine exists in context.

See [Building a Custom Shell](/docs/guides/custom-shell-with-editorcontext) for a fuller worked example.

## The `onReady` async-teardown race

`onReady` fires once, synchronously, right after the engine is constructed. If your handler does anything asynchronous (loading starter content, restoring a saved document) before touching the engine again, check `engine.isDestroyed()` right after each `await` and bail out if it's true:

```tsx
<Editor
  onReady={async (engine) => {
    const saved = await loadSavedDocument();
    if (engine.isDestroyed()) return; // the component may have unmounted/remounted while we awaited
    await engine.importFile("json", saved);
  }}
/>
```

`<Editor>` can tear this engine down — on unmount, on remounting via a changed `key`, or under React 19 StrictMode's dev-only double-invocation of effects (which mounts, tears down, and remounts synchronously specifically to surface bugs like this one) — while your handler is still mid-flight. Continuing to call engine methods on a destroyed engine throws, because the underlying Fabric canvas has been disposed.
