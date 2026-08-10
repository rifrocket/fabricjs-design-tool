import type { TourStepDef } from "./types";
import { CANVAS_CONTAINER_SELECTOR } from "../features/viewport/canvasContainerSelector";

export const CORE_TOUR_STEPS: TourStepDef[] = [
  {
    element: '[data-tour="header-actions"]',
    title: "Undo / redo",
    description: "Every change is history-tracked, so you can always undo or redo it from here — or with Ctrl+Z / Ctrl+Shift+Z.",
    side: "bottom",
  },
  {
    element: '[data-tour="template-picker"]',
    title: "Starter templates",
    description: "Pick a starter layout — business card, flyer, poster, and more — or start from a blank canvas.",
    side: "bottom",
  },
  {
    element: '[data-tour="tool-rail"]',
    title: "Add content",
    description: "Add shapes, images, QR codes, SVGs, and stamps from this rail. Click a shape to add it, then drag it into place.",
    side: "right",
  },
  {
    element: CANVAS_CONTAINER_SELECTOR,
    title: "Your canvas",
    description: "Drag, resize, and arrange objects here. Scroll to zoom toward the cursor, or hold Space and drag to pan.",
    side: "top",
  },
  {
    element: '[data-tour="sidebar-tabs"]',
    title: "Properties, effects & layers",
    description: "Edit a selected object's properties, apply effects, or reorder layers — all from this panel.",
    side: "left",
  },
  {
    element: '[data-tour="status-bar"]',
    title: "Zoom & snapping",
    description: "Zoom controls and smart-guide snapping live in the status bar — toggle snapping off for pixel-perfect placement.",
    side: "top",
  },
  {
    element: '[data-tour="export-menu"]',
    title: "Export",
    description: "Export your design as PNG, JPEG, SVG, JSON, or a print-ready PDF whenever you're ready.",
    side: "bottom",
  },
];
