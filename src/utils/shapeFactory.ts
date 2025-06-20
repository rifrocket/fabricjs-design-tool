import { Text, Rect, Circle, Line, Polygon, Ellipse, FabricImage } from 'fabric';
import { SHAPE_DEFAULTS } from './constants';
import { AdvancedQRCodeGenerator } from './advancedQRGenerator';
import { SHAPE_COORDINATES, SHAPE_COLORS } from './shapeConstants';
import type { 
  ShapeConfig, 
  QRCodeOptions, 
  QRCodeFabricImage, 
  CustomPolygon, 
  CustomEllipse, 
  CustomRoundedRect 
} from '../types/canvas';

// Default positioning constants to reduce magic numbers
const DEFAULT_POSITIONS = {
  SMALL_OFFSET: 100,
  MEDIUM_OFFSET: 150,
  LARGE_OFFSET: 200,
  POLYGON_LEFT: 250,
  POLYGON_TOP: 200,
  IMAGE_TOP: 200
} as const;

// Default dimension constants
const DEFAULT_DIMENSIONS = {
  RECT_WIDTH: 100,
  RECT_HEIGHT: 80,
  ROUNDED_RECT_WIDTH: 120,
  ROUNDED_RECT_HEIGHT: 80,
  ROUNDED_RECT_RADIUS: 15,
  CIRCLE_RADIUS: 50,
  ELLIPSE_RX: 60,
  ELLIPSE_RY: 40,
  LINE_COORDS: [50, 100, 200, 100] as const
} as const;

export class ShapeFactory {
  // Create text object
  static createText(config: Partial<ShapeConfig> = {}): Text {
    return new Text('Sample Text', {
      left: DEFAULT_POSITIONS.SMALL_OFFSET,
      top: DEFAULT_POSITIONS.SMALL_OFFSET,
      fontSize: SHAPE_DEFAULTS.TEXT_FONT_SIZE,
      fill: '#000000',
      fontFamily: SHAPE_DEFAULTS.TEXT_FONT_FAMILY,
      selectable: true,
      evented: true,
      ...config
    });
  }

  // Create rectangle object
  static createRectangle(config: Partial<ShapeConfig> = {}): Rect {
    return new Rect({
      left: DEFAULT_POSITIONS.SMALL_OFFSET,
      top: DEFAULT_POSITIONS.SMALL_OFFSET,
      width: DEFAULT_DIMENSIONS.RECT_WIDTH,
      height: DEFAULT_DIMENSIONS.RECT_HEIGHT,
      fill: '#ff0000',
      stroke: SHAPE_DEFAULTS.STROKE_COLOR,
      strokeWidth: SHAPE_DEFAULTS.STROKE_WIDTH,
      selectable: true,
      evented: true,
      ...config
    });
  }

  // Create circle object
  static createCircle(config: Partial<ShapeConfig> = {}): Circle {
    return new Circle({
      left: DEFAULT_POSITIONS.SMALL_OFFSET,
      top: DEFAULT_POSITIONS.SMALL_OFFSET,
      radius: DEFAULT_DIMENSIONS.CIRCLE_RADIUS,
      fill: '#0000ff',
      stroke: SHAPE_DEFAULTS.STROKE_COLOR,
      strokeWidth: SHAPE_DEFAULTS.STROKE_WIDTH,
      selectable: true,
      evented: true,
      ...config
    });
  }

  // Create line object
  static createLine(config: Partial<ShapeConfig> = {}): Line {
    return new Line([...DEFAULT_DIMENSIONS.LINE_COORDS], {
      stroke: SHAPE_DEFAULTS.STROKE_COLOR,
      strokeWidth: SHAPE_DEFAULTS.STROKE_WIDTH,
      selectable: true,
      evented: true,
      ...config
    });
  }

