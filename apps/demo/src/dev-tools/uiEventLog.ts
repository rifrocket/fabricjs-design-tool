const MAX_ENTRIES = 200;

export interface UiEventLogEntry {
  id: number;
  label: string;
  meta?: Record<string, unknown>;
  timestamp: number;
}

// Covers only non-undoable UI/lifecycle events with no representation in engine.history.list()
// (z-order, snapping, resize, import/export, undo/redo, tool activation, template load) —
// command-backed events are covered by @rifrocket/fdt-plugin-devtools's HistoryPanel instead.
// Module-singleton pub/sub so any feature file can call logUiEvent() without prop-drilling a logger.
let counter = 0;
let entries: UiEventLogEntry[] = [];
const listeners = new Set<(entries: UiEventLogEntry[]) => void>();

export function logUiEvent(label: string, meta?: Record<string, unknown>): void {
  counter += 1;
  const entry: UiEventLogEntry = { id: counter, label, meta, timestamp: Date.now() };
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  listeners.forEach((listener) => listener(entries));
}

export function getUiEventLog(): UiEventLogEntry[] {
  return entries;
}

export function subscribeUiEventLog(listener: (entries: UiEventLogEntry[]) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
