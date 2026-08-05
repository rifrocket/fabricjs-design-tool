import type { TemplateDefinition } from "../types";

export const certificate: TemplateDefinition = {
  id: "certificate",
  label: "Certificate",
  width: 700,
  height: 500,
  backgroundColor: "#fffdf5",
  objects: [
    {
      typeId: "rect",
      config: { left: 20, top: 20, width: 660, height: 460, fill: "transparent", stroke: "#b45309", strokeWidth: 4 },
    },
    {
      typeId: "text",
      text: "Certificate of Achievement",
      config: { left: 130, top: 90, fontSize: 32, fontFamily: "Georgia", fill: "#78350f", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "This certificate is proudly presented to",
      config: { left: 200, top: 190, fontSize: 15, fontFamily: "Arial", fill: "#57534e" },
    },
    {
      typeId: "text",
      text: "Taylor Morgan",
      config: { left: 220, top: 230, fontSize: 30, fontFamily: "Georgia", fill: "#111827" },
    },
    {
      typeId: "text",
      text: "for outstanding contribution to the 2026 design sprint",
      config: { left: 155, top: 300, fontSize: 14, fontFamily: "Arial", fill: "#57534e" },
    },
  ],
};
