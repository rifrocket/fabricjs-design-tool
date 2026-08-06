import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerBasicShapes } from "./shapes";

export const shapesBasicPlugin: EditorPlugin = {
  name: "shapes-basic",
  install(engine) {
    registerBasicShapes(engine.registry.objectTypes);
  },
};
