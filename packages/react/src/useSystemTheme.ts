import { useCallback, useEffect, useState } from "react";
import type { EditorTheme } from "./Editor";

export interface UseSystemThemeOptions {
  /** Persisted under this localStorage key when set; otherwise the choice only lives for the session. */
  storageKey?: string;
  /** Starting theme before any stored value is read (or when `storageKey` is omitted). */
  defaultTheme?: EditorTheme;
  /**
   * When true, mirrors the resolved theme onto `document.documentElement`'s `data-fdt-theme`
   * attribute so @rifrocket/fdt-theme's CSS variables apply outside <Editor>/<DesignEditor>'s own
   * scoped wrapper (e.g. custom app chrome). Off by default since those components already scope
   * tokens to themselves.
   */
  syncDocumentElement?: boolean;
}

export interface UseSystemThemeResult {
  theme: EditorTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: EditorTheme) => void;
}

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(storageKey: string | undefined, fallback: EditorTheme): EditorTheme {
  if (!storageKey || typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
}

// Every consumer building a custom app shell around <Editor>/<DesignEditor> needs to resolve
// "system" to a concrete theme, listen for OS theme changes, and usually persist the choice —
// exactly what apps/demo's theme/useTheme.ts used to reimplement from scratch before this hook
// existed.
export function useSystemTheme(options: UseSystemThemeOptions = {}): UseSystemThemeResult {
  const { storageKey, defaultTheme = "system", syncDocumentElement = false } = options;
  const [theme, setThemeState] = useState<EditorTheme>(() => readStoredTheme(storageKey, defaultTheme));
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    theme === "system" ? resolveSystemTheme() : theme,
  );

  useEffect(() => {
    const resolved = theme === "system" ? resolveSystemTheme() : theme;
    setResolvedTheme(resolved);
    if (syncDocumentElement) document.documentElement.setAttribute("data-fdt-theme", resolved);
  }, [theme, syncDocumentElement]);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = resolveSystemTheme();
      setResolvedTheme(resolved);
      if (syncDocumentElement) document.documentElement.setAttribute("data-fdt-theme", resolved);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, syncDocumentElement]);

  const setTheme = useCallback(
    (next: EditorTheme) => {
      setThemeState(next);
      if (storageKey) window.localStorage.setItem(storageKey, next);
    },
    [storageKey],
  );

  return { theme, resolvedTheme, setTheme };
}
