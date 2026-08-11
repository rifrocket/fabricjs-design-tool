import { createContext, useContext } from "react";
import type { ReactElement, ReactNode } from "react";
import { useSystemTheme } from "@rifrocket/fdt-react";
import type { UseSystemThemeResult } from "@rifrocket/fdt-react";

type ThemeContextValue = UseSystemThemeResult;

const ThemeContext = createContext<ThemeContextValue | null>(null);

// syncDocumentElement: true because this app's own chrome (header, checklist rail, pages
// section — anything outside <DesignEditor>'s own wrapper) also reads @rifrocket/fdt-theme's
// --fdt-* custom properties via Tailwind's token bridge, which only apply where data-fdt-theme
// is set (see packages/theme/src/tokens.css) — same reasoning as apps/demo's ThemeContext.
export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const value = useSystemTheme({ storageKey: "npm-verify:theme", syncDocumentElement: true });
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
