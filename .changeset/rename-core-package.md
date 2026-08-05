---
"@rifrocket/fabricjs-design-tool": patch
"@rifrocket/fdt-react": patch
"@rifrocket/fdt-properties": patch
"@rifrocket/fdt-plugin-alignment": patch
"@rifrocket/fdt-plugin-clipboard": patch
"@rifrocket/fdt-plugin-devtools": patch
"@rifrocket/fdt-plugin-effects": patch
"@rifrocket/fdt-plugin-export-pdf": patch
"@rifrocket/fdt-plugin-image": patch
"@rifrocket/fdt-plugin-import-json": patch
"@rifrocket/fdt-plugin-local-storage": patch
"@rifrocket/fdt-plugin-pan-zoom": patch
"@rifrocket/fdt-plugin-qrcode": patch
"@rifrocket/fdt-plugin-shapes-basic": patch
"@rifrocket/fdt-plugin-snapping": patch
"@rifrocket/fdt-plugin-svg-import": patch
"@rifrocket/fdt-demo": patch
---

Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
