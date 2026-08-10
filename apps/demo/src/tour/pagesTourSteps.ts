import type { TourStepDef } from "./types";

export const PAGES_TOUR_STEPS: TourStepDef[] = [
  {
    element: '[data-tour="new-pair-button"]',
    title: "Front/back pairs",
    description: "Create a linked front+back pair — like a business card — with one click. Each side is still its own independent canvas.",
    side: "bottom",
  },
  {
    element: '[data-tour="pair-toggle"]',
    title: "Flip sides",
    description: "Jump between a pair's front and back side here.",
    side: "bottom",
  },
  {
    element: '[data-tour="page-tabs-bar"]',
    title: "Your pages",
    description: "Every page lives here — add, duplicate, reorder, rename, or lock a page from this strip.",
    side: "top",
  },
  {
    element: '[data-tour="export-menu"]',
    title: "Export a pair as one PDF",
    description: "Exporting a paired page now bundles both sides into a single print-ready PDF.",
    side: "bottom",
  },
];
