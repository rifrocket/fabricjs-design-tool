// Shared by every consumer of @rifrocket/fdt-plugin-pan-zoom's selector-based hooks/helpers in
// the multi-page example (useCanvasPanZoom, useContainerSize, centerContent) and
// PageCanvasHost.tsx, which renders the element this selector must match. Deliberately a
// separate constant from ../viewport/canvasContainerSelector's CANVAS_CONTAINER_SELECTOR: the
// two screens' canvas containers are different DOM elements, live at different times (only one
// of EngineHost/MultiPageExample is ever mounted), and mixing them up would make
// useCanvasPanZoom bind to the wrong — possibly absent — container.
export const PAGES_CANVAS_CONTAINER_SELECTOR = '[data-fdt-pages-canvas-container="true"]';
