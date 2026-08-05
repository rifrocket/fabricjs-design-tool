---
sidebar_position: 1
title: Vanilla JS
---

# Vanilla JS Example

:::info Coming soon
Live, embedded, interactive examples are planned for a later phase of this documentation site. For now, see [Choosing Your Entry Point](/docs/getting-started/choosing-your-entry-point) for a working `createEngine()` code sample, and [Installation](/docs/getting-started/installation) for the framework-agnostic install path.
:::

```ts
import { createEngine } from "@rifrocket/fabricjs-design-tool";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

const engine = createEngine(document.querySelector("canvas"), { width: 800, height: 600 });
engine.use(shapesBasicPlugin);
await engine.addObjectOfType("rect", { left: 10, top: 10, width: 100, height: 60 });
```
