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

export class CustomAlignmentGuides {
  private canvas: Canvas;
  private options: Required<AlignmentGuidesOptions>;
  private verticalLines: VerticalLineCoords[] = [];
  private horizontalLines: HorizontalLineCoords[] = [];
  private activeObject: FabricObject | null = null;
  private isEnabled: boolean = true;
  private isMoving: boolean = false;
  private animationFrame: number | null = null;

  constructor(canvas: Canvas, options: AlignmentGuidesOptions = {}) {
    this.canvas = canvas;
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
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.on('after:render', this.drawGuidelines.bind(this));
  }

  private handleObjectMoving(e: any) {
    if (!this.isEnabled) return;
    
    this.activeObject = e.target;
    this.isMoving = true;
    
    // Cancel previous animation frame to avoid multiple renders
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Use requestAnimationFrame for smooth rendering
    this.animationFrame = requestAnimationFrame(() => {
      this.updateGuidelines();
    });
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
    canvasObjects.forEach(obj => {
      const objCoords = this.getObjectCoords(obj);
      this.checkVerticalAlignment(movingCoords, objCoords, snapXPoints);
      this.checkHorizontalAlignment(movingCoords, objCoords, snapYPoints);
    });

    // Check alignment with canvas center
    this.checkCanvasCenterAlignment(movingCoords, snapXPoints, snapYPoints);

    // Apply snapping
    this.applySnapping(movingObject, movingCoords, snapXPoints, snapYPoints);
    
    // Force re-render to show guidelines
    this.canvas.requestRenderAll();
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
    
    alignmentPoints.forEach(movingPoint => {
      alignmentPoints.forEach(objPoint => {
        const movingX = movingCoords[movingPoint].x;
        const objX = objCoords[objPoint].x;
        
        if (this.isInRange(movingX, objX)) {
          snapXPoints.push(objX);
          
          // Add vertical line
          const y1 = Math.min(movingCoords.tl.y, objCoords.tl.y);
          const y2 = Math.max(movingCoords.br.y, objCoords.br.y);
          this.verticalLines.push({ x: objX, y1, y2 });
        }
      });
    });
  }

