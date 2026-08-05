import type { ReactElement } from "react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";

// Reads engine.history.list() directly — a real read of the undo stack, not a demo-recorded
// parallel log. Re-renders on canUndo/canRedo changes since CanvasEngine notifies the store
// on every history mutation (execute/undo/redo/clear).
export function HistoryPanel(): ReactElement {
  const engine = useEditor();
  useEditorState((state) => state.canUndo);
  useEditorState((state) => state.canRedo);
  const entries = engine.history.list();

  return (
    <div>
      <p>History</p>
      <ol>
        {entries.length === 0 && <li>Nothing to undo yet.</li>}
        {entries.map((entry, index) => (
          <li key={`${entry.timestamp}-${index}`}>{entry.label}</li>
        ))}
      </ol>
    </div>
  );
}
