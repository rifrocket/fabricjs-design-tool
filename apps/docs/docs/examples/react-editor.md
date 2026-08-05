---
sidebar_position: 2
title: "<Editor>"
---

# `<Editor>` Example

:::info Coming soon
Live, embedded, interactive examples are planned for a later phase of this documentation site. For now, see the [Quick Start](/docs/getting-started/quick-start), whose code sample is pulled directly from a CI-typechecked source file.
:::

```tsx
import { Editor, useEditor } from "@rifrocket/fdt-react";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

function App() {
  return <Editor plugins={[shapesBasicPlugin]} theme="dark" width={800} height={600} />;
}
```
