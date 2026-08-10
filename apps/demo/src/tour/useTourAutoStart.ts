import { useEffect, useRef } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { useTourContext } from "./TourContext";

// Fires the mode-appropriate tour exactly once per AppShell instance, the moment `engine` first
// becomes non-null — the same readiness signal Header/RightSidebar/StatusBar already gate on, so
// every data-tour target is guaranteed mounted by then. The synchronous ref-set (not an effect
// cleanup) survives React StrictMode's dev-only mount->cleanup->mount replay: a phantom call sets
// the ref and returns before doing anything observable, so the real call sees it already set and
// skips — same guard shape EngineHost.tsx's own first-load refs use, for the same reason.
export function useTourAutoStart(mode: "workspace" | "pages", engine: CanvasEngine | null): void {
  const { startCoreTourIfNeeded, startPagesTourIfNeeded } = useTourContext();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !engine) return;
    startedRef.current = true;
    if (mode === "workspace") {
      startCoreTourIfNeeded();
    } else {
      startPagesTourIfNeeded();
    }
  }, [mode, engine, startCoreTourIfNeeded, startPagesTourIfNeeded]);
}
