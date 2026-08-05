import type { TemplateDefinition } from "../types";

export const logo: TemplateDefinition = {
  id: "logo",
  label: "Logo",
  width: 400,
  height: 400,
  backgroundColor: "#ffffff",
  objects: [
    { typeId: "circle", config: { left: 100, top: 60, radius: 100, fill: "#4c1d95" } },
    { typeId: "hexagon", config: { left: 130, top: 90, fill: "#a78bfa" } },
    {
      typeId: "text",
      text: "AV",
      config: { left: 165, top: 145, fontSize: 44, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "AVENUE STUDIO",
      config: { left: 90, top: 300, fontSize: 18, fontFamily: "Arial", fill: "#4c1d95", fontWeight: "bold" },
    },
  ],
};
