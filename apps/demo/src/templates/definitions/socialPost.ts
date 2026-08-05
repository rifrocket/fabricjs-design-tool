import type { TemplateDefinition } from "../types";

export const socialPost: TemplateDefinition = {
  id: "social-post",
  label: "Social Media Post",
  width: 540,
  height: 540,
  backgroundColor: "#fef3c7",
  objects: [
    { typeId: "rect", config: { left: 0, top: 0, width: 540, height: 160, fill: "#f59e0b" } },
    {
      typeId: "text",
      text: "New Drop 🔥",
      config: { left: 40, top: 55, fontSize: 40, fontFamily: "Arial", fill: "#ffffff", fontWeight: "bold" },
    },
    {
      typeId: "text",
      text: "Tap the link in bio to shop the collection.",
      config: { left: 40, top: 240, fontSize: 20, fontFamily: "Arial", fill: "#78350f" },
    },
    { typeId: "star", config: { left: 400, top: 380, fill: "#f59e0b" } },
  ],
};
