import { useEffect } from "react";
import type { ReactElement } from "react";
import { useEditor, useEditorState, PropertiesPanel, LayersPanel } from "@rifrocket/fdt-react";
import { resolveObjectTypeId, getEffectStack } from "@rifrocket/fabricjs-design-tool";
import { AlignmentControls } from "@rifrocket/fdt-plugin-alignment";
import { SnappingToggle } from "@rifrocket/fdt-plugin-snapping";
import { EffectsPanel } from "@rifrocket/fdt-plugin-effects-panel";
import { CanvasStateViewer, HistoryPanel, PerformanceStats } from "@rifrocket/fdt-plugin-devtools";
import { BASIC_SHAPE_TYPE_IDS } from "@rifrocket/fdt-plugin-shapes-basic-panel";
import { useCoverage } from "../../checklist/CoverageContext";
import { SECTION_LABEL_CLASS, BARE_BUTTONS_CLASS, BARE_LIST_CLASS } from "../../theme/classNames";

const BASIC_SHAPE_TYPE_ID_SET: ReadonlySet<string> = new Set(BASIC_SHAPE_TYPE_IDS);

// Watches selection/property changes to auto-report packages whose "it worked" signal isn't a
// single button click but a side effect of using another package's UI (PropertiesPanel showing
// real fields once something is selected; the effects stack growing once EffectsPanel is used).
function SelectionWatchers(): null {
  const engine = useEditor();
  const selectedIds = useEditorState((state) => state.selectedObjectIds);
  const propertyVersion = useEditorState((state) => state.propertyVersion);
  const { report } = useCoverage();

  // Deps must be the actual reactive values read below (selectedIds/propertyVersion), not an
  // omitted array — report() writes to CoverageContext, whose provider wraps the whole app, so
  // an unconditional re-run here re-fires on every unrelated report() elsewhere too, which
  // itself re-renders this component: an immediate infinite loop while anything stays selected.
  useEffect(() => {
    if (selectedIds.length === 0) return;
    report("properties", "pass");
    const [object] = engine.selection.getActiveObjects();
    if (!object) return;
    const typeId = resolveObjectTypeId(object);
    if (typeId === "image" || typeId === "qrcode") report("media-fields", "pass");
    if (BASIC_SHAPE_TYPE_ID_SET.has(typeId)) report("shapes-basic", "pass");
    if (getEffectStack(object).length > 0) report("effects", "pass");
  }, [selectedIds, propertyVersion, engine, report]);

  return null;
}

export function SidebarRight(): ReactElement {
  const { report } = useCoverage();

  useEffect(() => {
    report("alignment", "pass");
    report("snapping", "pass");
    report("effects-panel", "pass");
    report("devtools", "pass");
  }, [report]);

  return (
    <div className="flex min-w-[340px] flex-1 flex-col">
      <SelectionWatchers />

      <h3 className={SECTION_LABEL_CLASS}>Layers &amp; properties (@rifrocket/fdt-react)</h3>
      {/* LayersPanel ships bare (no classNames); PropertiesPanel ships real Tailwind classes. */}
      <div className={BARE_LIST_CLASS}>
        <LayersPanel />
      </div>
      {/* PropertiesPanel itself already returns null with nothing selected (confirmed: 0 DOM
          nodes) — has-[>*]:mt-3 keeps this wrapper from reserving a visible gap while it's empty,
          rather than collapsing the "hides" behavior into a subtler "still takes up space" one. */}
      <div className="has-[>*]:mt-3">
        <PropertiesPanel />
      </div>

      <h3 className={SECTION_LABEL_CLASS}>Align &amp; distribute (plugin-alignment)</h3>
      <div className={BARE_BUTTONS_CLASS}>
        <AlignmentControls />
      </div>

      <h3 className={SECTION_LABEL_CLASS}>Snapping (plugin-snapping)</h3>
      <div className={BARE_BUTTONS_CLASS}>
        <SnappingToggle />
      </div>

      <h3 className={SECTION_LABEL_CLASS}>Effects (plugin-effects / plugin-effects-panel)</h3>
      <EffectsPanel />

      <h3 className={SECTION_LABEL_CLASS}>Devtools (plugin-devtools)</h3>
      <div className={`flex flex-col gap-3 ${BARE_LIST_CLASS}`}>
        <CanvasStateViewer />
        <HistoryPanel />
        <PerformanceStats />
      </div>
    </div>
  );
}
