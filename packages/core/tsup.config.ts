import { defineConfig } from "tsup";

export default defineConfig({
  // One entry per package.json "exports" subpath — each builds to dist/<name>.{js,cjs,d.ts}
  // alongside the main dist/index.* barrel.
  entry: {
    index: "src/index.ts",
    history: "src/history/index.ts",
    effects: "src/effects/index.ts",
    export: "src/export/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["fabric"],
});
