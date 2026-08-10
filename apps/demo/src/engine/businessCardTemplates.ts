import type { TemplateDefinition } from "@rifrocket/fdt-plugin-pages";

// Real business-card dimensions at 300dpi (3.5in x 2in), demonstrating addPagePair()'s
// per-side templateId + shared-dimensions behavior end-to-end: the back page is pinned to the
// front page's *resolved* size (from its own template), so only the front template needs to
// declare width/height — see PagesManager.addPagePair()'s own doc comment.
export const BUSINESS_CARD_FRONT: TemplateDefinition = {
  id: "business-card-front",
  label: "Business Card — Front",
  width: 1050,
  height: 600,
  backgroundColor: "#ffffff",
  objects: [
    { typeId: "rect", config: { left: 0, top: 0, width: 36, height: 600, fill: "#1d4ed8" } },
    {
      typeId: "text",
      text: "Jordan Rivera",
      config: { left: 96, top: 120, fontSize: 64, fontFamily: "Georgia", fill: "#111827", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Product Designer",
      config: { left: 96, top: 210, fontSize: 38, fontFamily: "Arial", fill: "#6b7280" },
    },
    {
      typeId: "text",
      text: "jordan@example.com  ·  +1 (555) 010-2938",
      config: { left: 96, top: 440, fontSize: 32, fontFamily: "Arial", fill: "#1d4ed8" },
    },
  ],
};

export const BUSINESS_CARD_BACK: TemplateDefinition = {
  id: "business-card-back",
  label: "Business Card — Back",
  width: 1050,
  height: 600,
  backgroundColor: "#1d4ed8",
  objects: [
    {
      typeId: "text",
      text: "ACME CO.",
      config: { left: 340, top: 250, fontSize: 72, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Design that ships",
      config: { left: 340, top: 340, fontSize: 30, fontFamily: "Arial", fill: "#dbeafe" },
    },
  ],
};
