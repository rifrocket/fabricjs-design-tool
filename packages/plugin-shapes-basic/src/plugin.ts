import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerSerializedProperty } from "@rifrocket/fabricjs-design-tool";
import { registerBasicShapes } from "./shapes";

export const shapesBasicPlugin: EditorPlugin = {
  name: "shapes-basic",
  install(engine) {
    registerBasicShapes(engine.registry.objectTypes);
    // rounded-rectangle and every polygon shape (star, heart, triangle, ...) carry their type
    // identity in `shapeKind`, not Fabric's native `.type` — without this, clone()/JSON export
    // silently drop it, and the object falls back to an unregistered "polygon" type on reload.
    registerSerializedProperty("shapeKind");
  },
};
