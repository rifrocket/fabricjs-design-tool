import { useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { ChevronLeft, ChevronRight, Copy, ImageOff, Layers, Lock, Pencil, Plus, Trash2, Unlock } from "lucide-react";
import { usePagesContext } from "./usePagesContext";
import type { PageMeta } from "../types";

const ICON_BUTTON_CLASS =
  "flex h-5 w-5 items-center justify-center rounded text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg hover:text-fdt-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const TRAY_BUTTON_CLASS =
  "flex h-11 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-fdt-border text-fdt-fg-muted transition-colors duration-150 hover:border-fdt-accent hover:text-fdt-accent disabled:cursor-not-allowed disabled:opacity-30";

// Batteries-included page strip: add/duplicate/delete/reorder/rename/lock, entirely on top of
// usePagesContext()'s manager API. Reads the real configured cap via manager.getMaxPages()
// rather than a hardcoded constant, so it stays correct for whatever maxPages a consumer passed
// to <MultiPageDesignEditor>/<PagesProvider>.
export function PageTabsBar(): ReactElement {
  const { pages, activePageId, manager } = usePagesContext();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const maxPages = manager.getMaxPages();
  const slotsFree = maxPages - pages.length;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-t border-fdt-border bg-fdt-bg px-2 py-1">
      {pages.map((page, index) => {
        // A paired page's Duplicate/Delete act on the whole pair (both sides), not just this
        // tab — matches the real-world object (one business card, one certificate) rather than
        // leaving an orphaned single-sided page behind.
        const siblingExists = page.pairId
          ? pages.some((other) => other.pairId === page.pairId && other.id !== page.id)
          : false;
        const deleteCount = page.pairId && siblingExists ? 2 : 1;

        return (
          <PageTab
            key={page.id}
            page={page}
            active={page.id === activePageId}
            isRenaming={renamingId === page.id}
            canMoveLeft={index > 0}
            canMoveRight={index < pages.length - 1}
            canDelete={pages.length > deleteCount}
            onActivate={() => void manager.setActivePage(page.id)}
            onDuplicate={() =>
              void (page.pairId ? manager.duplicatePagePair(page.id) : manager.duplicatePage(page.id))
            }
            onDelete={() => (page.pairId ? manager.deletePagePair(page.id) : manager.deletePage(page.id))}
            onStartRename={() => setRenamingId(page.id)}
            onRename={(name) => {
              if (name.trim()) manager.renamePage(page.id, name.trim());
              setRenamingId(null);
            }}
            onMoveLeft={() => manager.reorderPages(index, index - 1)}
            onMoveRight={() => manager.reorderPages(index, index + 1)}
            onToggleLock={() => manager.setLocked(page.id, !page.locked)}
          />
        );
      })}
      <button
        type="button"
        title={pages.length >= maxPages ? `Maximum of ${maxPages} pages reached` : "Add page"}
        disabled={pages.length >= maxPages}
        onClick={() => {
          const page = manager.addPage();
          void manager.setActivePage(page.id);
        }}
        className={TRAY_BUTTON_CLASS}
      >
        <Plus size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        title={slotsFree < 2 ? `Only ${Math.max(slotsFree, 0)} of ${maxPages} page slots remain (a pair needs 2)` : "Add page pair (front + back)"}
        disabled={slotsFree < 2}
        onClick={() => {
          const { front } = manager.addPagePair();
          void manager.setActivePage(front.id);
        }}
        className={TRAY_BUTTON_CLASS}
      >
        <Layers size={16} strokeWidth={2} />
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
      className={`group flex shrink-0 flex-col gap-1 rounded-lg border p-1.5 transition-colors duration-150 ${
        active
          ? "border-fdt-accent bg-fdt-accent/10"
          : "border-fdt-border bg-fdt-bg-elevated/40 hover:border-fdt-fg-muted hover:bg-fdt-bg-elevated"
      }`}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-current={active}
        className="relative flex h-11 w-16 items-center justify-center overflow-hidden rounded bg-fdt-bg-elevated"
      >
        {page.thumbnail ? (
          <img src={page.thumbnail} alt={`${page.name} thumbnail`} className="h-full w-full object-contain" />
        ) : (
          <ImageOff size={14} strokeWidth={1.5} className="text-fdt-fg-muted/50" />
        )}

        {/* A corner badge, not a joined-container treatment around both tabs — reordering stays
            free-form (pairs are only guaranteed adjacent at creation time), so a "tuck front+back
            into one card" visual would be wrong once a pair is separated. This stays correct at
            any order. */}
        {page.pairSide && (
          <span
            title={`Part of a front/back pair (${page.pairSide})`}
            className="absolute right-0.5 top-0.5 rounded bg-fdt-accent/90 px-1 py-px text-[7px] font-semibold uppercase leading-none tracking-wide text-white"
          >
            {page.pairSide.charAt(0)}
          </span>
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
          className="w-16 rounded border border-fdt-accent bg-fdt-bg px-1 text-[10px] text-fdt-fg outline-none"
        />
      ) : (
        <span className="w-16 truncate text-center text-[10px] text-fdt-fg" title={page.name}>
          {page.name}
        </span>
      )}

      <div className="flex items-center justify-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button type="button" title="Move left" disabled={!canMoveLeft} onClick={onMoveLeft} className={ICON_BUTTON_CLASS}>
          <ChevronLeft size={10} strokeWidth={2} />
        </button>
        <button type="button" title="Rename" onClick={onStartRename} className={ICON_BUTTON_CLASS}>
          <Pencil size={10} strokeWidth={2} />
        </button>
        <button type="button" title={page.pairId ? "Duplicate pair" : "Duplicate"} onClick={onDuplicate} className={ICON_BUTTON_CLASS}>
          <Copy size={10} strokeWidth={2} />
        </button>
        <button
          type="button"
          title={page.locked ? "Unlock page" : "Lock page"}
          onClick={onToggleLock}
          className={ICON_BUTTON_CLASS}
        >
          {page.locked ? <Lock size={10} strokeWidth={2} /> : <Unlock size={10} strokeWidth={2} />}
        </button>
        <button
          type="button"
          title={
            !canDelete
              ? "Cannot delete the last page"
              : page.pairId
                ? "Delete pair (front & back)"
                : "Delete page"
          }
          disabled={!canDelete}
          onClick={onDelete}
          className={ICON_BUTTON_CLASS}
        >
          <Trash2 size={10} strokeWidth={2} />
        </button>
        <button type="button" title="Move right" disabled={!canMoveRight} onClick={onMoveRight} className={ICON_BUTTON_CLASS}>
          <ChevronRight size={10} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
