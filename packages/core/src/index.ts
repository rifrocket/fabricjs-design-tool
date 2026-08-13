export { Store } from "./store/store";
export type { StoreListener, StatePatch } from "./store/store";

export { EventBus } from "./events/eventBus";
export type { EventHandler, Middleware } from "./events/eventBus";

export type { Command } from "./history/command";
export { CompositeCommand } from "./history/command";
export { HistoryManager } from "./history/historyManager";
export type { HistoryManagerOptions, HistoryEntry } from "./history/historyManager";
export { SetPropertyCommand } from "./history/setPropertyCommand";
export { AddObjectCommand, RemoveObjectCommand } from "./history/canvasCommands";

export { getObjectId, ID_PROPERTY } from "./engine/objectId";
export { registerSerializedProperty, getSerializedProperties } from "./engine/serializedProperties";
export { resolveObjectTypeId } from "./engine/resolveObjectTypeId";
export { AsyncLock } from "./engine/asyncLock";
export { applyViewportTransform } from "./engine/viewportTransform";
export { ViewportManager } from "./engine/viewportManager";
export type { SetZoomOptions } from "./engine/viewportManager";
export { SelectionManager } from "./engine/selectionManager";
export { LayerManager } from "./engine/layerManager";
export { AlignmentManager } from "./engine/alignmentManager";
export type { Alignment, DistributeAxis } from "./engine/alignmentManager";
export { computeDistribution } from "./engine/distribute";
export type { DistributeProperty, DistributionTarget } from "./engine/distribute";
export { SnapEngine } from "./engine/snapEngine";
export type { SnapEngineOptions } from "./engine/snapEngine";
export {
  findSnapCandidates,
  getClosestValue,
  getObjectCoords,
  isWithinThreshold,
} from "./engine/snapping";
export type { HorizontalGuide, ObjectCoords, SnapResult, VerticalGuide } from "./engine/snapping";
export { BLEND_MODES, isBlendMode } from "./engine/blendModes";
export type { BlendMode } from "./engine/blendModes";
export { createLinearGradient, createRadialGradient } from "./engine/gradient";
export type { GradientStop } from "./engine/gradient";
export { cropImage, resetCrop } from "./engine/crop";
export type { CropRect } from "./engine/crop";
export { extractImageTransform, replaceImage } from "./engine/replaceImage";
export type { ImageTransform } from "./engine/replaceImage";
export { computeRulerTicks } from "./engine/ruler";
export type { RulerOptions, RulerTick } from "./engine/ruler";

export { CanvasEngine, createEngine } from "./engine/canvasEngine";

export type { RendererApi, SceneApi, SelectionApi, ViewportApi, SerializationApi, LifecycleApi } from "./engine/rendererApi";
export { FabricRendererApi } from "./engine/fabricRendererApi";

export { CanvasExporter } from "./export/canvasExporter";
export type { ExportFormat, ExportResult } from "./export/canvasExporter";

export { captureSnapshot, restoreSnapshot, renderSnapshotThumbnail } from "./document/snapshot";
export type {
  DocumentSnapshotData,
  SnapshotDimensions,
  RenderThumbnailOptions,
  OffscreenCanvas,
  OffscreenCanvasFactory,
} from "./document/snapshot";
export type { DesignDocument, DesignDocumentPage } from "./document/designDocument";

export { Registry } from "./plugin/registry";

export type { EditorPreset, PresetShortcutsConfig } from "./preset/types";
export { EMPTY_PRESET } from "./preset/types";
export { createEditor, definePreset, resolvePreset, resolvePluginList, resolvePropertyFields } from "./preset/createEditor";
export type { CreateEditorOptions, CreatedEditor, PluginOverrides } from "./preset/createEditor";
export { ObjectTypeRegistry } from "./plugin/objectTypeRegistry";
export type {
  ObjectTypeDefinition,
  ObjectTypeId,
  ObjectTypeMap,
  PropertyFieldDefinition,
  PropertyFieldConfig,
  PropertyFieldOption,
  PropertyFieldProps,
} from "./plugin/objectTypeRegistry";
export type { SceneNode } from "./scene/sceneNode";
export { ToolRegistry } from "./plugin/toolRegistry";
export type { ToolActivationContext, ToolDefinition } from "./plugin/toolRegistry";
export { PanelRegistry } from "./plugin/panelRegistry";
export type { PanelDefinition } from "./plugin/panelRegistry";
export { EffectRegistry } from "./plugin/effectRegistry";
export type { Exporter, Importer } from "./plugin/transfer";
export { PluginRegistry } from "./plugin/pluginRegistry";
export type { EditorPlugin } from "./plugin/plugin";
export type { EditorContext } from "./plugin/editorContext";
export { KeyboardShortcutManager, normalizeKeyEvent } from "./plugin/keyboardShortcuts";
export type { KeyCombo, ShortcutBinding } from "./plugin/keyboardShortcuts";

export type { EngineOptions, EngineState } from "./types";

export {
  getEffectStack,
  addEffect,
  removeEffect,
  toggleEffect,
  duplicateEffect,
  reorderEffect,
  updateEffectProps,
  resetEffect,
  resetAllEffects,
} from "./effects/effectStack";
export { EffectStackCommand } from "./effects/effectStackCommand";
export { EFFECTS_PROPERTY } from "./effects/types";
export type {
  EffectCategory,
  EffectRenderTrack,
  EffectPropSchemaField,
  EffectRenderContext,
  EffectDefinition,
  EffectInstance,
  EffectStack,
} from "./effects/types";
