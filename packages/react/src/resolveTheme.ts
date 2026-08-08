import type { EditorTheme } from "./Editor";

// tokens.css only defines "light"/"dark" token sets — "system" is a resolved-at-render-time
// convenience, never a literal attribute value; setting it verbatim (the previous behavior)
// meant it never matched either token set and no --fdt-* variable ever applied for the default
// theme value.
// Exported for consumers building their own chrome around a non-<Editor> engine (e.g.
// @rifrocket/fdt-plugin-pages' <MultiPageDesignEditor>) who still want <Editor>'s exact
// "system" resolution and data-fdt-theme convention, instead of reimplementing it.
// Lives in its own file (not Editor.tsx) so this function export doesn't share a module with
// the <Editor> component export, which react-refresh/only-export-components flags.
export function resolveTheme(theme: EditorTheme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
