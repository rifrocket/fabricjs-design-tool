import type { Config, DriveStep } from "driver.js";
import type { TourStepDef } from "./types";

export const SHARED_DRIVER_OPTIONS: Partial<Config> = {
  showProgress: true,
  smoothScroll: true,
  animate: true,
  overlayOpacity: 0.55,
  stagePadding: 6,
  allowClose: true,
  // A data-tour selector missing from the DOM (e.g. a not-yet-rendered target) skips that step
  // instead of hanging the tour on a highlight that can never resolve.
  skipMissingElement: true,
  // Defensive sweep against a real driver.js 1.8.0 bug: its internal "previous active element"
  // state isn't finalized in time for the very first step->step transition, so the outline from
  // step 1 never gets cleared by driver.js's own cleanup and sticks around for the rest of the
  // tour. Confirmed via direct DOM inspection (multiple `.driver-active-element`-tagged elements
  // accumulate, always including the very first step's target). Sweeping any stray element other
  // than the one currently being highlighted fixes the symptom regardless of driver.js's own
  // internal state bug.
  onHighlightStarted: (element) => {
    document.querySelectorAll(".driver-active-element").forEach((el) => {
      if (el !== element) el.classList.remove("driver-active-element");
    });
  },
};

export function toDriveSteps(steps: TourStepDef[]): DriveStep[] {
  return steps.map(({ element, title, description, side }) => ({
    element,
    popover: { title, description, side, align: "start" },
  }));
}
