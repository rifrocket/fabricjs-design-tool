import type { TemplateDefinition } from "../types";

export const businessCard: TemplateDefinition = {
  id: "business-card",
  label: "Business Card",
  width: 336,
  height: 192,
  backgroundColor: "#ffffff",
  objects: [
    { typeId: "rect", config: { left: 0, top: 0, width: 12, height: 192, fill: "#1d4ed8" } },
    {
      typeId: "text",
      text: "Jordan Rivera",
      config: { left: 32, top: 40, fontSize: 22, fontFamily: "Georgia", fill: "#111827", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Product Designer",
      config: { left: 32, top: 70, fontSize: 13, fontFamily: "Arial", fill: "#6b7280" },
    },
    {
      typeId: "text",
      text: "jordan@example.com  ·  +1 (555) 010-2938",
      config: { left: 32, top: 140, fontSize: 11, fontFamily: "Arial", fill: "#1d4ed8" },
    },
  ],
};
