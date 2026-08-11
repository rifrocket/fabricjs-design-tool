import { useEditor } from "@rifrocket/fdt-react";
import type { ReactElement } from "react";
import { requestSave, loadDesignFromStorage } from "@rifrocket/fdt-plugin-local-storage";
import { downloadExport } from "../../utils/downloadExport";
import { useCoverage } from "../../checklist/CoverageContext";
import { AUTOSAVE_STORAGE_KEY } from "../../constants";
import { BUTTON_CLASS } from "../../theme/classNames";

interface PdfExportResult {
  fileName: string;
  mimeType: string;
  data: Blob;
}

export function ToolbarStart(): ReactElement {
  const engine = useEditor();
  const { report } = useCoverage();

  const exportPdf = () => {
    const result = engine.export("pdf") as PdfExportResult;
    if (!(result.data instanceof Blob) || result.data.size === 0) return;
    downloadExport(result);
    report("export-pdf", "pass");
  };

  // A real round trip through the "json" importer registered by plugin-import-json — not just
  // core's own export("json"), which needs no plugin at all.
  const roundTripJson = async () => {
    const result = engine.export("json") as { data: string };
    await engine.importFile("json", JSON.parse(result.data));
    report("import-json", "pass");
  };

  // requestSave() forces an out-of-band write instead of waiting on the plugin's debounce, so
  // this check resolves deterministically instead of racing a timer.
  const verifyAutosave = () => {
    requestSave(engine);
    window.setTimeout(() => {
      const saved = loadDesignFromStorage(AUTOSAVE_STORAGE_KEY);
      report("local-storage", saved ? "pass" : "fail");
    }, 700);
  };

  return (
    <div className="mb-4 flex w-full flex-wrap gap-2 border-b border-fdt-border pb-4">
      <button type="button" className={BUTTON_CLASS} onClick={exportPdf}>
        Export PDF (plugin-export-pdf)
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={() => void roundTripJson()}>
        Round-trip JSON (plugin-import-json)
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={verifyAutosave}>
        Verify autosave (plugin-local-storage)
      </button>
    </div>
  );
}
