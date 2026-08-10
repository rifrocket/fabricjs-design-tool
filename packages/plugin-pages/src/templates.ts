import type { CanvasEngine, ObjectTypeId } from "@rifrocket/fabricjs-design-tool";

export interface TemplateObjectSpec {
  typeId: ObjectTypeId;
  config: unknown;
  // Applied via engine.setObjectProperty() after creation rather than baked into `config`, since
  // not every object type has a settable "text" property at creation time.
  text?: string;
}

export interface TemplateDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  backgroundColor?: string;
  objects?: TemplateObjectSpec[];
}

// Seeds a freshly created page's engine with a template's starter content. Same
// addObjectOfType()+setObjectProperty("text", ...) sequence apps/demo's EngineHost.tsx already
// runs once per session for its single template — lifted here so PagesManager can run it per
// page instead, whenever a page's own engine is created with a templateId set (see
// PagesManager.getOrCreateEngine).
export async function applyTemplateToEngine(engine: CanvasEngine, template: TemplateDefinition): Promise<void> {
  if (template.backgroundColor) {
    engine.setBackgroundColor(template.backgroundColor);
  }
  for (const spec of template.objects ?? []) {
    const object = await engine.addObjectOfType(spec.typeId, spec.config);
    if (spec.text !== undefined) {
      engine.setObjectProperty(object, "text", spec.text);
    }
  }
  // Template content is starter content, not a user edit — it shouldn't be undoable away the
  // instant a page opens. This engine was just created (see caller), so there's nothing else in
  // its history to lose. history.clear() doesn't notify the store, so canUndo/canRedo are
  // resynced by hand — same two steps EngineHost.tsx takes after seeding.
  engine.history.clear();
  engine.store.setState({ canUndo: engine.history.canUndo(), canRedo: engine.history.canRedo() });
}
