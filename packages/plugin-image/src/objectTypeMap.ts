import type { ImageObjectConfig } from "./imageType";

// Module augmentation — see plugin-shapes-basic/src/objectTypeMap.ts for the full explanation
// of this pattern.
declare module "@rifrocket/fdt-core" {
  interface ObjectTypeMap {
    image: ImageObjectConfig;
  }
}
