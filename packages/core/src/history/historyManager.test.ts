import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { HistoryManager } from "./historyManager";
import { SetPropertyCommand } from "./setPropertyCommand";
import { CompositeCommand } from "./command";

describe("HistoryManager", () => {
  it("applies a command immediately on execute", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();

    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));

    expect(rect.fill).toBe("blue");
  });

  it("undoes back to the previous value and redoes forward again", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();
    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));

    history.undo();
    expect(rect.fill).toBe("red");

    history.redo();
    expect(rect.fill).toBe("blue");
  });

  it("clears the redo stack once a new command is executed", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();
    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));
    history.undo();

    history.execute(SetPropertyCommand.capture(rect, "fill", "green"));

    expect(history.canRedo()).toBe(false);
    expect(rect.fill).toBe("green");
  });

  it("reports canUndo/canRedo accurately as the stacks change", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));
    expect(history.canUndo()).toBe(true);

    history.undo();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it("merges consecutive commands on the same target/key into one undo step", () => {
    const rect = new Rect({ left: 0 });
    const history = new HistoryManager();

    history.execute(SetPropertyCommand.capture(rect, "left", 10));
    history.execute(SetPropertyCommand.capture(rect, "left", 20));
    history.execute(SetPropertyCommand.capture(rect, "left", 30));

    expect(rect.left).toBe(30);
    history.undo();
    expect(rect.left).toBe(0);
    expect(history.canUndo()).toBe(false);
  });

  it("discards the oldest entries once maxSize is exceeded", () => {
    const rect = new Rect({ left: 0 });
    const history = new HistoryManager({ maxSize: 2 });

    history.execute(SetPropertyCommand.capture(rect, "top", 1));
    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));
    history.execute(SetPropertyCommand.capture(rect, "stroke", "black"));

    history.undo();
    history.undo();
    expect(history.canUndo()).toBe(false);
    expect(rect.top).toBe(1);
  });

  it("lists undoable entries oldest-first with a label and timestamp each", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();

    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));
    history.execute(new CompositeCommand([SetPropertyCommand.capture(rect, "stroke", "black")], "delete"));

    const entries = history.list();
    expect(entries).toHaveLength(2);
    expect(entries[0].label).toBe("Set fill");
    expect(entries[1].label).toBe("delete");
    expect(entries.every((entry) => Number.isFinite(entry.timestamp))).toBe(true);
  });

  it("drops an entry from list() once it's undone, and restores it once redone", () => {
    const rect = new Rect({ fill: "red" });
    const history = new HistoryManager();
    history.execute(SetPropertyCommand.capture(rect, "fill", "blue"));

    history.undo();
    expect(history.list()).toHaveLength(0);

    history.redo();
    expect(history.list()).toHaveLength(1);
  });

  it("runs a CompositeCommand's sub-commands in order and undoes them in reverse", () => {
    const a = new Rect({ fill: "red" });
    const b = new Rect({ fill: "red" });
    const history = new HistoryManager();
    const composite = new CompositeCommand([
      SetPropertyCommand.capture(a, "fill", "blue"),
      SetPropertyCommand.capture(b, "fill", "green"),
    ]);

    history.execute(composite);
    expect(a.fill).toBe("blue");
    expect(b.fill).toBe("green");

    history.undo();
    expect(a.fill).toBe("red");
    expect(b.fill).toBe("red");
  });
});
