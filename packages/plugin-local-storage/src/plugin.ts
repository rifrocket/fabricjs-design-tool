import type { CanvasEngine, DocumentSnapshotData, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { captureSnapshot as captureDocumentSnapshot } from "@rifrocket/fabricjs-design-tool";
import { DEFAULT_STORAGE_KEY, saveDesignToStorage } from "./storage";
import type { StorageLike } from "./storage";

export interface LocalStoragePluginOptions<TMeta = unknown> {
  key?: string;
  // How long to wait after the last change before writing — batches bursts like a drag or a
  // sequence of undo/redo presses into a single localStorage write instead of one per event.
  debounceMs?: number;
  storage?: StorageLike;
  // Overrides how a snapshot is captured for autosave. Defaults to @rifrocket/fabricjs-design-tool's plain
  // captureSnapshot(engine); a consumer that draws its own non-content chrome directly onto the
  // canvas (e.g. a page-boundary marker rect — see apps/demo's captureDesignSnapshot) can supply
  // one that excludes it, so autosave only ever persists real document content.
  captureSnapshot?: (engine: CanvasEngine) => DocumentSnapshotData;
  // Captured alongside the snapshot on every autosave and handed back together by
  // loadDesignFromStorage() (see StoredDesign<TMeta> in storage.ts) — the app-defined-metadata
  // half of "what did this design look like", saved in the same atomic write as the content
  // instead of a second, independently-synced persistence key a consumer would otherwise have to
  // build and keep in lockstep by hand.
  captureMeta?: (engine: CanvasEngine) => TMeta;
}

const DEFAULT_DEBOUNCE_MS = 500;

// Event name any code — another plugin, or app-level code like a page-size control — can emit
// via engine.events to request an out-of-band save, for changes this plugin's own listeners
// (engine.store, "object:modified", "text:changed") don't observe on their own: a background-
// color change (CanvasEngine.setBackgroundColor() touches neither the store nor emits anything),
// or an object mutated via object.set() directly rather than through an interactive transform or
// engine.setObjectProperty(). See requestSave().
export const REQUEST_SAVE_EVENT = "local-storage:request-save";

export function requestSave(engine: CanvasEngine): void {
  engine.events.emit(REQUEST_SAVE_EVENT, undefined);
}

// Deliberately autosave-only — it does NOT restore anything on install. Restoring is a
// consumer-level decision (e.g. "only on the very first mount of the whole session, and only
// if nothing more specific — like an explicitly chosen template — should win instead"), and
// install() runs synchronously during CanvasEngine.useAll(), before a consumer has had any
// chance to add its own starter content. Auto-restoring here would race an app's own load
// sequence (see apps/demo/src/engine/EngineHost.tsx, which restores explicitly instead). Use
// loadDesignFromStorage() + @rifrocket/fabricjs-design-tool's restoreSnapshot() for that.
export function localStoragePlugin<TMeta = unknown>(options: LocalStoragePluginOptions<TMeta> = {}): EditorPlugin {
  const key = options.key ?? DEFAULT_STORAGE_KEY;
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const storage = options.storage;
  const capture = options.captureSnapshot ?? captureDocumentSnapshot;
  const captureMeta = options.captureMeta;

  // install(engine) re-runs its whole body on every call (once per CanvasEngine this plugin
  // instance is installed on), so these per-engine locals never leak across engines even though
  // the returned EditorPlugin object itself is shared.
  const cleanupByEngine = new WeakMap<CanvasEngine, () => void>();

  return {
    name: "local-storage",
    install(engine) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const scheduleSave = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = undefined;
          saveDesignToStorage({ snapshot: capture(engine), meta: captureMeta ? captureMeta(engine) : null }, key, storage);
        }, debounceMs);
      };

      // engine.store covers object add/remove, property-panel edits, and undo/redo — everything
      // that updates EngineState. It does NOT cover interactive drag/resize/rotate (Fabric
      // commits those straight to the object without going through the engine, see
      // CanvasEngine.bindCanvasEvents) — "object:modified"/"text:changed" cover that gap.
      // REQUEST_SAVE_EVENT covers everything else (see its own comment above). Stays on
      // getFabricCanvas(): RendererApi has no event-subscription surface at all
      // (FUTURE_IMPLEMENTATION.md Chunk 8.3).
      const unsubscribeStore = engine.store.subscribe(scheduleSave);
      const canvas = engine.getFabricCanvas();
      canvas.on("object:modified", scheduleSave);
      canvas.on("text:changed", scheduleSave);
      const unsubscribeRequestSave = engine.events.on(REQUEST_SAVE_EVENT, scheduleSave);

      cleanupByEngine.set(engine, () => {
        if (timer) clearTimeout(timer);
        unsubscribeStore();
        canvas.off("object:modified", scheduleSave);
        canvas.off("text:changed", scheduleSave);
        unsubscribeRequestSave();
      });
    },
    uninstall(engine) {
      cleanupByEngine.get(engine)?.();
      cleanupByEngine.delete(engine);
    },
  };
}
