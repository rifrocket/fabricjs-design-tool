import type { TemplateDefinition } from "../types";

export const poster: TemplateDefinition = {
  id: "poster",
  label: "Poster",
  width: 500,
  height: 750,
  backgroundColor: "#111827",
  objects: [
    { typeId: "rect", config: { left: 40, top: 40, width: 420, height: 6, fill: "#f59e0b" } },
    {
      typeId: "text",
      text: "EVENT\nTITLE",
      config: { left: 40, top: 90, fontSize: 56, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Saturday, August 15 — Doors at 7pm",
      config: { left: 40, top: 640, fontSize: 18, fontFamily: "Arial", fill: "#f59e0b" },
    },
    { typeId: "circle", config: { left: 340, top: 500, radius: 90, fill: "#1f2937", stroke: "#f59e0b", strokeWidth: 2 } },
  ],
};
