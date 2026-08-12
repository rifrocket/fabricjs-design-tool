import type { SceneNode } from "../../scene/sceneNode";
import type { SceneApi } from "./sceneApi";
import type { SelectionApi } from "./selectionApi";
import type { ViewportApi } from "./viewportApi";
import type { SerializationApi } from "./serializationApi";
import type { LifecycleApi } from "./lifecycleApi";

export type { SceneApi } from "./sceneApi";
export type { SelectionApi } from "./selectionApi";
export type { ViewportApi } from "./viewportApi";
export type { SerializationApi } from "./serializationApi";
export type { LifecycleApi } from "./lifecycleApi";

// The bundle Fabric (and any renderer with an equivalent 2D-ish surface) implements. A future
// 3D renderer is NOT required to implement this exact union — it composes whichever of these
// capability interfaces are meaningful to it, plus its own (CameraApi, LightingApi,
// MaterialApi, ...). Consumers that need a specific capability should depend on that narrow
// interface, not the full bundle, wherever practical. Do not add speculative 3D members here.
export type RendererApi<TNode extends SceneNode = SceneNode> = SceneApi<TNode> &
  SelectionApi<TNode> &
  ViewportApi &
  SerializationApi &
  LifecycleApi & { readonly kind: string };
