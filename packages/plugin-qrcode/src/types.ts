import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  Gradient,
  Mode,
  ShapeType,
  TypeNumber,
} from "qr-code-styling";

export type { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel, Gradient, GradientType, Mode, ShapeType, TypeNumber } from "qr-code-styling";

export interface QRCodeContentMap {
  url: { url: string };
  email: { email: string; subject?: string; body?: string };
  phone: { phone: string };
  sms: { phone: string; message?: string };
  vcard: {
    firstName: string;
    lastName: string;
    organization?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  event: {
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
  };
}

export type QRContentType = keyof QRCodeContentMap;

export interface QRCodeStyleOptions {
  size?: number;
  margin?: number;
  shape?: ShapeType;
  qrOptions?: {
    typeNumber?: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  dotsOptions?: {
    type?: DotType;
    color?: string;
    gradient?: Gradient;
    roundSize?: boolean;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
    gradient?: Gradient;
  };
  cornersDotOptions?: {
    type?: CornerDotType;
    color?: string;
    gradient?: Gradient;
  };
  backgroundOptions?: {
    color?: string;
    gradient?: Gradient;
    round?: number;
  };
  image?: string;
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: string;
    saveAsBlob?: boolean;
  };
}
