import type { TemplateDefinition } from "../types";

export const flyer: TemplateDefinition = {
  id: "flyer",
  label: "Flyer",
  width: 425,
  height: 550,
  backgroundColor: "#ffffff",
  objects: [
    { typeId: "rect", config: { left: 0, top: 0, width: 425, height: 140, fill: "#0f766e" } },
    {
      typeId: "text",
      text: "Community Yard Sale",
      config: { left: 24, top: 45, fontSize: 30, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Everything must go — furniture, books,\nclothes, and more.",
      config: { left: 24, top: 180, fontSize: 16, fontFamily: "Arial", fill: "#111827" },
    },
    {
      typeId: "text",
      text: "This Saturday, 9am–2pm\n123 Maple Street",
      config: { left: 24, top: 460, fontSize: 15, fontFamily: "Arial", fill: "#0f766e", fontWeight: "bold" },
    },
    { typeId: "rounded-rectangle", config: { left: 260, top: 250, width: 140, height: 140, rx: 12, ry: 12, fill: "#ccfbf1" } },
  ],
};
