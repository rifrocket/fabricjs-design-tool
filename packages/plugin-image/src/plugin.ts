import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerImageType } from "./imageType";

export const imagePlugin: EditorPlugin = {
  name: "image",
  install(engine) {
    registerImageType(engine.registry.objectTypes);
  },
};
