import { useCallback } from 'react';
import { Canvas, FabricObject } from 'fabric';
import { ShapeFactory } from '../utils/shapeFactory';
import type { QRCodeOptions } from '../types/canvas';

export const useShapeCreator = (
  canvas: Canvas | null,
  addObjectToCanvas: (object: FabricObject, objectType: string) => void
) => {
  const addText = useCallback(() => {
    if (!canvas) return;
    const text = ShapeFactory.createText();
    addObjectToCanvas(text, 'text');
  }, [canvas, addObjectToCanvas]);

  const addRectangle = useCallback(() => {
    if (!canvas) return;
    const rect = ShapeFactory.createRectangle();
    addObjectToCanvas(rect, 'rect');
  }, [canvas, addObjectToCanvas]);

  const addCircle = useCallback(() => {
    if (!canvas) return;
    const circle = ShapeFactory.createCircle();
    addObjectToCanvas(circle, 'circle');
  }, [canvas, addObjectToCanvas]);

  const addLine = useCallback(() => {
    if (!canvas) return;
    const line = ShapeFactory.createLine();
    addObjectToCanvas(line, 'line');
  }, [canvas, addObjectToCanvas]);

  const addEllipse = useCallback(() => {
    if (!canvas) return;
    const ellipse = ShapeFactory.createEllipse();
    addObjectToCanvas(ellipse, 'ellipse');
  }, [canvas, addObjectToCanvas]);

  const addRoundedRectangle = useCallback(() => {
    if (!canvas) return;
    const roundedRect = ShapeFactory.createRoundedRectangle();
    addObjectToCanvas(roundedRect, 'rounded-rectangle');
  }, [canvas, addObjectToCanvas]);

  const addTriangle = useCallback(() => {
    if (!canvas) return;
    const triangle = ShapeFactory.createPolygon('triangle');
    addObjectToCanvas(triangle, 'triangle');
  }, [canvas, addObjectToCanvas]);

  const addPentagon = useCallback(() => {
    if (!canvas) return;
    const pentagon = ShapeFactory.createPolygon('pentagon');
    addObjectToCanvas(pentagon, 'pentagon');
  }, [canvas, addObjectToCanvas]);

  const addHexagon = useCallback(() => {
    if (!canvas) return;
    const hexagon = ShapeFactory.createPolygon('hexagon');
    addObjectToCanvas(hexagon, 'hexagon');
  }, [canvas, addObjectToCanvas]);

  const addStar = useCallback(() => {
    if (!canvas) return;
    const star = ShapeFactory.createPolygon('star');
    addObjectToCanvas(star, 'star');
  }, [canvas, addObjectToCanvas]);

  const addDiamond = useCallback(() => {
    if (!canvas) return;
    const diamond = ShapeFactory.createPolygon('diamond');
    addObjectToCanvas(diamond, 'diamond');
  }, [canvas, addObjectToCanvas]);

  const addHeart = useCallback(() => {
    if (!canvas) return;
    const heart = ShapeFactory.createPolygon('heart');
    addObjectToCanvas(heart, 'heart');
  }, [canvas, addObjectToCanvas]);

  const addArrow = useCallback(() => {
    if (!canvas) return;
    const arrow = ShapeFactory.createPolygon('arrow');
    addObjectToCanvas(arrow, 'arrow');
  }, [canvas, addObjectToCanvas]);

  const addCloud = useCallback(() => {
    if (!canvas) return;
    const cloud = ShapeFactory.createPolygon('cloud');
    addObjectToCanvas(cloud, 'cloud');
  }, [canvas, addObjectToCanvas]);

  const addLightning = useCallback(() => {
    if (!canvas) return;
    const lightning = ShapeFactory.createPolygon('lightning');
    addObjectToCanvas(lightning, 'lightning');
  }, [canvas, addObjectToCanvas]);

  const addSpeechBubble = useCallback(() => {
    if (!canvas) return;
    const speechBubble = ShapeFactory.createPolygon('speechBubble');
    addObjectToCanvas(speechBubble, 'speech-bubble');
  }, [canvas, addObjectToCanvas]);

  const addCross = useCallback(() => {
    if (!canvas) return;
    const cross = ShapeFactory.createPolygon('cross');
    addObjectToCanvas(cross, 'cross');
  }, [canvas, addObjectToCanvas]);

  const addParallelogram = useCallback(() => {
    if (!canvas) return;
    const parallelogram = ShapeFactory.createPolygon('parallelogram');
    addObjectToCanvas(parallelogram, 'parallelogram');
  }, [canvas, addObjectToCanvas]);

  const addTrapezoid = useCallback(() => {
    if (!canvas) return;
    const trapezoid = ShapeFactory.createPolygon('trapezoid');
    addObjectToCanvas(trapezoid, 'trapezoid');
  }, [canvas, addObjectToCanvas]);

  const addOctagonShape = useCallback(() => {
    if (!canvas) return;
    const octagon = ShapeFactory.createPolygon('octagon');
    addObjectToCanvas(octagon, 'octagon');
  }, [canvas, addObjectToCanvas]);

  const addQRCode = useCallback(async (type: string, content: string, options: QRCodeOptions = {}) => {
    if (!canvas || !content.trim()) return;
    
    try {
      const qrCodeImage = await ShapeFactory.createQRCode(content, type, options);
      addObjectToCanvas(qrCodeImage, 'qrcode');
    } catch {
      // Error adding QR code
    }
  }, [canvas, addObjectToCanvas]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && canvas) {
        try {
          const image = await ShapeFactory.createImageFromFile(file);
          addObjectToCanvas(image, 'image');
        } catch {
          // Error adding image
        }
      }
    };
    input.click();
  }, [canvas, addObjectToCanvas]);

  return {
    addText,
    addRectangle,
    addCircle,
    addLine,
    addEllipse,
    addRoundedRectangle,
    addTriangle,
    addPentagon,
    addHexagon,
    addStar,
    addDiamond,
    addHeart,
    addArrow,
    addCloud,
    addLightning,
    addSpeechBubble,
    addCross,
    addParallelogram,
    addTrapezoid,
    addOctagonShape,
    addQRCode,
    addImage,
  };
};
