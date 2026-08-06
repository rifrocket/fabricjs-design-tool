import { useContext } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "@rifrocket/fdt-react";

// useEditor() (from @rifrocket/fdt-react) throws when the engine isn't ready yet — true
// briefly on first load and during every template-switch remount (see EngineHost). Chrome
// that must render through that gap (header skeleton, disabled buttons) reads this instead.
export function useEngineOrNull(): CanvasEngine | null {
  return useContext(EditorContext);
}
