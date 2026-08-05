import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  active: boolean;
  onEscape?: () => void;
}

// Confines Tab/Shift+Tab focus within the container while active, calls onEscape on Escape,
// and restores focus to whatever was focused before activation once deactivated. Reusable
// infrastructure for future modals/dialogs (v1 had none; this closes that a11y gap ahead of them).
export function useFocusTrap<T extends HTMLElement>({ active, onEscape }: UseFocusTrapOptions): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    getFocusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;

      const elements = getFocusable();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active, onEscape]);

  return containerRef;
}
