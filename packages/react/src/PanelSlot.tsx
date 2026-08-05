import type { ComponentType, ReactElement } from "react";
import { useEditor } from "./useEditor";
import { resolvePanelComponents } from "./resolvePanels";

export interface PanelSlotProps {
  name: string;
  override?: ComponentType;
}

// Renders whatever plugins registered into a named slot (e.g. "sidebar-right"), or the
// host's override if one was passed to <Editor slots={{...}}>.
export function PanelSlot({ name, override }: PanelSlotProps): ReactElement {
  const engine = useEditor();
  const components = resolvePanelComponents(engine.registry.panels, name, override);
  return (
    <>
      {components.map((Component, index) => (
        <Component key={index} />
      ))}
    </>
  );
}
