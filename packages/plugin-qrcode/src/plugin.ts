import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerSerializedProperty } from "@rifrocket/fabricjs-design-tool";
import { registerQRCodeType } from "./objectType";

export const qrCodePlugin: EditorPlugin = {
  name: "qrcode",
  install(engine) {
    registerQRCodeType(engine.registry.objectTypes);
    // `shapeKind` tags a QR code object as this plugin's type — without registering it, clone()/
    // JSON export silently drop it; standalone (without plugin-image also installed) it falls back
    // to an unregistered type entirely, blanking the Properties panel.
    registerSerializedProperty("shapeKind");
  },
};
