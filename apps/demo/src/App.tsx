import type { ReactElement } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { TemplateProvider } from "./templates/TemplateContext";
import { EngineHost } from "./engine/EngineHost";

// Composition root: ThemeProvider resolves light/dark before anything paints,
// TemplateProvider owns which starter layout is active, EngineHost owns the CanvasEngine
// lifecycle and the whole app shell built around it (see engine/EngineHost.tsx).
export function App(): ReactElement {
  return (
    <ThemeProvider>
      <TemplateProvider>
        <EngineHost />
      </TemplateProvider>
    </ThemeProvider>
  );
}