  private checkHorizontalAlignment(
    movingCoords: ObjectCoords,
    objCoords: ObjectCoords,
    snapYPoints: number[]
  ) {
    const alignmentPoints = ['tl', 'tr', 'bl', 'br', 'center'] as const;
    
    alignmentPoints.forEach(movingPoint => {
      alignmentPoints.forEach(objPoint => {
        const movingY = movingCoords[movingPoint].y;
        const objY = objCoords[objPoint].y;
        
        if (this.isInRange(movingY, objY)) {
          snapYPoints.push(objY);
          
          // Add horizontal line
          const x1 = Math.min(movingCoords.tl.x, objCoords.tl.x);
          const x2 = Math.max(movingCoords.br.x, objCoords.br.x);
          this.horizontalLines.push({ y: objY, x1, x2 });
        }
      });
    });
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

  private applySnapping(
    object: FabricObject,
    coords: ObjectCoords,
    snapXPoints: number[],
    snapYPoints: number[]
  ) {
    if (snapXPoints.length === 0 && snapYPoints.length === 0) return;

    const snapX = this.getClosestPoint(coords.center.x, snapXPoints);
    const snapY = this.getClosestPoint(coords.center.y, snapYPoints);

    if (snapX !== null || snapY !== null) {
      const newX = snapX !== null ? snapX : coords.center.x;
      const newY = snapY !== null ? snapY : coords.center.y;
      
      // Use setXY for smoother movement instead of setPositionByOrigin
      const currentCenter = object.getCenterPoint();
      const deltaX = newX - currentCenter.x;
      const deltaY = newY - currentCenter.y;
      
      // Only apply snapping if the delta is small enough (avoid jumping)
      const maxSnapDistance = this.options.lineMargin * 2;
      if (Math.abs(deltaX) <= maxSnapDistance || Math.abs(deltaY) <= maxSnapDistance) {
        object.set({
          left: object.left + (snapX !== null ? deltaX : 0),
          top: object.top + (snapY !== null ? deltaY : 0)
        });
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

  private handleMouseDown() {
    this.clearLineArrays();
    this.isMoving = false;
    
    // Cancel any pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private handleMouseUp() {
    this.clearLineArrays();
    this.activeObject = null;
    this.isMoving = false;
    
    // Cancel any pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clear guidelines and re-render
    this.canvas.requestRenderAll();
  }

  private clearLineArrays() {
    this.verticalLines.length = 0;
    this.horizontalLines.length = 0;
  }

  private drawGuidelines() {
    if (!this.isEnabled || !this.activeObject || !this.isMoving) return;

    const ctx = this.canvas.getSelectionContext();
    const vpt = this.canvas.viewportTransform;
    
    // Clear previous guidelines
    const canvas = this.canvas.getElement();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.strokeStyle = this.options.lineColor;
    ctx.lineWidth = this.options.lineWidth;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.8; // Slightly transparent for smoother appearance

    // Draw vertical lines
    this.verticalLines.forEach(line => {
      if (this.shouldDrawLine(line, 'vertical')) {
        const startPoint = this.transformPoint(line.x, line.y1, vpt);
        const endPoint = this.transformPoint(line.x, line.y2, vpt);
        
        ctx.beginPath();
        ctx.moveTo(Math.round(startPoint.x) + 0.5, Math.round(startPoint.y) + 0.5);
        ctx.lineTo(Math.round(endPoint.x) + 0.5, Math.round(endPoint.y) + 0.5);
        ctx.stroke();
      }
    });

    // Draw horizontal lines
    this.horizontalLines.forEach(line => {
      if (this.shouldDrawLine(line, 'horizontal')) {
        const startPoint = this.transformPoint(line.x1, line.y, vpt);
        const endPoint = this.transformPoint(line.x2, line.y, vpt);
        
        ctx.beginPath();
        ctx.moveTo(Math.round(startPoint.x) + 0.5, Math.round(startPoint.y) + 0.5);
        ctx.lineTo(Math.round(endPoint.x) + 0.5, Math.round(endPoint.y) + 0.5);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  private shouldDrawLine(line: VerticalLineCoords | HorizontalLineCoords, type: 'vertical' | 'horizontal'): boolean {
    if (!this.activeObject) return false;
    
    const objectCoords = this.getObjectCoords(this.activeObject);
    
    if (type === 'vertical') {
      const vLine = line as VerticalLineCoords;
      // Check if the moving object is aligned with this line
      return ['tl', 'tr', 'bl', 'br', 'center'].some(point => 
        Math.abs(objectCoords[point as keyof ObjectCoords].x - vLine.x) < 1
      );
    } else {
      const hLine = line as HorizontalLineCoords;
      // Check if the moving object is aligned with this line
      return ['tl', 'tr', 'bl', 'br', 'center'].some(point => 
        Math.abs(objectCoords[point as keyof ObjectCoords].y - hLine.y) < 1
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
    this.clearLineArrays();
    
    // Cancel any pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clear guidelines
    const ctx = this.canvas.getSelectionContext();
    const canvas = this.canvas.getElement();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.canvas.requestRenderAll();
  }

  updateOptions(options: Partial<AlignmentGuidesOptions>) {
    this.options = { ...this.options, ...options };
  }

  isActive(): boolean {
    return this.isEnabled;
  }

  destroy() {
    // Cancel any pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.canvas.off('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.off('after:render', this.drawGuidelines.bind(this));
    this.canvas.off('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.off('mouse:up', this.handleMouseUp.bind(this));
    
    this.clearLineArrays();
    this.isMoving = false;
    this.activeObject = null;
    
    // Clear guidelines
    const ctx = this.canvas.getSelectionContext();
    const canvas = this.canvas.getElement();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
