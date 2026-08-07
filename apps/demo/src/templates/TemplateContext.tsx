import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { loadDesignFromStorage } from "@rifrocket/fdt-plugin-local-storage";
import { TEMPLATES } from "./index";
import type { StarterDesignMeta, TemplateDefinition } from "./types";

interface CustomSize {
  width: number;
  height: number;
}

interface TemplateContextValue {
  templates: TemplateDefinition[];
  activeTemplate: TemplateDefinition;
  setActiveTemplateId: (id: string) => void;
  setCustomSize: (width: number, height: number) => void;
}

const TemplateContext = createContext<TemplateContextValue | null>(null);

interface InitialPageState {
  templateId: string;
  customSize: CustomSize | null;
}

// Reads the *same* stored design @rifrocket/fdt-plugin-local-storage autosaves (see
// engine/EngineHost.tsx's captureMeta) to pick the initial template/size, rather than
// maintaining a second, independently-written localStorage key that could drift out of sync.
// Synchronous (JSON.parse of a localStorage string), so safe to call from useState's lazy
// initializer before the engine exists.
function readInitialPageState(): InitialPageState {
  const fallback: InitialPageState = { templateId: TEMPLATES[0].id, customSize: null };
  const meta = loadDesignFromStorage<StarterDesignMeta>()?.meta;
  if (!meta) return fallback;

  const baseTemplate = TEMPLATES.find((template) => template.id === meta.templateId);
  if (!baseTemplate || typeof meta.width !== "number" || typeof meta.height !== "number") return fallback;

  const isCustomSize = meta.width !== baseTemplate.width || meta.height !== baseTemplate.height;
  return { templateId: baseTemplate.id, customSize: isCustomSize ? { width: meta.width, height: meta.height } : null };
}

export function TemplateProvider({ children }: { children: ReactNode }): ReactElement {
  const [initialState] = useState(readInitialPageState);
  const [activeTemplateId, setActiveTemplateIdState] = useState(initialState.templateId);
  const [customSize, setCustomSizeState] = useState<CustomSize | null>(initialState.customSize);

  // Switching to a different template should use that template's own native size, not carry
  // over a size someone dialed in for a previous template.
  const setActiveTemplateId = useCallback((id: string) => {
    setActiveTemplateIdState(id);
    setCustomSizeState(null);
  }, []);

  const setCustomSize = useCallback((width: number, height: number) => {
    setCustomSizeState({ width, height });
  }, []);

  const value = useMemo<TemplateContextValue>(() => {
    const baseTemplate = TEMPLATES.find((template) => template.id === activeTemplateId) ?? TEMPLATES[0];
    const activeTemplate = customSize ? { ...baseTemplate, width: customSize.width, height: customSize.height } : baseTemplate;
    return { templates: TEMPLATES, activeTemplate, setActiveTemplateId, setCustomSize };
  }, [activeTemplateId, customSize, setActiveTemplateId, setCustomSize]);

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplateContext(): TemplateContextValue {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplateContext() must be called within a <TemplateProvider>");
  }
  return context;
}
