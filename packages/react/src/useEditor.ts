import { useContext } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "./context";

// Reads the CanvasEngine from context; throws outside <Editor> or before it's ready.
export function useEditor(): CanvasEngine {
  const engine = useContext(EditorContext);
  if (!engine) {
    throw new Error("useEditor() must be called within an <Editor> whose engine has finished initializing");
  }
  return engine;
}
