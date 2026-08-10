export { PagesManager } from "./PagesManager";
export type { EngineFactory } from "./PagesManager";

export type {
  CanvasElementFactory,
  NewPageInit,
  NewPagePairInit,
  PageMeta,
  PagesManagerOptions,
  PagesState,
} from "./types";

export {
  DEFAULT_PAGES_STORAGE_KEY,
  capturePagesSnapshot,
  savePagesToStorage,
  loadPagesFromStorage,
  clearSavedPages,
} from "./persistence";
export type { PagesStorageData, StorageLike } from "./persistence";

export { applyTemplateToEngine } from "./templates";
export type { TemplateDefinition, TemplateObjectSpec } from "./templates";
