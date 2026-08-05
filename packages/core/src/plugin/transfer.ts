import type { Canvas } from "fabric";

export type Exporter = (canvas: Canvas) => unknown;
export type Importer = (canvas: Canvas, input: unknown) => void | Promise<void>;
