import { createContext, useContext, useState } from "react";
import type { ReactElement, ReactNode } from "react";

const DebugModeContext = createContext(false);

export function DebugModeProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}): ReactElement {
  return <DebugModeContext.Provider value={value}>{children}</DebugModeContext.Provider>;
}

export function useDebugMode(): boolean {
  return useContext(DebugModeContext);
}

export function DebugModeToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}): ReactElement {
  return (
    <label className="flex items-center gap-2 text-xs text-fdt-fg-muted">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-fdt-accent"
      />
      Debug mode (show object ids)
    </label>
  );
}

// DevToolsPanel owns the boolean (via this hook) and passes it down through DebugModeProvider
// so HierarchyPanel can read it with useDebugMode() instead of prop drilling.
export function useDebugModeState(): [boolean, (next: boolean) => void] {
  return useState(false);
}
