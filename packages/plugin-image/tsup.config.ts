import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["fabric", "@rifrocket/fdt-core", "@rifrocket/fdt-properties", "react", "react-dom"],
});
