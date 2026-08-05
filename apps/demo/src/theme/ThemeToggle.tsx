import type { ReactElement } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import type { EditorTheme } from "@rifrocket/fdt-react";
import { useThemeContext } from "./ThemeContext";

const OPTIONS: Array<{ value: EditorTheme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle(): ReactElement {
  const { theme, setTheme } = useThemeContext();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => setTheme(value)}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            theme === value ? "bg-fdt-accent text-white" : "text-fdt-fg-muted hover:bg-fdt-bg hover:text-fdt-fg"
          }`}
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
