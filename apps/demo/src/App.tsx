import type { ReactElement } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { TemplateProvider } from "./templates/TemplateContext";
import { EngineHost } from "./engine/EngineHost";
import { TourProvider } from "./tour/TourContext";

// Composition root: ThemeProvider resolves light/dark before anything paints, TemplateProvider
// owns which starter layout is active, EngineHost owns the CanvasEngine lifecycle and the whole
// app shell built around it — including the in-place multi-page toggle (see EngineHost.tsx's own
// comment). One screen, always mounted; multi-page is a capability of it, not a separate route.
// TourProvider shares EngineHost's lifetime (never unmounts), so its "seen" checks are always
// read fresh rather than cached across the multi-page toggle.
export function App(): ReactElement {
  return (
    <ThemeProvider>
      <TemplateProvider>
        <TourProvider>
          <EngineHost />
        </TourProvider>
      </TemplateProvider>
    </ThemeProvider>
  );
}
