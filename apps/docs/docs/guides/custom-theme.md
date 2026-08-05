---
sidebar_position: 2
title: Custom Theme
---

# Custom Theme

`@rifrocket/fdt-theme` ships plain CSS custom properties — no JS runtime, no CSS-in-JS. Components consume `var(--fdt-*)` tokens; you override them with ordinary CSS.

## The token list

```css
[data-fdt-theme="light"] {
  --fdt-bg: #ffffff;
  --fdt-bg-elevated: #f9fafb;
  --fdt-fg: #111827;
  --fdt-fg-muted: #6b7280;
  --fdt-border: #e5e7eb;
  --fdt-accent: #3b82f6;
  --fdt-accent-hover: #2563eb;
  --fdt-danger: #ef4444;
}

[data-fdt-theme="dark"] {
  --fdt-bg: #1a1a1a;
  --fdt-bg-elevated: #262626;
  --fdt-fg: #eeeeee;
  --fdt-fg-muted: #a1a1aa;
  --fdt-border: #3f3f46;
  --fdt-accent: #60a5fa;
  --fdt-accent-hover: #93c5fd;
  --fdt-danger: #f87171;
}
```

Selectors are plain **attribute** selectors (`[data-fdt-theme="light"]`), not `:root`-scoped — `:root` only ever matches `<html>`, but `<Editor>` sets `data-fdt-theme` on its own root `<div>` (a descendant), so a `:root`-scoped selector would never match it. Scoping to the attribute alone means the tokens apply regardless of which element in the tree carries it.

## How the attribute gets set

`<Editor theme="light" | "dark" | "system">` sets `data-fdt-theme` on its own root element automatically:

```tsx
<Editor theme="dark" />           // data-fdt-theme="dark"
<Editor theme="system" />         // resolved via prefers-color-scheme at render time
```

Framework-agnostic (`createEngine()`) consumers set the attribute themselves on whichever element wraps the canvas:

```html
<div data-fdt-theme="dark">
  <canvas id="editor"></canvas>
</div>
```

## Overriding tokens

Because these are ordinary CSS custom properties, override them with normal CSS specificity — no build-time theming API to learn:

```css
[data-fdt-theme="light"] {
  --fdt-accent: #7c3aed; /* swap the accent color, keep everything else */
}
```

Or scope an override to a specific subtree if you only want it inside your own app shell, not globally:

```css
.my-app-shell[data-fdt-theme="light"] {
  --fdt-bg: #fafafa;
}
```

## Adding a third theme (e.g. high-contrast)

The token model is additive — a third `[data-fdt-theme="high-contrast"]` block with its own values works the same way as `light`/`dark`, as long as whatever sets `data-fdt-theme` on the root element knows about the new value. `<Editor theme>`'s type is currently `"light" | "dark" | "system"`, so a custom third theme today means setting `data-fdt-theme` yourself (bypassing `<Editor theme>`) on a wrapping element, the same way a framework-agnostic consumer would.

## Component override surface beyond tokens

Tokens cover color. `<Editor className="...">` accepts a class name on its own root element for structural overrides at the editor-widget level. For overriding an individual panel's markup rather than just its styling, replace it outright via the [panel-slot system](/docs/extension-points/custom-panels) (`<Editor slots={{ "sidebar-right": MyPanel }}>`) instead of trying to style around the built-in one.
