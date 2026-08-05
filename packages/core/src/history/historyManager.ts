import type { Command } from "./command";

export interface HistoryManagerOptions {
  maxSize?: number;
}

export interface HistoryEntry {
  label: string;
  timestamp: number;
}

const DEFAULT_MAX_SIZE = 100;
const DEFAULT_LABEL = "Change";

interface StackEntry {
  command: Command;
  timestamp: number;
}

// Command-pattern undo/redo: stores deltas instead of whole-document snapshots.
export class HistoryManager {
  private readonly maxSize: number;
  private undoStack: StackEntry[] = [];
  private redoStack: StackEntry[] = [];

  constructor(options: HistoryManagerOptions = {}) {
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  }

  execute(command: Command): void {
    command.do();

    const last = this.undoStack[this.undoStack.length - 1];
    const merged = last?.command.merge?.(command) ?? null;
    if (merged) {
      this.undoStack[this.undoStack.length - 1] = { command: merged, timestamp: last.timestamp };
    } else {
      this.undoStack.push({ command, timestamp: Date.now() });
      if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    }

    this.redoStack = [];
  }

  undo(): boolean {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    entry.command.undo();
    this.redoStack.push(entry);
    return true;
  }

  redo(): boolean {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    entry.command.do();
    this.undoStack.push(entry);
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  // Read-only view of what can currently be undone, oldest first, for a history-panel UI.
  // Re-derive on the same signal as canUndo/canRedo (CanvasEngine notifies both through the
  // store on every execute/undo/redo).
  list(): HistoryEntry[] {
    return this.undoStack.map(({ command, timestamp }) => ({
      label: command.label ?? DEFAULT_LABEL,
      timestamp,
    }));
  }
}
