import { useEffect, useState } from "react";

export interface ContainerSize {
  width: number;
  height: number;
}

// Tracks a container element's live pixel size, for keeping a canvas element sized to exactly
// fill a fixed-size viewport independent of zoom/document size. `selector` is matched once on
// mount; the consuming app should render the canvas inside that same element.
export function useContainerSize(selector: string): ContainerSize | null {
  const [size, setSize] = useState<ContainerSize | null>(null);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(selector);
    if (!container) return;

    const updateSize = () => setSize({ width: container.clientWidth, height: container.clientHeight });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [selector]);

  return size;
}
