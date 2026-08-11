import type { ReactElement } from "react";
import type { EditorTheme } from "@rifrocket/fdt-react";
import { useTheme } from "./ThemeContext";
import { useCoverage } from "../checklist/CoverageContext";

const OPTIONS: Array<{ value: EditorTheme; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
  { value: "system", label: "System", icon: "◐" },
];

export function ThemeToggle(): ReactElement {
  const { theme, setTheme } = useTheme();
  const { report } = useCoverage();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-0.5"
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => {
            setTheme(value);
            report("theme", "pass");
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors duration-150 ${
            theme === value ? "bg-fdt-accent text-white" : "text-fdt-fg-muted hover:bg-fdt-bg hover:text-fdt-fg"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
