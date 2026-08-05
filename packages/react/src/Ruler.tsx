import type { ReactElement } from "react";
import { computeRulerTicks } from "@rifrocket/fabricjs-design-tool";
import { useEditorState } from "./useEditorState";

export interface RulerProps {
  orientation: "horizontal" | "vertical";
  length: number;
  thickness?: number;
}

// Draws tick marks along one axis of the canvas, computed from the live zoom/pan state
// via core's computeRulerTicks — a feature the audit flagged as entirely absent in v1.
export function Ruler({ orientation, length, thickness = 20 }: RulerProps): ReactElement {
  const zoom = useEditorState((state) => state.zoom);
  const pan = useEditorState((state) => (orientation === "horizontal" ? state.panX : state.panY));
  const ticks = computeRulerTicks({ length, zoom, pan });

  const isHorizontal = orientation === "horizontal";

  return (
    <svg
      role="presentation"
      width={isHorizontal ? length : thickness}
      height={isHorizontal ? thickness : length}
    >
      {ticks.map((tick) => {
        const tickLength = tick.isMajor ? thickness : thickness / 2;
        return isHorizontal ? (
          <g key={tick.position}>
            <line x1={tick.position} y1={thickness - tickLength} x2={tick.position} y2={thickness} stroke="currentColor" />
            {tick.isMajor && (
              <text x={tick.position + 2} y={thickness - tickLength} fontSize={9}>
                {Math.round(tick.value)}
              </text>
            )}
          </g>
        ) : (
          <g key={tick.position}>
            <line x1={thickness - tickLength} y1={tick.position} x2={thickness} y2={tick.position} stroke="currentColor" />
            {tick.isMajor && (
              <text x={2} y={tick.position - 2} fontSize={9}>
                {Math.round(tick.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
