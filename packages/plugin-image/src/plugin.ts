import type { EditorPlugin } from "@rifrocket/fdt-core";
import { registerImageType } from "./imageType";

export const imagePlugin: EditorPlugin = {
  name: "image",
  install(engine) {
    registerImageType(engine.registry.objectTypes);
  },
};
