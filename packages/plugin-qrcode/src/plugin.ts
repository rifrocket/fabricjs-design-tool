import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { registerQRCodeType } from "./objectType";

export const qrCodePlugin: EditorPlugin = {
  name: "qrcode",
  install(engine) {
    registerQRCodeType(engine.registry.objectTypes);
  },
};
