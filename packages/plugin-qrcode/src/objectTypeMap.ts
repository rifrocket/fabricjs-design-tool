import type { QRCodeObjectConfig } from "./objectType";

// Module augmentation — see plugin-shapes-basic/src/objectTypeMap.ts for the full explanation
// of this pattern.
declare module "@rifrocket/fabricjs-design-tool" {
  interface ObjectTypeMap {
    qrcode: QRCodeObjectConfig;
  }
}
