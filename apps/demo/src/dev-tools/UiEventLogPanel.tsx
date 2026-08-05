import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { getUiEventLog, subscribeUiEventLog } from "./uiEventLog";
import type { UiEventLogEntry } from "./uiEventLog";
import { InfoTooltip } from "../docs/InfoTooltip";

// Complements @rifrocket/fdt-plugin-devtools's EventLogPanel/HistoryPanel: covers only the
// non-undoable UI/lifecycle events with no engine.history.list() representation — see uiEventLog.ts.
export function UiEventLogPanel(): ReactElement {
  const [entries, setEntries] = useState<UiEventLogEntry[]>(getUiEventLog());

  useEffect(() => subscribeUiEventLog(setEntries), []);

  const rows = entries.slice().reverse();

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
        UI events
        <InfoTooltip featureKey="events" />
      </div>
      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {rows.length === 0 && <p className="text-xs text-fdt-fg-muted">No UI events yet.</p>}
        {rows.map((entry) => (
          <li key={entry.id} className="flex items-center gap-1.5 rounded border border-fdt-border bg-fdt-bg px-1.5 py-1 text-xs">
            <span className="flex-1 truncate text-fdt-fg">{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
