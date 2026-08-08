import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerSerializedProperty } from "@rifrocket/fabricjs-design-tool";
import { registerImageType } from "./imageType";

export const imagePlugin: EditorPlugin = {
  name: "image",
  install(engine) {
    registerImageType(engine.registry.objectTypes);
    // `shapeKind` tags an image object as this plugin's type — without registering it, clone()/
    // JSON export silently drop it, losing the object's registered identity on reload.
    registerSerializedProperty("shapeKind");
  },
};
