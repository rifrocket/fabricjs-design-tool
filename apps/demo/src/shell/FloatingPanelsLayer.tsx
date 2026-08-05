import type { ReactElement } from "react";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { ContextMenu } from "./ContextMenu";

// Host for floating chrome that isn't pinned to a fixed shell region (context menu today;
// toasts/future modals would mount here too). ContextMenu itself portals into
// #fdt-overlay-root — this component just decides *when* it's safe to mount it.
export function FloatingPanelsLayer(): ReactElement | null {
  const engine = useEngineOrNull();
  if (!engine) return null;
  return <ContextMenu />;
}
