import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import type { TPointerEventInfo, TPointerEvent } from "fabric";

const STAMP_SIZE = 40;
export const STAMP_TOOL_ID = "stamp";
export const SELECT_TOOL_ID = "select";

// Reference example for extending the editor with a *tool* (an interaction mode) from outside
// packages/*: onActivate wires raw Fabric events via the getFabricCanvas() escape hatch, onDeactivate
// tears them down. ToolRegistry.activate() deactivates whatever was active before automatically.
export const stampToolPlugin: EditorPlugin = {
  name: "demo-stamp-tool",
  install(engine) {
    const handleClick = (event: TPointerEventInfo<TPointerEvent>) => {
      const point = event.scenePoint;
      void engine.addObjectOfType("rect", {
        left: point.x - STAMP_SIZE / 2,
        top: point.y - STAMP_SIZE / 2,
        width: STAMP_SIZE,
        height: STAMP_SIZE,
        fill: "#f59e0b",
      });
    };

    engine.registry.registerTool(STAMP_TOOL_ID, {
      cursor: "crosshair",
      shortcut: "s",
      onActivate: () => {
        engine.getFabricCanvas().on("mouse:down", handleClick);
        engine.getFabricCanvas().defaultCursor = "crosshair";
      },
      onDeactivate: () => {
        engine.getFabricCanvas().off("mouse:down", handleClick);
        engine.getFabricCanvas().defaultCursor = "default";
      },
    });

    // ToolRegistry.activate() always deactivates whatever was active before, but there's no
    // "deactivate everything, go idle" method on the registry — only switching TO another
    // tool triggers a deactivate. This no-op "select" tool is that idle state, so a toggle
    // button can turn the stamp tool off by activating this instead.
    engine.registry.registerTool(SELECT_TOOL_ID, { cursor: "default" });
  },
};
