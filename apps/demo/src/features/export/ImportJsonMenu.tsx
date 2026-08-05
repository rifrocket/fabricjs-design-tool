import { useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { Upload } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// JSON import is registered by @rifrocket/fdt-plugin-import-json (installed in
// engine/EngineHost.tsx); engine.importFile() does the loadFromJSON + reactive-state resync this
// used to hand-roll here, and clears history rather than leaving it pointing at now-replaced
// objects — so this replace-canvas action isn't itself undoable.
export function ImportJsonMenu(): ReactElement {
  const engine = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    await engine.importFile("json", JSON.parse(text));

    logUiEvent("Import JSON", { objects: engine.store.getState().objectIds.length });
  };

  return (
    <div className="flex items-center gap-1">
      <button type="button" title="Import JSON" onClick={() => inputRef.current?.click()} className={ICON_BUTTON_CLASS}>
        <Upload size={16} strokeWidth={2} />
      </button>
      <InfoTooltip featureKey="importJson" />
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => void handleChange(e)} />
    </div>
  );
}
