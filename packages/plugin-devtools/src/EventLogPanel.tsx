import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";

interface LogRow {
  id: string;
  label: string;
  timestamp: number;
}

const MAX_EVENTS = 100;

// engine.events subscriptions live only as long as this component is mounted. CanvasEngine
// currently only ever emits "objects:changed" and "selection:changed" — this is intentionally
// the full event surface, not a partial list.
export function EventLogPanel(): ReactElement {
  const engine = useEditor();
  const [rows, setRows] = useState<LogRow[]>([]);

  useEffect(() => {
    const push = (label: string) => (payload: unknown) => {
      setRows((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random()}`,
            label: `${label} (${Array.isArray(payload) ? payload.length : 0})`,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, MAX_EVENTS),
      );
    };
    const offObjects = engine.events.on("objects:changed", push("objects:changed"));
    const offSelection = engine.events.on("selection:changed", push("selection:changed"));
    return () => {
      offObjects();
      offSelection();
    };
  }, [engine]);

  return (
    <div>
      <p>Event log</p>
      <ul>
        {rows.length === 0 && <li>No events yet.</li>}
        {rows.map((row) => (
          <li key={row.id}>{row.label}</li>
        ))}
      </ul>
    </div>
  );
}
