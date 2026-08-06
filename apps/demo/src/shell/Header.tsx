import type { ReactElement } from "react";
import { Menu, Undo2, Redo2 } from "lucide-react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { TemplatePicker } from "../templates/TemplatePicker";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ExportMenu } from "../features/export/ExportMenu";
import { ImportJsonMenu } from "../features/export/ImportJsonMenu";
import { ClearSavedDesignButton } from "../features/persistence/ClearSavedDesignButton";
import { ShortcutsCheatSheet } from "../features/shortcuts/ShortcutsCheatSheet";
import { logUiEvent } from "../dev-tools/uiEventLog";

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function Header({ onTogglePanels }: { onTogglePanels: () => void }): ReactElement {
  const engine = useEngineOrNull();

  return (
    <header className="flex h-14 items-center gap-3 border-b border-fdt-border bg-fdt-bg px-3">
      <div className="flex items-center gap-2 pr-2">
        <span className="flex h-9 w-9 items-center justify-center">
          <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool Logo" className="h-9 w-9" />
        </span>
        <span className="hidden text-sm font-semibold text-fdt-fg sm:inline">FabricJS Design Tool</span>
      </div>

      <div className="h-6 w-px bg-fdt-border" />

      {engine ? <UndoRedoButtonsContent /> : <UndoRedoButtonsSkeleton />}

      <TemplatePicker />

      <div className="flex-1" />

      <div className="hidden items-center gap-1.5 sm:flex">
        {engine ? (
          <>
            <ImportJsonMenu />
            <ClearSavedDesignButton />
            <ShortcutsCheatSheet />
            <ExportMenu />
          </>
        ) : (
          <HeaderActionsSkeleton />
        )}
      </div>

      <ThemeToggle />

      <button type="button" onClick={onTogglePanels} aria-label="Toggle panels" className={`${ICON_BUTTON_CLASS} lg:hidden`}>
        <Menu size={16} strokeWidth={2} />
      </button>
    </header>
  );
}

function UndoRedoButtonsSkeleton(): ReactElement {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" disabled className={ICON_BUTTON_CLASS} title="Undo">
        <Undo2 size={16} strokeWidth={2} />
      </button>
      <button type="button" disabled className={ICON_BUTTON_CLASS} title="Redo">
        <Redo2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

function HeaderActionsSkeleton(): ReactElement {
  return (
    <>
      <div className="h-8 w-8 animate-pulse rounded-lg bg-fdt-border" />
      <div className="h-8 w-8 animate-pulse rounded-lg bg-fdt-border" />
      <div className="h-8 w-20 animate-pulse rounded-lg bg-fdt-border" />
    </>
  );
}

// Split from Header so useEditor()/useEditorState() are only ever called while an engine is
// guaranteed present in context — Header itself renders through the null-engine gap (first
// load, template switches), and swapping between this and the skeleton above is a full
// component swap, not a conditional hook call within one instance.
function UndoRedoButtonsContent(): ReactElement {
  const engine = useEditor();
  const canUndo = useEditorState((state) => state.canUndo);
  const canRedo = useEditorState((state) => state.canRedo);

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        title="Undo"
        disabled={!canUndo}
        onClick={() => {
          engine.undo();
          logUiEvent("Undo");
        }}
        className={ICON_BUTTON_CLASS}
      >
        <Undo2 size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        title="Redo"
        disabled={!canRedo}
        onClick={() => {
          engine.redo();
          logUiEvent("Redo");
        }}
        className={ICON_BUTTON_CLASS}
      >
        <Redo2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
