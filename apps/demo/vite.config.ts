import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Deployed alongside the docs site under the same GitHub Pages project page
// (https://rifrocket.github.io/fabricjs-design-tool/demo/), so production
// asset URLs need the repo + /demo/ prefix. Dev server stays at root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/fabricjs-design-tool/demo/" : "/",
  plugins: [react(), tailwindcss()],
}));
