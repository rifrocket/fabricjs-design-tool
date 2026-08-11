import { useEffect, useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";
import { ShapePicker } from "@rifrocket/fdt-plugin-shapes-basic-panel";
import { setCanvasZoom, centerContent } from "@rifrocket/fdt-plugin-pan-zoom";
import { generateContentString, validateContent } from "@rifrocket/fdt-plugin-qrcode";
import { importSvgToEngine } from "@rifrocket/fdt-plugin-svg-import";
import { cloneFabricObject } from "@rifrocket/fdt-plugin-clipboard";
import { useCoverage } from "../../checklist/CoverageContext";
import { readFileAsDataUrl } from "../../utils/downloadExport";
import { CANVAS_CONTAINER_SELECTOR, WORKSPACE_WIDTH, WORKSPACE_HEIGHT } from "../../constants";
import { BUTTON_CLASS, SECTION_LABEL_CLASS } from "../../theme/classNames";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="36" fill="#60a5fa" stroke="#1d4ed8" stroke-width="4"/></svg>`;

export function ToolRail(): ReactElement {
  const engine = useEditor();
  const { report } = useCoverage();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    report("shapes-basic-panel", "pass");
  }, [report]);

  const zoom = (delta: number) => {
    const next = engine.viewport.getZoom() + delta;
    setCanvasZoom(engine, next);
    centerContent(engine, WORKSPACE_WIDTH, WORKSPACE_HEIGHT, CANVAS_CONTAINER_SELECTOR);
    report("pan-zoom", "pass");
  };

  const undo = () => {
    if (!engine.history.canUndo()) return;
    engine.history.undo();
    report("core", "pass");
  };

  const redo = () => {
    if (!engine.history.canRedo()) return;
    engine.history.redo();
    report("core", "pass");
  };

  const addQrCode = async () => {
    const data = { url: "https://github.com/rifrocket" };
    if (!validateContent("url", data).isValid) return;
    generateContentString("url", data);
    await engine.addObjectOfType("qrcode", { contentType: "url", contentData: data });
    report("qrcode", "pass");
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    await engine.addObjectOfType("image", { src: dataUrl });
    report("image", "pass");
  };

  const importSampleSvg = async () => {
    await importSvgToEngine(engine, SAMPLE_SVG);
    report("svg-import", "pass");
  };

  const duplicateSelection = async () => {
    const objects = engine.selection.getActiveObjects();
    if (objects.length === 0) return;
    const duplicated = await Promise.all(objects.map((object) => cloneFabricObject(object)));
    duplicated.forEach((object) => engine.addObject(object));
    engine.selection.selectMultiple(duplicated);
    report("clipboard", "pass");
  };

  return (
    <div className="flex w-[250px] shrink-0 flex-col">
      {/* ShapePicker ships deliberately bare/unstyled (see its own README) — left as-is rather
          than reskinned, since that's its real out-of-the-box appearance. */}
      <h3 className={SECTION_LABEL_CLASS}>Shapes (plugin-shapes-basic-panel)</h3>
      <div className="flex flex-wrap gap-1 text-[11px] [&_button]:rounded [&_button]:border [&_button]:border-fdt-border [&_button]:bg-fdt-bg [&_button]:px-1.5 [&_button]:py-0.5 [&_button]:hover:border-fdt-accent">
        <ShapePicker />
      </div>

      <h3 className={SECTION_LABEL_CLASS}>History (core)</h3>
      <div className="flex gap-1.5">
        <button type="button" className={BUTTON_CLASS} onClick={undo}>
          Undo
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={redo}>
          Redo
        </button>
      </div>

      <h3 className={SECTION_LABEL_CLASS}>Zoom (plugin-pan-zoom)</h3>
      <div className="flex gap-1.5">
        <button type="button" className={BUTTON_CLASS} onClick={() => zoom(-0.1)}>
          −
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => zoom(0.1)}>
          +
        </button>
      </div>

      <h3 className={SECTION_LABEL_CLASS}>Add content</h3>
      <div className="flex flex-col items-stretch gap-1.5">
        <button type="button" className={BUTTON_CLASS} onClick={() => void addQrCode()}>
          Add QR code (plugin-qrcode)
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => imageInputRef.current?.click()}>
          Upload image (plugin-image)
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageChange(e)} />
        <button type="button" className={BUTTON_CLASS} onClick={() => void importSampleSvg()}>
          Import sample SVG (plugin-svg-import)
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => void duplicateSelection()}>
          Duplicate selection (plugin-clipboard)
        </button>
      </div>
    </div>
  );
}
