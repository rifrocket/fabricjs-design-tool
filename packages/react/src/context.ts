import { createContext } from "react";
import type { CanvasEngine } from "@rifrocket/fdt-core";

export const EditorContext = createContext<CanvasEngine | null>(null);
