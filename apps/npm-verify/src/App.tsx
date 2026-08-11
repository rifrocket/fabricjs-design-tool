import React, { type ReactElement } from "react";
import { CoverageProvider } from "./checklist/CoverageContext";
import { CoverageChecklist } from "./checklist/CoverageChecklist";
import { MainWorkspaceSection } from "./sections/MainWorkspaceSection";
import { PagesSection } from "./sections/PagesSection";
import { ThemeProvider } from "./theme/ThemeContext";
import { ThemeToggle } from "./theme/ThemeToggle";

function AppShell(): ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-fdt-bg-elevated text-fdt-fg">
      <header className="flex items-center justify-between gap-4 border-b border-fdt-border bg-fdt-bg px-7 py-4">
        <div>
          <h1 className="m-0 text-[17px] font-bold tracking-tight text-fdt-fg">npm-verify</h1>
          <p className="m-0 mt-0.5 max-w-xl text-xs text-fdt-fg-muted">
            Every <code className="rounded border border-fdt-border bg-fdt-bg-elevated px-1 py-px font-mono text-[11px]">@rifrocket/*</code>{" "}
            package installed from the real npm registry (not workspace-linked source) and exercised end to end.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-7">
          <MainWorkspaceSection />
          <PagesSection />
        </main>
        <CoverageChecklist />
      </div>
    </div>
  );
}

export function App(): ReactElement {
  return (
    <ThemeProvider>
      <CoverageProvider>
        <AppShell />
      </CoverageProvider>
    </ThemeProvider>
  );
}
