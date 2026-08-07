import type { ReactElement, ReactNode } from "react";
import { usePagesContext } from "./usePagesContext";
import { usePageCanvasRef } from "./usePageCanvasRef";

export interface PagesCanvasProps {
  className?: string;
  // Rendered instead of the canvas container when there's no active page yet. Defaults to null.
  fallback?: ReactNode;
}

// Batteries-included counterpart to usePageCanvasRef(): mounts and relocates the active page's
// canvas declaratively, the same "zero consumer-authored DOM code" experience @rifrocket/fdt-react's
// <Editor> already provides for the single-page case. Must be rendered inside a <PagesProvider>.
export function PagesCanvas({ className, fallback = null }: PagesCanvasProps): ReactElement {
  const { activeEngine } = usePagesContext();
  const { containerRef } = usePageCanvasRef();

  if (!activeEngine) return <>{fallback}</>;
  return <div ref={containerRef} className={className} />;
}
