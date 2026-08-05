import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import type { FabricObject } from "fabric";
import { cloneFabricObject } from "./cloneFabricObject";

const NUDGE_STEP = 1;
const NUDGE_STEP_LARGE = 10;

// Copy/paste/duplicate/select-all/nudge have no equivalent anywhere in @rifrocket/fabricjs-design-tool —
// this plugin builds them entirely from public API (engine.selection, engine.shortcuts,
// engine.addObject, engine.setObjectProperty, Fabric's own object.clone()). Group/ungroup
// already exist on SelectionManager; this just wires shortcuts to them.
export const clipboardPlugin: EditorPlugin = {
  name: "clipboard",
  install(engine) {
    let clipboard: FabricObject[] = [];
    let pasteCount = 0;

    const register = (combo: string, handler: () => void, description: string) =>
      engine.shortcuts.register(combo, handler, description);

    register(
      "ctrl+c",
      async () => {
        const active = engine.selection.getActiveObjects();
        if (active.length === 0) return;
        clipboard = await Promise.all(active.map((object) => object.clone()));
        pasteCount = 0;
      },
      "Copy selection",
    );

    register(
      "ctrl+v",
      async () => {
        if (clipboard.length === 0) return;
        pasteCount += 1;
        const pasted = await Promise.all(clipboard.map((object) => cloneFabricObject(object, 20 * pasteCount)));
        pasted.forEach((object) => engine.addObject(object));
        engine.selection.selectMultiple(pasted);
      },
      "Paste",
    );

    register(
      "ctrl+d",
      async () => {
        const active = engine.selection.getActiveObjects();
        if (active.length === 0) return;
        const duplicated = await Promise.all(active.map((object) => cloneFabricObject(object)));
        duplicated.forEach((object) => engine.addObject(object));
        engine.selection.selectMultiple(duplicated);
      },
      "Duplicate selection",
    );

    register("ctrl+g", () => engine.selection.group(), "Group selection");
    register("ctrl+shift+g", () => engine.selection.ungroup(), "Ungroup selection");

    register(
      "ctrl+a",
      () => {
        engine.selection.selectMultiple(engine.layers.getObjects());
      },
      "Select all objects",
    );

    const nudge = (dx: number, dy: number) => {
      const active = engine.selection.getActiveObjects();
      active.forEach((object) => {
        if (dx !== 0) engine.setObjectProperty(object, "left", (object.left ?? 0) + dx);
        if (dy !== 0) engine.setObjectProperty(object, "top", (object.top ?? 0) + dy);
      });
    };

    register("arrowup", () => nudge(0, -NUDGE_STEP), "Nudge up");
    register("arrowdown", () => nudge(0, NUDGE_STEP), "Nudge down");
    register("arrowleft", () => nudge(-NUDGE_STEP, 0), "Nudge left");
    register("arrowright", () => nudge(NUDGE_STEP, 0), "Nudge right");
    register("shift+arrowup", () => nudge(0, -NUDGE_STEP_LARGE), "Nudge up (large step)");
    register("shift+arrowdown", () => nudge(0, NUDGE_STEP_LARGE), "Nudge down (large step)");
    register("shift+arrowleft", () => nudge(-NUDGE_STEP_LARGE, 0), "Nudge left (large step)");
    register("shift+arrowright", () => nudge(NUDGE_STEP_LARGE, 0), "Nudge right (large step)");
  },
};
