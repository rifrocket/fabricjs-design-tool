import { createContext } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";

export const EditorContext = createContext<CanvasEngine | null>(null);