  // Create ellipse object
  static createEllipse(config: Partial<ShapeConfig> = {}): CustomEllipse {
    const ellipse = new Ellipse({
      left: DEFAULT_POSITIONS.MEDIUM_OFFSET,
      top: DEFAULT_POSITIONS.MEDIUM_OFFSET,
      rx: DEFAULT_DIMENSIONS.ELLIPSE_RX,
      ry: DEFAULT_DIMENSIONS.ELLIPSE_RY,
      fill: SHAPE_COLORS.ellipse,
      selectable: true,
      evented: true,
      ...config
    }) as CustomEllipse;
    
    ellipse.type = 'ellipse';
    return ellipse;
  }

  // Create rounded rectangle object
  static createRoundedRectangle(config: Partial<ShapeConfig> = {}): CustomRoundedRect {
    const rect = new Rect({
      left: DEFAULT_POSITIONS.SMALL_OFFSET,
      top: DEFAULT_POSITIONS.SMALL_OFFSET,
      width: DEFAULT_DIMENSIONS.ROUNDED_RECT_WIDTH,
      height: DEFAULT_DIMENSIONS.ROUNDED_RECT_HEIGHT,
      rx: DEFAULT_DIMENSIONS.ROUNDED_RECT_RADIUS,
      ry: DEFAULT_DIMENSIONS.ROUNDED_RECT_RADIUS,
      fill: SHAPE_COLORS.roundedRectangle,
      selectable: true,
      evented: true,
      ...config
    }) as CustomRoundedRect;
    
    rect.type = 'rounded-rectangle';
    return rect;
  }

  // Create polygon shape
  static createPolygon(
    shapeType: keyof typeof SHAPE_COORDINATES,
    config: Partial<ShapeConfig> = {}
  ): CustomPolygon {
    const coordinates = SHAPE_COORDINATES[shapeType];
    const defaultConfig: ShapeConfig = {
      left: DEFAULT_POSITIONS.POLYGON_LEFT,
      top: DEFAULT_POSITIONS.POLYGON_TOP,
      fill: SHAPE_COLORS[shapeType] || '#333333',
      selectable: true,
      evented: true,
      ...config
    };

    const polygon = new Polygon([...coordinates], defaultConfig) as CustomPolygon;
    polygon.type = shapeType as any; // Type assertion needed due to SHAPE_COORDINATES key differences
    return polygon;
  }

  // Create QR code
  static async createQRCode(
    content: string,
    type: string,
    options: QRCodeOptions = {},
    config: Partial<ShapeConfig> = {}
  ): Promise<QRCodeFabricImage> {
    try {
      // Use advanced QR code generator for better styling and features
      const svgString = await AdvancedQRCodeGenerator.generateAdvancedQRCode(content, options);
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const fabricImg = new FabricImage(img, {
            left: DEFAULT_POSITIONS.SMALL_OFFSET,
            top: DEFAULT_POSITIONS.SMALL_OFFSET,
            scaleX: 1,
            scaleY: 1,
            selectable: true,
            evented: true,
            ...config
          }) as unknown as QRCodeFabricImage;
          
          // Add QR code metadata with proper typing
          fabricImg.qrCodeType = type;
          fabricImg.qrCodeContent = content;
          fabricImg.qrCodeSvg = svgString;
          fabricImg.qrCodeOptions = options;
          fabricImg.type = 'qrcode';
          
          resolve(fabricImg);
        };
        
        img.onerror = () => reject(new Error('Failed to load QR code image'));
        img.src = svgDataUrl;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      throw new Error(`Failed to create QR code: ${errorMessage}`);
    }
  }

  // Create image from file
  static createImageFromFile(file: File, config: Partial<ShapeConfig> = {}): Promise<FabricImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        FabricImage.fromURL(imgUrl).then((img) => {
          img.scale(SHAPE_DEFAULTS.SCALE);
          img.set({
            left: DEFAULT_POSITIONS.SMALL_OFFSET,
            top: DEFAULT_POSITIONS.IMAGE_TOP,
            selectable: true,
            evented: true,
            ...config
          });
          resolve(img);
        }).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}
