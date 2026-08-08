import { useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { FileCode } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import { importSvgToEngine } from "@rifrocket/fdt-plugin-svg-import";
import { logUiEvent } from "../../dev-tools/uiEventLog";

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// Registered as an *importer*, not an object type, by @rifrocket/fdt-plugin-svg-import — it
// calls canvas.add() directly, bypassing history, so imported SVGs sync into layers/object
// state but aren't undoable (a known, documented limitation, not a bug in this demo).
export function SvgImportButton(): ReactElement {
  const engine = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const svgText = await file.text();
    await importSvgToEngine(engine, svgText);
    logUiEvent("Import SVG (not undoable)", { name: file.name });
  };

  return (
    <>
      <button
        type="button"
        title="Import SVG"
        onClick={() => inputRef.current?.click()}
        className={ICON_BUTTON_CLASS}
      >
        <FileCode size={17} strokeWidth={1.75} />
      </button>
      <input ref={inputRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => void handleChange(e)} />
    </>
  );
}
