export const BUTTON_CLASS =
  "rounded-lg border border-fdt-border bg-fdt-bg px-2.5 py-1.5 text-xs font-medium text-fdt-fg transition-colors duration-150 hover:border-fdt-accent hover:bg-fdt-bg-elevated";

export const PRIMARY_BUTTON_CLASS =
  "rounded-lg bg-fdt-accent px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-fdt-accent-hover";

export const SECTION_LABEL_CLASS = "mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted first:mt-0";

// Several ready-made components (ShapePicker, AlignmentControls, SnappingToggle, LayersPanel,
// the devtools panels) ship deliberately bare/unstyled — "matching the convention
// @rifrocket/fdt-react's own shipped components already follow" per plugin-snapping's own
// source comment — with zero classNames, expecting the consumer to style them (apps/demo builds
// its own custom replacements for these; this app instead styles the real bare components via
// descendant selectors, since restyling every button by hand isn't proportionate for a
// verification app). Buttons only — safe wherever a bare component renders <button> children.
export const BARE_BUTTONS_CLASS =
  "flex flex-wrap gap-1.5 [&_button]:rounded-md [&_button]:border [&_button]:border-fdt-border [&_button]:bg-fdt-bg [&_button]:px-2 [&_button]:py-1 [&_button]:text-[11px] [&_button]:text-fdt-fg [&_button]:transition-colors [&_button]:hover:border-fdt-accent [&_button]:disabled:cursor-not-allowed [&_button]:disabled:opacity-40";

// For bare components built from <dl>/<ul>/<ol>/<li> instead of buttons (CanvasStateViewer,
// HistoryPanel, PerformanceStats, LayersPanel's row list) — same reasoning as BARE_BUTTONS_CLASS.
export const BARE_LIST_CLASS =
  "text-xs text-fdt-fg [&_dl]:grid [&_dl]:grid-cols-2 [&_dl]:gap-x-3 [&_dl]:gap-y-1 [&_dt]:text-fdt-fg-muted [&_dd]:m-0 [&_dd]:font-mono [&_ul]:m-0 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:p-0 [&_ol]:m-0 [&_ol]:flex [&_ol]:list-none [&_ol]:flex-col [&_ol]:gap-1 [&_ol]:p-0 [&_li]:flex [&_li]:flex-wrap [&_li]:items-center [&_li]:gap-1.5 [&_li]:rounded [&_li]:border [&_li]:border-fdt-border [&_li]:bg-fdt-bg-elevated [&_li]:px-2 [&_li]:py-1 [&_li[aria-current=true]]:border-fdt-accent [&_button]:rounded [&_button]:border [&_button]:border-fdt-border [&_button]:bg-fdt-bg [&_button]:px-1.5 [&_button]:py-0.5 [&_button]:text-[10px] [&_button]:hover:border-fdt-accent [&_p]:m-0 [&_p]:font-semibold [&_pre]:mt-2 [&_pre]:max-h-40 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:border [&_pre]:border-fdt-border [&_pre]:bg-fdt-bg-elevated [&_pre]:p-2 [&_pre]:text-[10px]";
