import { createContext, useContext, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { driver } from "driver.js";
import { SHARED_DRIVER_OPTIONS, toDriveSteps } from "./driverConfig";
import { CORE_TOUR_STEPS } from "./coreTourSteps";
import { PAGES_TOUR_STEPS } from "./pagesTourSteps";
import { hasSeenCoreTour, markCoreTourSeen, hasSeenPagesTour, markPagesTourSeen } from "./tourStorage";
import { logUiEvent } from "../dev-tools/uiEventLog";

interface TourContextValue {
  startCoreTourIfNeeded: () => void;
  startPagesTourIfNeeded: () => void;
  replayCoreTour: () => void;
  replayPagesTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

function runCoreTour(): void {
  const instance = driver({
    ...SHARED_DRIVER_OPTIONS,
    steps: toDriveSteps(CORE_TOUR_STEPS),
    onDestroyed: () => {
      markCoreTourSeen();
      logUiEvent("Core tour finished/skipped");
    },
  });
  requestAnimationFrame(() => instance.drive());
}

function runPagesTour(): void {
  const instance = driver({
    ...SHARED_DRIVER_OPTIONS,
    steps: toDriveSteps(PAGES_TOUR_STEPS),
    onDestroyed: () => {
      markPagesTourSeen();
      logUiEvent("Pages tour finished/skipped");
    },
  });
  requestAnimationFrame(() => instance.drive());
}

// Mounted once in App.tsx, same lifetime as EngineHost — hasSeenXTour() is re-read fresh on every
// call rather than cached in state, since nothing else in the app writes those keys.
export function TourProvider({ children }: { children: ReactNode }): ReactElement {
  const value = useMemo<TourContextValue>(
    () => ({
      startCoreTourIfNeeded: () => {
        if (hasSeenCoreTour()) return;
        logUiEvent("Started core tour");
        runCoreTour();
      },
      startPagesTourIfNeeded: () => {
        if (hasSeenPagesTour()) return;
        logUiEvent("Started pages tour");
        runPagesTour();
      },
      replayCoreTour: () => {
        logUiEvent("Replayed core tour");
        runCoreTour();
      },
      replayPagesTour: () => {
        logUiEvent("Replayed pages tour");
        runPagesTour();
      },
    }),
    [],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTourContext(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTourContext() must be called within a <TourProvider>");
  return ctx;
}
