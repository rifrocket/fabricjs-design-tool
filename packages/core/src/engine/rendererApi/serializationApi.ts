// Raw scene (de)serialization — Document Model (Stage 5/6) builds per-object-type overrides
// and a canonical format on top of this; each renderer owns its own native format.
export interface SerializationApi {
  exportSceneJSON(extraProps?: string[]): Record<string, unknown>;
  importSceneJSON(json: unknown): Promise<void>;
}
