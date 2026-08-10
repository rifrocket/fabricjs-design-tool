import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["fabric", "@rifrocket/fabricjs-design-tool", "@rifrocket/fdt-plugin-media-fields", "react", "react-dom"],
});
