import { createContext, useContext } from "react";
import type { ReactElement, ReactNode } from "react";
import { useSystemTheme } from "@rifrocket/fdt-react";
import type { UseSystemThemeResult } from "@rifrocket/fdt-react";

type ThemeContextValue = UseSystemThemeResult;

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "fdt-demo-theme";

// syncDocumentElement: true because this app's own chrome (Header, sidebars — anything outside
// <DesignEditor>'s own wrapper) also reads packages/theme's --fdt-* custom properties, which
// only apply where data-fdt-theme is set (see packages/theme/src/tokens.css).
export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const value = useSystemTheme({ storageKey: STORAGE_KEY, syncDocumentElement: true });
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext() must be called within a <ThemeProvider>");
  }
  return context;
}
