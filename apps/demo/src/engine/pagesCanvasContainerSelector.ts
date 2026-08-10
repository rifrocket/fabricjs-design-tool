// Shared by every consumer of @rifrocket/fdt-plugin-pan-zoom's selector-based hooks/helpers in
// multi-page mode (useCanvasPanZoom, useContainerSize, centerContent) and PageCanvasHost.tsx,
// which renders the element this selector must match. Deliberately a separate constant from
// ../features/viewport/canvasContainerSelector's CANVAS_CONTAINER_SELECTOR: the single-document
// and multi-page canvas containers are different DOM elements, live at different times (only one
// of EngineHost's two branches is ever mounted at once), and mixing them up would make
// useCanvasPanZoom bind to the wrong — possibly absent — container.
export const PAGES_CANVAS_CONTAINER_SELECTOR = '[data-fdt-pages-canvas-container="true"]';
