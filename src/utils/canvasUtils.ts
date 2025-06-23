import { FabricObject, Group, ActiveSelection, Canvas } from 'fabric';
import jsPDF from 'jspdf';
import { downloadDataURL, downloadText } from './helpers';
import type { ExportOptions } from '../types/canvas';

export class CanvasExporter {
  private canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  export(format: ExportOptions['format']): void {
    const fileName = `canvas-export-${Date.now()}`;

    switch (format) {
      case 'png':
        this.exportPNG(fileName);
        break;
      case 'jpeg':
        this.exportJPEG(fileName);
        break;
      case 'svg':
        this.exportSVG(fileName);
        break;
      case 'json':
        this.exportJSON(fileName);
        break;
      case 'pdf':
        this.exportPDF(fileName);
        break;
      default:
    }
  }

  private exportPNG(fileName: string): void {
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2
    });
    downloadDataURL(dataURL, `${fileName}.png`);
  }

  private exportJPEG(fileName: string): void {
    const dataURL = this.canvas.toDataURL({
      format: 'jpeg',
      quality: 0.95,
      multiplier: 2
    });
    downloadDataURL(dataURL, `${fileName}.jpg`);
  }

  private exportSVG(fileName: string): void {
    const svgString = this.canvas.toSVG();
    downloadText(svgString, `${fileName}.svg`, 'image/svg+xml');
  }

  private exportJSON(fileName: string): void {
    const jsonString = JSON.stringify(this.canvas.toJSON(), null, 2);
    downloadText(jsonString, `${fileName}.json`, 'application/json');
  }

  private exportPDF(fileName: string): void {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    
    const imageData = this.canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2
    });
    
    // Calculate PDF dimensions
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const canvasRatio = canvasWidth / canvasHeight;
    const pageRatio = pageWidth / pageHeight;
    
    let imgWidth: number, imgHeight: number, x: number, y: number;
    
    if (canvasRatio > pageRatio) {
      imgWidth = pageWidth - 20;
      imgHeight = imgWidth / canvasRatio;
      x = 10;
      y = (pageHeight - imgHeight) / 2;
    } else {
      imgHeight = pageHeight - 20;
      imgWidth = imgHeight * canvasRatio;
      x = (pageWidth - imgWidth) / 2;
      y = 10;
    }
    
    const pdf = new jsPDF({
      orientation: canvasRatio > 1 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    pdf.addImage(imageData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
  }
}

export class CanvasAligner {
  private canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  align(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    if (activeObjects.length === 1) {
      this.alignSingleObject(activeObjects[0], alignment);
    } else {
      this.alignMultipleObjects(activeObjects, alignment);
    }
    
    this.canvas.renderAll();
  }

  private alignSingleObject(obj: FabricObject, alignment: string): void {
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;

    switch (alignment) {
      case 'left':
        obj.set('left', 0);
        break;
      case 'center':
        obj.set('left', (canvasWidth - (obj.width || 0)) / 2);
        break;
      case 'right':
        obj.set('left', canvasWidth - (obj.width || 0));
        break;
      case 'top':
        obj.set('top', 0);
        break;
      case 'middle':
        obj.set('top', (canvasHeight - (obj.height || 0)) / 2);
        break;
      case 'bottom':
        obj.set('top', canvasHeight - (obj.height || 0));
        break;
    }
    
    obj.setCoords();
  }

  private alignMultipleObjects(objects: FabricObject[], alignment: string): void {
    const bounds = {
      left: Math.min(...objects.map(obj => obj.left || 0)),
      top: Math.min(...objects.map(obj => obj.top || 0)),
      right: Math.max(...objects.map(obj => (obj.left || 0) + (obj.width || 0))),
      bottom: Math.max(...objects.map(obj => (obj.top || 0) + (obj.height || 0)))
    };

    objects.forEach((obj: FabricObject) => {
      switch (alignment) {
        case 'left':
          obj.set('left', bounds.left);
          break;
        case 'center':
          obj.set('left', bounds.left + (bounds.right - bounds.left - (obj.width || 0)) / 2);
          break;
        case 'right':
          obj.set('left', bounds.right - (obj.width || 0));
          break;
        case 'top':
          obj.set('top', bounds.top);
          break;
        case 'middle':
          obj.set('top', bounds.top + (bounds.bottom - bounds.top - (obj.height || 0)) / 2);
          break;
        case 'bottom':
          obj.set('top', bounds.bottom - (obj.height || 0));
          break;
      }
      obj.setCoords();
    });
  }
}

export class CanvasGroupManager {
  private canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  groupObjects(): boolean {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length < 2) return false;

    this.canvas.discardActiveObject();

    activeObjects.forEach((obj: FabricObject) => {
      this.canvas.remove(obj);
    });

    const group = new Group(activeObjects, {
      selectable: true,
      evented: true,
    });

    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.renderAll();

    return true;
  }

  ungroupObjects(): boolean {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return false;

    const group = activeObject as Group;
    const groupObjects = group.getObjects().slice();

    this.canvas.remove(group);

    const ungroupedObjects: FabricObject[] = [];
    groupObjects.forEach((obj: FabricObject) => {
      // Remove object from group properly
      if ('_exitGroup' in group && typeof group._exitGroup === 'function') {
        (group._exitGroup as (obj: FabricObject) => void)(obj);
      }
      obj.set({ selectable: true, evented: true });
      obj.setCoords();
      this.canvas.add(obj);
      ungroupedObjects.push(obj);
    });

    if (ungroupedObjects.length === 1) {
      this.canvas.setActiveObject(ungroupedObjects[0]);
    } else if (ungroupedObjects.length > 1) {
      const selection = new ActiveSelection(ungroupedObjects, {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(selection);
    }

    this.canvas.renderAll();
    return true;
  }
}
