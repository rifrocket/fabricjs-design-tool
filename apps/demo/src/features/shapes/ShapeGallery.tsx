import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { Shapes, Search, X, Grid3x3 } from "lucide-react";
import { useEditor, useFocusTrap } from "@rifrocket/fdt-react";
import { SHAPE_CATALOG, SHAPE_CATEGORIES } from "./shapeCatalog";
import type { ShapeCategory } from "./shapeCatalog";
import { InfoTooltip } from "../../docs/InfoTooltip";

type CategoryFilter = ShapeCategory | "all";

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// A searchable, categorized shape picker (rather than a flat icon rail) — every shape type
// registered by @rifrocket/fdt-plugin-shapes-basic is addressable here via engine.addObjectOfType,
// the same call any consumer would make from their own shape-picker UI.
export function ShapeGallery(): ReactElement {
  const engine = useEditor();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  // Stable reference — see QRCodeDialog.tsx for why an inline arrow function here would break
  // typing in the search box below (this component re-renders on every keystroke too).
  const handleEscape = useCallback(() => setOpen(false), []);
  const containerRef = useFocusTrap<HTMLDivElement>({ active: open, onEscape: handleEscape });

  const filtered = SHAPE_CATALOG.filter(
    (entry) =>
      (category === "all" || entry.category === category) && entry.label.toLowerCase().includes(search.toLowerCase()),
  );

  const countFor = (id: CategoryFilter) =>
    id === "all" ? SHAPE_CATALOG.length : SHAPE_CATALOG.filter((entry) => entry.category === id).length;

  const addShape = (typeId: string) => {
    void engine.addObjectOfType(typeId, {});
    setOpen(false);
  };

  const close = () => {
    setOpen(false);
    setSearch("");
    setCategory("all");
  };

  return (
    <>
      <button type="button" title="Shapes" onClick={() => setOpen(true)} className={ICON_BUTTON_CLASS}>
        <Shapes size={17} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Choose a shape"
            className="fdt-animate-scale-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-fdt-border bg-fdt-bg shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-fdt-border p-4">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-fdt-fg">Choose a Shape</h2>
                <InfoTooltip featureKey="shapes" />
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="border-b border-fdt-border p-4">
              <div className="relative">
                <Search size={15} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fdt-fg-muted" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search shapes..."
                  className="w-full rounded-lg border border-fdt-border bg-fdt-bg-elevated py-2 pl-9 pr-3 text-sm text-fdt-fg outline-none focus:border-fdt-accent"
                />
              </div>
            </div>

            <div className="grid flex-1 grid-cols-[160px_1fr] overflow-hidden">
              <nav className="flex flex-col gap-0.5 overflow-y-auto border-r border-fdt-border p-2">
                <CategoryButton
                  label="All Shapes"
                  count={countFor("all")}
                  active={category === "all"}
                  icon={<Grid3x3 size={15} strokeWidth={2} />}
                  onClick={() => setCategory("all")}
                />
                {SHAPE_CATEGORIES.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    label={cat.label}
                    count={countFor(cat.id)}
                    active={category === cat.id}
                    onClick={() => setCategory(cat.id)}
                  />
                ))}
              </nav>

              <div className="overflow-y-auto p-4">
                {filtered.length === 0 ? (
                  <p className="text-sm text-fdt-fg-muted">No shapes match "{search}".</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {filtered.map((shape) => (
                      <button
                        key={shape.typeId}
                        type="button"
                        onClick={() => addShape(shape.typeId)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-3 text-fdt-fg transition-colors duration-150 hover:border-fdt-accent hover:bg-fdt-bg"
                      >
                        <shape.Icon size={26} strokeWidth={1.5} className={shape.iconClassName} />
                        <span className="text-[11px] leading-tight text-fdt-fg-muted">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-fdt-border px-4 py-2.5 text-xs text-fdt-fg-muted">
              Select a shape to add it to your canvas.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryButton({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  icon?: ReactElement;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
        active ? "bg-fdt-accent/10 text-fdt-accent" : "text-fdt-fg hover:bg-fdt-bg-elevated"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <span className="text-[11px] text-fdt-fg-muted">{count}</span>
    </button>
  );
}
