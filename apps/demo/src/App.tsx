import { useState } from "react";
import type { ReactElement } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { TemplateProvider } from "./templates/TemplateContext";
import { EngineHost } from "./engine/EngineHost";
import { MultiPageExample } from "./features/pages-example/MultiPageExample";

type View = "workspace" | "pages-example";

// Composition root: ThemeProvider resolves light/dark before anything paints,
// TemplateProvider owns which starter layout is active, EngineHost owns the CanvasEngine
// lifecycle and the whole app shell built around it (see engine/EngineHost.tsx). The
// pages-example view is a deliberately separate screen, not folded into EngineHost — see
// MultiPageExample.tsx for why.
export function App(): ReactElement {
  const [view, setView] = useState<View>("workspace");

  // ThemeProvider wraps both views: AppShell's shared Header (see shell/AppShell.tsx) renders
  // <ThemeToggle> in both modes, which needs it. TemplateProvider stays workspace-only — it's
  // genuinely single-document state (the starter-template picker), which the pages view has no
  // use for.
  return (
    <ThemeProvider>
      {view === "pages-example" ? (
        <MultiPageExample onExit={() => setView("workspace")} />
      ) : (
        <TemplateProvider>
          <EngineHost onOpenPagesExample={() => setView("pages-example")} />
        </TemplateProvider>
      )}
    </ThemeProvider>
  );
}
