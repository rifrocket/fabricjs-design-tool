import { defineConfig } from "vitest/config";

// No Node-testable logic here: SVG parsing goes through the DOM, which this sandbox
// can't provide (see importer.ts). No browser-based e2e suite exists in this repo yet to
// cover it either — install()/importSVG() are exercised only by manual testing today
// (apps/demo's SvgImportButton). Add real coverage here if/when an e2e harness lands.
export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
  },
});
