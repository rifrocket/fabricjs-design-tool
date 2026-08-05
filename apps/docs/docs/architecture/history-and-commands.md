---
sidebar_position: 4
title: History & Commands
---

# History & Commands

Undo/redo is built on the **command pattern**, not whole-canvas snapshots. Every mutation stores a small object describing *what changed and how to reverse it*, instead of a full serialized copy of the canvas. This matters because a snapshot-based approach costs memory proportional to total document size on every single edit — the cost gets worse as a document grows, on every undo step, regardless of how small the actual edit was. Command objects instead cost memory proportional to the number of *changes*.

## The `Command` interface

```ts
interface Command {
  label?: string;
  do(): void;
  undo(): void;
  merge?(next: Command): Command | null;
}
```

`@rifrocket/fabricjs-design-tool` ships a handful of built-in commands: `AddObjectCommand`, `RemoveObjectCommand`, `SetPropertyCommand`, and `CompositeCommand` (wraps several commands as one undo step — used internally by `deleteSelection()`, `align()`, and `distribute()`).

## `HistoryManager`

```ts
engine.history.execute(command); // runs command.do(), pushes onto the undo stack
engine.history.undo();           // pops and runs command.undo()
engine.history.redo();
engine.history.canUndo();
engine.history.canRedo();
engine.history.clear();
engine.history.list(); // HistoryEntry[] — { label, timestamp }, oldest first
```

`CanvasEngine`'s own mutation methods (`addObject`, `removeObject`, `setObjectProperty`, `deleteSelection`, `alignment.align()`, `alignment.distribute()`) all go through `engine.history.execute()` internally — there's one mutation path, not a shortcut that bypasses history.

## Merging: why dragging a slider doesn't flood the undo stack

`Command.merge?(next)` is what keeps continuous interactions — dragging a color slider, resizing with a handle — from producing one undo entry per intermediate value. When a new command is executed, `HistoryManager` asks the *previous* command on the stack whether it wants to merge with the incoming one:

```ts
execute(command: Command): void {
  command.do();
  const last = this.undoStack[this.undoStack.length - 1];
  const merged = last?.command.merge?.(command) ?? null;
  if (merged) {
    // replace the last entry instead of pushing a new one
  } else {
    // push as a new undo step
  }
  this.redoStack = []; // any new command clears the redo stack
}
```

`SetPropertyCommand` implements `merge()` so that rapid-fire edits to the *same property on the same object* collapse into a single undo step — dragging a fill-color slider through 40 intermediate values produces one undo entry, not 40.

## `list()` for a history panel

`HistoryManager.list()` returns a read-only, oldest-first view of the current undo stack (`{ label, timestamp }[]`) — this backs `@rifrocket/fdt-plugin-devtools`'s `HistoryPanel` component. Re-read it after anything that mutates the stack (`execute`/`undo`/`redo`); `CanvasEngine` already notifies `canUndo`/`canRedo` through `engine.store` on every one of those calls, which doubles as the signal that it's time to re-read `list()` too.

## Writing your own command

A plugin that needs undo/redo support for a mutation the built-in commands don't cover implements `Command` directly:

```ts
class SetOpacityCommand implements Command {
  label = "Set opacity";
  private previous: number;
  constructor(private object: FabricObject, private next: number) {
    this.previous = object.opacity ?? 1;
  }
  do() {
    this.object.set("opacity", this.next);
  }
  undo() {
    this.object.set("opacity", this.previous);
  }
}

engine.history.execute(new SetOpacityCommand(object, 0.5));
```
