import { Canvas, FabricObject, Point } from 'fabric';

interface AlignmentGuidesOptions {
  lineColor?: string;
  lineWidth?: number;
  lineMargin?: number;
  enabled?: boolean;
}

interface VerticalLineCoords {
  x: number;
  y1: number;
  y2: number;
}

interface HorizontalLineCoords {
  y: number;
  x1: number;
  x2: number;
}

interface ObjectCoords {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
  center: Point;
}

export class SmoothAlignmentGuides {
  private canvas: Canvas;
  private options: Required<AlignmentGuidesOptions>;
  private verticalLines: VerticalLineCoords[] = [];
  private horizontalLines: HorizontalLineCoords[] = [];
  private activeObject: FabricObject | null = null;
  private isEnabled: boolean = true;
  private isMoving: boolean = false;
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 16; // ~60 FPS
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: Canvas, options: AlignmentGuidesOptions = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getSelectionContext();
    this.options = {
      lineColor: options.lineColor || '#32D10A',
      lineWidth: options.lineWidth || 1,
      lineMargin: options.lineMargin || 4,
      enabled: options.enabled !== false,
    };
    
    if (this.options.enabled) {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.on('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.on('selection:created', this.handleSelectionChange.bind(this));
    this.canvas.on('selection:updated', this.handleSelectionChange.bind(this));
    this.canvas.on('selection:cleared', this.handleSelectionClear.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('object:modified', this.handleObjectModified.bind(this));
    this.canvas.on('before:render', this.beforeRender.bind(this));
    this.canvas.on('after:render', this.renderGuidelines.bind(this));
  }

  private handleMouseDown() {
    this.isMoving = false;
    this.clearGuidelines();
    this.clearCanvasContext();
  }

  private handleObjectMoving(e: { target: FabricObject; e?: Event }) {
    if (!this.isEnabled) return;
    
    // Throttle updates for performance
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }
    this.lastUpdateTime = now;
    
    this.activeObject = e.target;
    this.isMoving = true;
    this.updateGuidelines();
  }

  private handleSelectionChange(e: { selected?: FabricObject[]; deselected?: FabricObject[] }) {
    this.activeObject = e.selected?.[0] || null;
    if (!this.isMoving) {
      this.clearGuidelines();
      this.clearCanvasContext();
    }
  }

  private handleSelectionClear() {
    this.activeObject = null;
    this.isMoving = false;
    this.clearGuidelines();
    this.clearCanvasContext();
    // Force a render to ensure lines are cleared
    this.canvas.requestRenderAll();
  }

  private handleMouseUp() {
    this.isMoving = false;
    this.activeObject = null;
    this.clearGuidelines();
    this.clearCanvasContext();
    // Force a render to ensure lines are cleared
    this.canvas.requestRenderAll();
  }

  private handleObjectModified() {
    this.isMoving = false;
    this.clearGuidelines();
    this.clearCanvasContext();
    // Force a render to ensure lines are cleared
    this.canvas.requestRenderAll();
  }

  private beforeRender() {
    // Always clear the selection context before each render
    this.clearCanvasContext();
  }

  private clearCanvasContext() {
    try {
      const canvas = this.canvas.getElement();
      if (canvas && this.ctx) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch {
      // Ignore context errors during cleanup
    }
  }

  private updateGuidelines() {
    if (!this.activeObject || !this.isMoving) return;
    
    this.clearLineArrays();
    
    const movingObject = this.activeObject;
    const movingCoords = this.getObjectCoords(movingObject);
    const canvasObjects = this.canvas.getObjects().filter(obj => obj !== movingObject);
    
    const snapXPoints: number[] = [];
    const snapYPoints: number[] = [];

    // Check alignment with other objects
    for (const obj of canvasObjects) {
      const objCoords = this.getObjectCoords(obj);
      this.checkVerticalAlignment(movingCoords, objCoords, snapXPoints);
      this.checkHorizontalAlignment(movingCoords, objCoords, snapYPoints);
    }

    // Check alignment with canvas center
    this.checkCanvasCenterAlignment(movingCoords, snapXPoints, snapYPoints);

    // Apply smooth snapping
    this.applySmoothSnapping(movingObject, movingCoords, snapXPoints, snapYPoints);
  }

  private getObjectCoords(object: FabricObject): ObjectCoords {
    const bounds = object.getBoundingRect();
    const center = object.getCenterPoint();
    
    return {
      tl: new Point(bounds.left, bounds.top),
      tr: new Point(bounds.left + bounds.width, bounds.top),
      bl: new Point(bounds.left, bounds.top + bounds.height),
      br: new Point(bounds.left + bounds.width, bounds.top + bounds.height),
      center: center,
    };
  }

  private checkVerticalAlignment(
    movingCoords: ObjectCoords,
    objCoords: ObjectCoords,
    snapXPoints: number[]
  ) {
    const alignmentPoints = ['tl', 'tr', 'bl', 'br', 'center'] as const;
    
    for (const movingPoint of alignmentPoints) {
      for (const objPoint of alignmentPoints) {
        const movingX = movingCoords[movingPoint].x;
        const objX = objCoords[objPoint].x;
        
        if (this.isInRange(movingX, objX)) {
          snapXPoints.push(objX);
          
          // Add vertical line with extended bounds
          const y1 = Math.min(movingCoords.tl.y, objCoords.tl.y) - 20;
          const y2 = Math.max(movingCoords.br.y, objCoords.br.y) + 20;
          this.verticalLines.push({ x: objX, y1, y2 });
        }
      }
    }
  }

  private checkHorizontalAlignment(
    movingCoords: ObjectCoords,
    objCoords: ObjectCoords,
    snapYPoints: number[]
  ) {
    const alignmentPoints = ['tl', 'tr', 'bl', 'br', 'center'] as const;
    
    for (const movingPoint of alignmentPoints) {
      for (const objPoint of alignmentPoints) {
        const movingY = movingCoords[movingPoint].y;
        const objY = objCoords[objPoint].y;
        
        if (this.isInRange(movingY, objY)) {
          snapYPoints.push(objY);
          
          // Add horizontal line with extended bounds
          const x1 = Math.min(movingCoords.tl.x, objCoords.tl.x) - 20;
          const x2 = Math.max(movingCoords.br.x, objCoords.br.x) + 20;
          this.horizontalLines.push({ y: objY, x1, x2 });
        }
      }
    }
  }

  private checkCanvasCenterAlignment(
    movingCoords: ObjectCoords,
    snapXPoints: number[],
    snapYPoints: number[]
  ) {
    const canvasCenter = {
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2,
    };

    // Check vertical center alignment
    if (this.isInRange(movingCoords.center.x, canvasCenter.x)) {
      snapXPoints.push(canvasCenter.x);
      this.verticalLines.push({
        x: canvasCenter.x,
        y1: 0,
        y2: this.canvas.getHeight()
      });
    }

    // Check horizontal center alignment
    if (this.isInRange(movingCoords.center.y, canvasCenter.y)) {
      snapYPoints.push(canvasCenter.y);
      this.horizontalLines.push({
        y: canvasCenter.y,
        x1: 0,
        x2: this.canvas.getWidth()
      });
    }
  }

  private isInRange(value1: number, value2: number): boolean {
    const zoom = this.canvas.getZoom();
    const threshold = this.options.lineMargin / zoom;
    return Math.abs(value1 - value2) <= threshold;
  }

  private applySmoothSnapping(
    object: FabricObject,
    coords: ObjectCoords,
    snapXPoints: number[],
    snapYPoints: number[]
  ) {
    if (snapXPoints.length === 0 && snapYPoints.length === 0) return;

    const snapX = this.getClosestPoint(coords.center.x, snapXPoints);
    const snapY = this.getClosestPoint(coords.center.y, snapYPoints);

    if (snapX !== null || snapY !== null) {
      const currentCenter = object.getCenterPoint();
      const newX = snapX !== null ? snapX : currentCenter.x;
      const newY = snapY !== null ? snapY : currentCenter.y;
      
      // Calculate deltas
      const deltaX = newX - currentCenter.x;
      const deltaY = newY - currentCenter.y;
      
      // Apply smooth snapping with reduced jump
      const maxSnapDistance = this.options.lineMargin * 1.5;
      
      if (Math.abs(deltaX) <= maxSnapDistance) {
        object.set('left', object.left + deltaX);
      }
      if (Math.abs(deltaY) <= maxSnapDistance) {
        object.set('top', object.top + deltaY);
      }
      
      if ((Math.abs(deltaX) <= maxSnapDistance) || (Math.abs(deltaY) <= maxSnapDistance)) {
        object.setCoords();
      }
    }
  }

  private getClosestPoint(value: number, points: number[]): number | null {
    if (points.length === 0) return null;
    
    return points.reduce((closest, point) => {
      return Math.abs(value - point) < Math.abs(value - closest) ? point : closest;
    });
  }

  private clearLineArrays() {
    this.verticalLines.length = 0;
    this.horizontalLines.length = 0;
  }

  private clearGuidelines() {
    this.clearLineArrays();
    this.clearCanvasContext();
  }

  private renderGuidelines() {
    // Always clear first
    this.clearCanvasContext();
    
    // Only draw if we're actively moving and have guidelines
    if (!this.isEnabled || !this.isMoving || !this.activeObject) {
      return;
    }
    
    if (this.verticalLines.length === 0 && this.horizontalLines.length === 0) {
      return;
    }

    // Check if the active object is actually selected and being dragged
    const activeObjects = this.canvas.getActiveObjects();
    if (!activeObjects.includes(this.activeObject)) {
      this.isMoving = false;
      return;
    }

    const vpt = this.canvas.viewportTransform;
    
    this.ctx.save();
    this.ctx.strokeStyle = this.options.lineColor;
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.setLineDash([8, 4]);
    this.ctx.globalAlpha = 0.9;
    this.ctx.lineCap = 'round';

    // Draw vertical lines
    for (const line of this.verticalLines) {
      if (this.shouldDrawLine(line, 'vertical')) {
        const startPoint = this.transformPoint(line.x, line.y1, vpt);
        const endPoint = this.transformPoint(line.x, line.y2, vpt);
        
        this.ctx.beginPath();
        this.ctx.moveTo(Math.round(startPoint.x) + 0.5, Math.round(startPoint.y));
        this.ctx.lineTo(Math.round(endPoint.x) + 0.5, Math.round(endPoint.y));
        this.ctx.stroke();
      }
    }

    // Draw horizontal lines
    for (const line of this.horizontalLines) {
      if (this.shouldDrawLine(line, 'horizontal')) {
        const startPoint = this.transformPoint(line.x1, line.y, vpt);
        const endPoint = this.transformPoint(line.x2, line.y, vpt);
        
        this.ctx.beginPath();
        this.ctx.moveTo(Math.round(startPoint.x), Math.round(startPoint.y) + 0.5);
        this.ctx.lineTo(Math.round(endPoint.x), Math.round(endPoint.y) + 0.5);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  private shouldDrawLine(line: VerticalLineCoords | HorizontalLineCoords, type: 'vertical' | 'horizontal'): boolean {
    if (!this.activeObject) return false;
    
    const objectCoords = this.getObjectCoords(this.activeObject);
    const tolerance = 2; // Pixel tolerance for line drawing
    
    if (type === 'vertical') {
      const vLine = line as VerticalLineCoords;
      return ['tl', 'tr', 'bl', 'br', 'center'].some(point => 
        Math.abs(objectCoords[point as keyof ObjectCoords].x - vLine.x) <= tolerance
      );
    } else {
      const hLine = line as HorizontalLineCoords;
      return ['tl', 'tr', 'bl', 'br', 'center'].some(point => 
        Math.abs(objectCoords[point as keyof ObjectCoords].y - hLine.y) <= tolerance
      );
    }
  }

  private transformPoint(x: number, y: number, vpt: number[] | undefined): Point {
    if (!vpt) return new Point(x, y);
    
    return new Point(
      x * vpt[0] + y * vpt[2] + vpt[4],
      x * vpt[1] + y * vpt[3] + vpt[5]
    );
  }

  // Public methods
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.isMoving = false;
    this.clearGuidelines();
    
    // Clear the canvas context
    this.clearCanvasContext();
  }

  forceClear() {
    this.isMoving = false;
    this.activeObject = null;
    this.clearGuidelines();
  }

  updateOptions(options: Partial<AlignmentGuidesOptions>) {
    this.options = { ...this.options, ...options };
  }

  isActive(): boolean {
    return this.isEnabled;
  }

  destroy() {
    this.canvas.off('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.off('selection:created', this.handleSelectionChange.bind(this));
    this.canvas.off('selection:updated', this.handleSelectionChange.bind(this));
    this.canvas.off('selection:cleared', this.handleSelectionClear.bind(this));
    this.canvas.off('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.off('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.off('object:modified', this.handleObjectModified.bind(this));
    this.canvas.off('before:render', this.beforeRender.bind(this));
    this.canvas.off('after:render', this.renderGuidelines.bind(this));
    
    this.clearGuidelines();
    this.isMoving = false;
    this.activeObject = null;
    
    // Clear the canvas context
    this.clearCanvasContext();
  }
}
