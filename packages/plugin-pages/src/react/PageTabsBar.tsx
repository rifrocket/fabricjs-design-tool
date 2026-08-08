import { useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { ChevronLeft, ChevronRight, Copy, Lock, Pencil, Plus, Trash2, Unlock } from "lucide-react";
import { usePagesContext } from "./usePagesContext";
import type { PageMeta } from "../types";

const ICON_BUTTON_CLASS =
  "flex h-4 w-4 items-center justify-center rounded text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg hover:text-fdt-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

// Batteries-included page strip: add/duplicate/delete/reorder/rename/lock, entirely on top of
// usePagesContext()'s manager API. Reads the real configured cap via manager.getMaxPages()
// rather than a hardcoded constant, so it stays correct for whatever maxPages a consumer passed
// to <MultiPageDesignEditor>/<PagesProvider>.
export function PageTabsBar(): ReactElement {
  const { pages, activePageId, manager } = usePagesContext();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const maxPages = manager.getMaxPages();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-t border-fdt-border bg-fdt-bg px-2 py-1">
      {pages.map((page, index) => (
        <PageTab
          key={page.id}
          page={page}
          active={page.id === activePageId}
          isRenaming={renamingId === page.id}
          canMoveLeft={index > 0}
          canMoveRight={index < pages.length - 1}
          canDelete={pages.length > 1}
          onActivate={() => void manager.setActivePage(page.id)}
          onDuplicate={() => void manager.duplicatePage(page.id)}
          onDelete={() => manager.deletePage(page.id)}
          onStartRename={() => setRenamingId(page.id)}
          onRename={(name) => {
            if (name.trim()) manager.renamePage(page.id, name.trim());
            setRenamingId(null);
          }}
          onMoveLeft={() => manager.reorderPages(index, index - 1)}
          onMoveRight={() => manager.reorderPages(index, index + 1)}
          onToggleLock={() => manager.setLocked(page.id, !page.locked)}
        />
      ))}
      <button
        type="button"
        title={pages.length >= maxPages ? `Maximum of ${maxPages} pages reached` : "Add page"}
        disabled={pages.length >= maxPages}
        onClick={() => {
          const page = manager.addPage();
          void manager.setActivePage(page.id);
        }}
        className="flex h-9 w-11 shrink-0 items-center justify-center rounded-md border border-dashed border-fdt-border text-fdt-fg-muted transition-colors duration-150 hover:border-fdt-accent hover:text-fdt-accent disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function PageTab({
  page,
  active,
  isRenaming,
  canMoveLeft,
  canMoveRight,
  canDelete,
  onActivate,
  onDuplicate,
  onDelete,
  onStartRename,
  onRename,
  onMoveLeft,
  onMoveRight,
  onToggleLock,
}: {
  page: PageMeta;
  active: boolean;
  isRenaming: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canDelete: boolean;
  onActivate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onRename: (name: string) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onToggleLock: () => void;
}): ReactElement {
  const [draftName, setDraftName] = useState(page.name);

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onRename(draftName);
    if (event.key === "Escape") onRename(page.name);
  };

  return (
    <div
      className={`group flex shrink-0 flex-col gap-0.5 rounded-md border p-1 transition-colors duration-150 ${
        active ? "border-fdt-accent bg-fdt-accent/10" : "border-fdt-border hover:border-fdt-fg-muted"
      }`}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-current={active}
        className="flex h-9 w-14 items-center justify-center overflow-hidden rounded bg-fdt-bg-elevated"
      >
        {page.thumbnail ? (
          <img src={page.thumbnail} alt={`${page.name} thumbnail`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-[8px] text-fdt-fg-muted">No preview</span>
        )}
      </button>

      {isRenaming ? (
        <input
          autoFocus
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={() => onRename(draftName)}
          onKeyDown={handleRenameKeyDown}
          className="w-14 rounded border border-fdt-accent bg-fdt-bg px-1 text-[9px] text-fdt-fg outline-none"
        />
      ) : (
        <span className="w-14 truncate text-center text-[9px] text-fdt-fg" title={page.name}>
          {page.name}
        </span>
      )}

      <div className="flex items-center justify-center gap-px opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button type="button" title="Move left" disabled={!canMoveLeft} onClick={onMoveLeft} className={ICON_BUTTON_CLASS}>
          <ChevronLeft size={9} strokeWidth={2} />
        </button>
        <button type="button" title="Rename" onClick={onStartRename} className={ICON_BUTTON_CLASS}>
          <Pencil size={9} strokeWidth={2} />
        </button>
        <button type="button" title="Duplicate" onClick={onDuplicate} className={ICON_BUTTON_CLASS}>
          <Copy size={9} strokeWidth={2} />
        </button>
        <button
          type="button"
          title={page.locked ? "Unlock page" : "Lock page"}
          onClick={onToggleLock}
          className={ICON_BUTTON_CLASS}
        >
          {page.locked ? <Lock size={9} strokeWidth={2} /> : <Unlock size={9} strokeWidth={2} />}
        </button>
        <button
          type="button"
          title={canDelete ? "Delete page" : "Cannot delete the last page"}
          disabled={!canDelete}
          onClick={onDelete}
          className={ICON_BUTTON_CLASS}
        >
          <Trash2 size={9} strokeWidth={2} />
        </button>
        <button type="button" title="Move right" disabled={!canMoveRight} onClick={onMoveRight} className={ICON_BUTTON_CLASS}>
          <ChevronRight size={9} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
