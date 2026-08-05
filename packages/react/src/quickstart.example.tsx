import type { ReactElement } from "react";
import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { Editor, useEditor } from "./index";

// Type-checked by the package's "typecheck" script on every build, so the documented Quick Start
// can never silently drift from the real public API — v1's README example didn't compile against
// real props. Not exported from index.ts, so it never reaches the published bundle.

const examplePlugin: EditorPlugin = {
  name: "example",
  install(engine) {
    engine.registry.registerTool("select", { shortcut: "v" });
  },
};

function QuickStartApp(): ReactElement {
  return (
    <Editor
      plugins={[examplePlugin]}
      theme="dark"
      width={800}
      height={600}
      onReady={(engine) => {
        engine.setZoom(1);
      }}
    />
  );
}

function AddRectangleButton(): ReactElement {
  const engine = useEditor();
  return (
    <button type="button" onClick={() => engine.addObjectOfType("rect", { left: 10, top: 10 })}>
      Add rectangle
    </button>
  );
}

export { QuickStartApp, AddRectangleButton };
