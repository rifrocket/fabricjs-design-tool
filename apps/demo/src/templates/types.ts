// "Template" here always means a document starting point (size + starter objects), never an
// editor preset (DesignEditor's `preset="default"/"minimal"/"none"` plugin bundles) — don't conflate the two.
export interface TemplateObjectSpec {
  typeId: string;
  config: unknown;
  // Separate from `config`: the "text" object type takes its initial string as a Fabric
  // constructor arg, so overriding template copy goes through a follow-up setObjectProperty call.
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

// The captureMeta shape saved alongside every autosaved design (localStoragePlugin's
// StoredDesign<TMeta>) — lets TemplateContext.tsx pick the initial template/size synchronously
// before first render. Deliberately not named PageMeta: @rifrocket/fdt-plugin-pages has its own,
// unrelated PageMeta (one page of a multi-page document) — this is a single document's
// starter-design metadata.
export interface StarterDesignMeta {
  templateId: string;
  width: number;
  height: number;
}
