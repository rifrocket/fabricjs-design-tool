// Deliberate exception to the "every plugin-* package gets an EditorPlugin wrapper"
// convention: useCanvasPanZoom is a side-effecting DOM-listener hook that needs a
// host-supplied `containerSelector` unknowable from `engine` alone, and wrapping it as a
// null-rendering "panel" would misuse PanelRegistry (every other registered panel is real
// visible UI). This package stays plain hooks/functions, consumed directly by app code —
// not installed via engine.use().
export { useCanvasPanZoom } from "./useCanvasPanZoom";
export type { UseCanvasPanZoomOptions } from "./useCanvasPanZoom";

export { setCanvasZoom } from "./setCanvasZoom";
export type { ZoomCenter } from "./setCanvasZoom";

export { useContainerSize } from "./useContainerSize";
export type { ContainerSize } from "./useContainerSize";

export { centerContent, getContainerSize } from "./centerContent";

export { createPageBoundaryRect, findPageBoundary, captureSnapshotExcludingBoundary } from "./pageBoundary";

export { usePannableDocument } from "./usePannableDocument";
export type { UsePannableDocumentOptions } from "./usePannableDocument";
