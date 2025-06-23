import { FabricObject, Canvas } from 'fabric';

// Canvas object interface
export interface CanvasObject {
  id: string;
  name: string;
  type: ObjectType;
  object: FabricObject;
}

// Alignment guides configuration
export interface AlignmentGuidesConfig {
  enabled: boolean;
  lineColor: string;
  lineWidth: number;
  lineMargin: number;
  showCenterGuides: boolean;
  snapToObjects: boolean;
  snapToCanvas: boolean;
}

// Object types
export type ObjectType = 
  | 'text' 
  | 'rect' 
  | 'line' 
  | 'image' 
  | 'circle' 
  | 'triangle' 
  | 'pentagon' 
  | 'hexagon' 
  | 'star' 
  | 'qrcode'
  | 'ellipse'
  | 'arrow'
  | 'rounded-rectangle'
  | 'diamond'
  | 'heart'
  | 'cloud'
  | 'lightning'
  | 'speech-bubble'
  | 'cross'
  | 'parallelogram'
  | 'trapezoid'
  | 'octagon';

// Canvas state interface
export interface CanvasState {
  canvas: Canvas | null;
  selectedObject: FabricObject | null;
  zoom: number;
  isDarkMode: boolean;
  alignmentGuides?: AlignmentGuidesConfig;
}

// History state interface
export interface HistoryState {
  canvasState: string;
  objects: CanvasObject[];
}

// Canvas dimensions interface
export interface CanvasDimensions {
  width: number;
  height: number;
}

// QR Code options interface (updated for qr-code-styling)
export interface QRCodeOptions {
  // Core options
  width?: number;
  height?: number;
  margin?: number;
  
  // QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  qrOptions?: {
    typeNumber?: number;
    mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  };
  
  // Style options with gradient support
  dotsOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{ offset: number; color: string }>;
    };
    type?: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
  };
  
  backgroundOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{ offset: number; color: string }>;
    };
  };
  
  cornersSquareOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{ offset: number; color: string }>;
    };
    type?: 'dot' | 'square' | 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
  };
  
  cornersDotOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{ offset: number; color: string }>;
    };
    type?: 'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
  };
  
  // Image/Logo options
  image?: string;
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: 'anonymous' | 'use-credentials';
  };
  
  // Legacy compatibility (for UI components)
  contentType?: 'URL' | 'Email' | 'Phone' | 'SMS' | 'VCard' | 'Event';
  style?: 'square' | 'rounded' | 'dots' | 'extra-rounded' | 'classy' | 'classy-rounded';
  iconStyle?: 'none' | 'logo';
  logoImage?: string;
  size?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

// QR Code content types
export interface QRCodeContent {
  URL: { url: string };
  Email: { email: string; subject?: string; body?: string };
  Phone: { phone: string };
  SMS: { phone: string; message?: string };
  VCard: {
    firstName: string;
    lastName: string;
    organization?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  Event: {
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
  };
}

// Alignment options
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

// Shape configuration interface
export interface ShapeConfig {
  left: number;
  top: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  selectable?: boolean;
  evented?: boolean;
}

// Export options interface
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'json' | 'pdf';
  quality?: number;
  multiplier?: number;
}

// Extended Fabric object types with custom properties
export interface ExtendedFabricObject extends FabricObject {
  type: ObjectType;
}

export interface QRCodeFabricImage extends FabricObject {
  type: 'qrcode';
  qrCodeType: string;
  qrCodeContent: string;
  qrCodeSvg: string;
  qrCodeOptions: QRCodeOptions;
}

export interface CustomPolygon extends FabricObject {
  type: ObjectType;
}

export interface CustomEllipse extends FabricObject {
  type: 'ellipse';
}

export interface CustomRoundedRect extends FabricObject {
  type: 'rounded-rectangle';
}
