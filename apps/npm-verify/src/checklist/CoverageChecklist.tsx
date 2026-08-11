import type { ReactElement } from "react";
import { PACKAGE_CHECKS } from "./coverage";
import { useCoverage } from "./CoverageContext";
import type { CheckStatus } from "./coverage";

const STATUS_LABEL: Record<CheckStatus, string> = {
  "not-run": "not run",
  pass: "pass",
  fail: "fail",
};

// Opacity-based (not solid pastel + a Tailwind dark: pair): this app's theme is driven entirely
// by data-fdt-theme (see ThemeContext's syncDocumentElement), not the OS-media-query-only
// prefers-color-scheme Tailwind's own dark: variant keys off — apps/demo never uses dark: for
// the same reason. A tint over the current --fdt-bg-elevated reads correctly in both themes
// without needing a second, unwired variant.
const ROW_TONE: Record<CheckStatus, string> = {
  "not-run": "border-fdt-border bg-fdt-bg-elevated",
  pass: "border-green-500/40 bg-green-500/10",
  fail: "border-red-500/40 bg-red-500/10",
};

const DOT_TONE: Record<CheckStatus, string> = {
  "not-run": "bg-fdt-border",
  pass: "bg-green-500",
  fail: "bg-red-500",
};

const STATUS_TEXT_TONE: Record<CheckStatus, string> = {
  "not-run": "text-fdt-fg-muted",
  pass: "text-green-600",
  fail: "text-red-600",
};

// Sections auto-report a row "pass" when their wired action runs without throwing (e.g. a
// button click that resolves engine.addObjectOfType successfully). That's a real but partial
// signal — it proves the export exists and executes, not that the human has looked at the
// canvas and confirmed it looks right. The manual verified/failed buttons here are how a person
// finishes that proof while exercising the app in a browser (see the README's verification
// steps) — every row gets them, not just ones no section can auto-report for.
export function CoverageChecklist(): ReactElement {
  const { statuses, report } = useCoverage();
  const passCount = PACKAGE_CHECKS.filter((c) => statuses[c.id] === "pass").length;

  return (
    <aside className="w-[380px] shrink-0 overflow-y-auto border-l border-fdt-border bg-fdt-bg p-5">
      <h2 className="m-0 mb-3.5 text-[13px] font-bold text-fdt-fg">
        Coverage {passCount}/{PACKAGE_CHECKS.length}
      </h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {PACKAGE_CHECKS.map((check) => {
          const status = statuses[check.id] ?? "not-run";
          return (
            <li
              key={check.id}
              data-testid={`check-${check.id}`}
              data-status={status}
              className={`flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors duration-150 ${ROW_TONE[status]}`}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_TONE[status]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[11px] font-semibold text-fdt-fg">{check.npmName}</div>
                <div className="mt-0.5 text-[11px] text-fdt-fg-muted">{check.proof}</div>
              </div>
              <span className={`mt-0.5 shrink-0 text-[9.5px] font-bold uppercase tracking-wide ${STATUS_TEXT_TONE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  title="Mark verified"
                  onClick={() => report(check.id, "pass")}
                  className="flex h-5 w-5 items-center justify-center rounded border border-fdt-border text-[11px] text-fdt-fg-muted hover:border-green-500 hover:text-green-600"
                >
                  ✓
                </button>
                <button
                  type="button"
                  title="Mark failed"
                  onClick={() => report(check.id, "fail")}
                  className="flex h-5 w-5 items-center justify-center rounded border border-fdt-border text-[11px] text-fdt-fg-muted hover:border-red-500 hover:text-red-600"
                >
                  ✗
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
