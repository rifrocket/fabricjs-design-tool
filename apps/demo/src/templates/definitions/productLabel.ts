import type { TemplateDefinition } from "../types";

export const productLabel: TemplateDefinition = {
  id: "product-label",
  label: "Product Label",
  width: 300,
  height: 200,
  backgroundColor: "#ffffff",
  objects: [
    {
      typeId: "rounded-rectangle",
      config: { left: 10, top: 10, width: 280, height: 180, rx: 10, ry: 10, fill: "transparent", stroke: "#166534", strokeWidth: 2 },
    },
    {
      typeId: "text",
      text: "ORGANIC HONEY",
      config: { left: 35, top: 40, fontSize: 20, fontFamily: "Georgia", fill: "#166534", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Net Wt. 12 oz (340g)",
      config: { left: 35, top: 100, fontSize: 12, fontFamily: "Arial", fill: "#3f3f46" },
    },
    { typeId: "diamond", config: { left: 220, top: 120, fill: "#166534" } },
  ],
};
