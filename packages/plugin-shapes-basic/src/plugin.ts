import type { EditorPlugin } from "@rifrocket/fdt-core";
import { registerBasicShapes } from "./shapes";

export const shapesBasicPlugin: EditorPlugin = {
  name: "shapes-basic",
  install(engine) {
    registerBasicShapes(engine.registry.objectTypes);
  },
};
