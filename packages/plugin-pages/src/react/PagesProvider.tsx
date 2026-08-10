import type { ReactElement, ReactNode } from "react";
import { EditorContext } from "@rifrocket/fdt-react";
import type { EngineFactory } from "../PagesManager";
import { PagesContext } from "./context";
import { usePages } from "./usePages";
import type { UsePagesOptions } from "./usePages";

export interface PagesProviderProps {
  options: UsePagesOptions;
  children: ReactNode;
  engineFactory?: EngineFactory;
}

// Re-provides @rifrocket/fdt-react's EditorContext with whichever page is active, so existing
// EditorContext-consuming UI (PropertiesPanel, LayersPanel, toolbar, useEditor()) follows page
// switches with no changes on their part.
export function PagesProvider({ options, engineFactory, children }: PagesProviderProps): ReactElement {
  const pages = usePages(options, engineFactory);
  return (
    <EditorContext.Provider value={pages.activeEngine}>
      <PagesContext.Provider value={pages}>{children}</PagesContext.Provider>
    </EditorContext.Provider>
  );
}
