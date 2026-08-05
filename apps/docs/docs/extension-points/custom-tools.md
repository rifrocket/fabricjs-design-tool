---
sidebar_position: 2
title: Custom Tools
---

# Custom Tools

A **tool** is an interaction mode — select, pan, draw, crop — exactly one active at a time. `ToolRegistry` (`engine.registry.tools`) manages registration and the currently-active tool.

```ts
interface ToolDefinition {
  cursor?: string;
  icon?: unknown;
  shortcut?: string; // e.g. "v", auto-bindable to activate this tool
  onActivate?(context: { toolId: string }): void;
  onDeactivate?(context: { toolId: string }): void;
}
```

## Registering and activating a tool

```ts
engine.registry.registerTool("select", {
  cursor: "default",
  shortcut: "v",
});

engine.registry.registerTool("crop", {
  cursor: "crosshair",
  onActivate({ toolId }) {
    console.log(`${toolId} activated — start listening for crop-rectangle drags here`);
  },
  onDeactivate({ toolId }) {
    console.log(`${toolId} deactivated — clean up any crop-specific listeners here`);
  },
});

engine.registry.tools.activate("crop");
engine.registry.tools.getActiveToolId(); // "crop"
```

Activating a tool automatically calls the previously-active tool's `onDeactivate()` before the new tool's `onActivate()` — you don't need to track the previous tool yourself. Activating the already-active tool is a no-op (no redundant activate/deactivate cycle).

## What a tool doesn't do for you

`ToolRegistry` only tracks *which* tool is active and fires its lifecycle hooks — it doesn't bind any pointer/keyboard listeners on your behalf. A drawing or cropping tool's actual interaction logic (listening for `mouse:down`/`mouse:move` on the raw Fabric canvas via `engine.getFabricCanvas()`) lives inside your `onActivate`/`onDeactivate` handlers. This mirrors how `@rifrocket/fdt-plugin-pan-zoom` implements its own pan/zoom interaction layer directly against Fabric's canvas events rather than through a registered tool — see [that plugin's page](/docs/plugins/pan-zoom) for a real example of hand-binding canvas interaction.
