import type { Canvas, FabricObject } from "fabric";
import { findSnapCandidates, getObjectCoords } from "./snapping";
import type { HorizontalGuide, VerticalGuide } from "./snapping";
import { applyViewportTransform } from "./viewportTransform";

export interface SnapEngineOptions {
  lineColor?: string;
  lineWidth?: number;
  threshold?: number;
  enabled?: boolean;
}

const DEFAULTS: Required<SnapEngineOptions> = {
  lineColor: "#32D10A",
  lineWidth: 1,
  threshold: 4,
  enabled: true,
};

// Wires smart-guide snapping to a live canvas: computes snap points on object:moving,
// nudges the object toward them, and draws the guide lines on the selection context.
export class SnapEngine {
  private options: Required<SnapEngineOptions>;
  private verticalGuides: VerticalGuide[] = [];
  private horizontalGuides: HorizontalGuide[] = [];
  private movingObject: FabricObject | null = null;
  private enabled: boolean;

  constructor(
    private readonly canvas: Canvas,
    options: SnapEngineOptions = {},
  ) {
    this.options = { ...DEFAULTS, ...options };
    this.enabled = this.options.enabled;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.on("object:moving", this.handleObjectMoving);
    this.canvas.on("mouse:up", this.clearGuides);
    this.canvas.on("selection:cleared", this.clearGuides);
    this.canvas.on("object:modified", this.clearGuides);
    this.canvas.on("after:render", this.renderGuides);
  }

  private handleObjectMoving = (e: { target: FabricObject }): void => {
    if (!this.enabled) return;

    this.movingObject = e.target;
    const moving = getObjectCoords(e.target);
    const others = this.canvas
      .getObjects()
      .filter((object) => object !== e.target)
      .map(getObjectCoords);

    const result = findSnapCandidates(
      moving,
      others,
      { width: this.canvas.getWidth(), height: this.canvas.getHeight() },
      this.options.threshold / this.canvas.getZoom(),
    );

    this.verticalGuides = result.verticalGuides;
    this.horizontalGuides = result.horizontalGuides;

    // result.deltaX/Y are already resolved against whichever point actually matched (an edge
    // or the center) — applying them directly to left/top is what makes the match land flush,
    // instead of the previous bug of always assuming the center matched (see snapping.ts).
    if (result.deltaX !== null) {
      e.target.set("left", e.target.left + result.deltaX);
    }
    if (result.deltaY !== null) {
      e.target.set("top", e.target.top + result.deltaY);
    }
    if (result.deltaX !== null || result.deltaY !== null) {
      e.target.setCoords();
    }
  };

  private clearGuides = (): void => {
    this.verticalGuides = [];
    this.horizontalGuides = [];
    this.movingObject = null;
    // renderGuides() below clears contextTop unconditionally on every call, but only while
    // movingObject is still set (its own guard) — and this method just nulled it out, so the
    // *next* "after:render" firing (from requestRenderAll() below) will hit that guard and
    // return before clearing anything, leaving the last-drawn guides on screen forever. Setting
    // contextTopDirty covers exactly that final frame: Fabric's own render loop clears
    // contextTop for us once, unconditionally, before renderGuides ever gets a chance to.
    this.canvas.contextTopDirty = true;
    this.canvas.requestRenderAll();
  };

  private renderGuides = (): void => {
    if (!this.enabled || !this.movingObject) return;

    const ctx = this.canvas.getSelectionContext();
    // Fabric's own per-object control/selection-handle rendering happens on the main canvas
    // context during a normal single-object drag, not here — contextTop is otherwise unused in
    // that case, so it's safe to clear unconditionally on every call. This canvas re-renders
    // continuously while dragging, firing "after:render" (and this handler) many times per
    // drag, and nothing else clears this context between those frames: without this, each
    // frame's guide strokes painted on top of the previous frame's, visually accumulating into
    // a growing grid of stale lines by the time the drag ends — the "too many lines" symptom.
    this.canvas.clearContext(ctx);

    if (this.verticalGuides.length === 0 && this.horizontalGuides.length === 0) return;

    const vpt = this.canvas.viewportTransform;
    ctx.save();
    ctx.strokeStyle = this.options.lineColor;
    ctx.lineWidth = this.options.lineWidth;
    ctx.setLineDash([8, 4]);

    for (const guide of this.verticalGuides) {
      const start = applyViewportTransform(guide.x, guide.y1, vpt);
      const end = applyViewportTransform(guide.x, guide.y2, vpt);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    for (const guide of this.horizontalGuides) {
      const start = applyViewportTransform(guide.x1, guide.y, vpt);
      const end = applyViewportTransform(guide.x2, guide.y, vpt);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    ctx.restore();
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.clearGuides();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setOptions(options: Partial<SnapEngineOptions>): void {
    this.options = { ...this.options, ...options };
  }

  destroy(): void {
    this.canvas.off("object:moving", this.handleObjectMoving);
    this.canvas.off("mouse:up", this.clearGuides);
    this.canvas.off("selection:cleared", this.clearGuides);
    this.canvas.off("object:modified", this.clearGuides);
    this.canvas.off("after:render", this.renderGuides);
    this.clearGuides();
  }
}
