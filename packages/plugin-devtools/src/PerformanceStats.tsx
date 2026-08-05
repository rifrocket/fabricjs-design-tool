import type { ReactElement } from "react";
import { useEditorState } from "@rifrocket/fdt-react";
import { usePerformanceStats } from "./usePerformanceStats";

export interface PerformanceStatsProps {
  active?: boolean;
}

export function PerformanceStats({ active = true }: PerformanceStatsProps): ReactElement {
  const { fps } = usePerformanceStats(active);
  const objectCount = useEditorState((state) => state.objectIds.length);

  return (
    <dl>
      <dt>FPS</dt>
      <dd>{fps}</dd>
      <dt>Objects</dt>
      <dd>{objectCount}</dd>
    </dl>
  );
}
