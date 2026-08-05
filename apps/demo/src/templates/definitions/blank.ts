import type { TemplateDefinition } from "../types";

// Doubles as the generic "template editor" case from the requirements: a plain canvas
// with no starter content, same size class as the original demo's default.
export const blank: TemplateDefinition = {
  id: "blank",
  label: "Blank canvas",
  width: 800,
  height: 600,
  backgroundColor: "#ffffff",
  objects: [],
};
