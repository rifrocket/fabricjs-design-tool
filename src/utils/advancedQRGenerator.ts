import QRCodeStyling from 'qr-code-styling';
import type { QRCodeOptions, QRCodeContent } from '../types/canvas';

export class AdvancedQRCodeGenerator {
  // Generate content string based on type
  static generateContentString(
    contentType: keyof QRCodeContent,
    contentData: QRCodeContent[keyof QRCodeContent]
  ): string {
    switch (contentType) {
      case 'URL': {
        const urlData = contentData as QRCodeContent['URL'];
        return urlData.url.startsWith('http') ? urlData.url : `https://${urlData.url}`;
      }
      
      case 'Email': {
        const emailData = contentData as QRCodeContent['Email'];
        let emailString = `mailto:${emailData.email}`;
        const params = [];
        if (emailData.subject) params.push(`subject=${encodeURIComponent(emailData.subject)}`);
        if (emailData.body) params.push(`body=${encodeURIComponent(emailData.body)}`);
        if (params.length > 0) emailString += `?${params.join('&')}`;
        return emailString;
      }
      
      case 'Phone': {
        const phoneData = contentData as QRCodeContent['Phone'];
        return `tel:${phoneData.phone}`;
      }
      
      case 'SMS': {
        const smsData = contentData as QRCodeContent['SMS'];
        let smsString = `sms:${smsData.phone}`;
        if (smsData.message) smsString += `?body=${encodeURIComponent(smsData.message)}`;
        return smsString;
      }
      
      case 'VCard': {
        const vCardData = contentData as QRCodeContent['VCard'];
        const vCard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vCardData.firstName} ${vCardData.lastName}`,
          `N:${vCardData.lastName};${vCardData.firstName};;;`,
        ];
        
        if (vCardData.organization) vCard.push(`ORG:${vCardData.organization}`);
        if (vCardData.phone) vCard.push(`TEL:${vCardData.phone}`);
        if (vCardData.email) vCard.push(`EMAIL:${vCardData.email}`);
        if (vCardData.website) vCard.push(`URL:${vCardData.website}`);
        if (vCardData.address) vCard.push(`ADR:;;${vCardData.address};;;;`);
        
        vCard.push('END:VCARD');
        return vCard.join('\n');
      }
      
      case 'Event': {
        const eventData = contentData as QRCodeContent['Event'];
        const event = [
          'BEGIN:VEVENT',
          `SUMMARY:${eventData.title}`,
          `DTSTART:${eventData.startDate.replace(/[-:]/g, '')}`,
        ];
        
        if (eventData.endDate) event.push(`DTEND:${eventData.endDate.replace(/[-:]/g, '')}`);
        if (eventData.location) event.push(`LOCATION:${eventData.location}`);
        if (eventData.description) event.push(`DESCRIPTION:${eventData.description}`);
        
        event.push('END:VEVENT');
        return event.join('\n');
      }
      
      default:
        return String(contentData);
    }
  }

  // Generate QR code with advanced styling using qr-code-styling
  static async generateAdvancedQRCode(content: string, options: QRCodeOptions = {}): Promise<string> {
    // Convert legacy options to qr-code-styling format
    const qrOptions = this.convertOptionsToAdvanced(content, options);
    
    // Create QR code instance
    const qrCode = new QRCodeStyling(qrOptions);
    
    try {
      // Generate SVG data
      const rawData = await qrCode.getRawData('svg');
      if (!rawData) {
        throw new Error('Failed to generate QR code data');
      }
      
      if (rawData instanceof Blob) {
        return await rawData.text();
      } else {
        // Node.js Buffer case
        return rawData.toString();
      }
    } catch {
      throw new Error('Failed to generate QR code');
    }
  }

  // Convert legacy options to qr-code-styling format
  private static convertOptionsToAdvanced(content: string, options: QRCodeOptions) {
    const size = options.size || options.width || 200;
    
    // Map legacy style to new dot type
    const mapLegacyStyle = (style?: string): string => {
      switch (style) {
        case 'rounded': return 'rounded';
        case 'dots': return 'dots';
        case 'extra-rounded': return 'extra-rounded';
        case 'classy': return 'classy';
        case 'classy-rounded': return 'classy-rounded';
        case 'square':
        default: return 'square';
      }
    };

    const qrOptions: any = {
      width: size,
      height: size,
      type: "svg",
      data: content,
      margin: options.margin || 10,
      qrOptions: {
        errorCorrectionLevel: options.errorCorrectionLevel || 'Q',
        typeNumber: options.qrOptions?.typeNumber || 0,
        mode: options.qrOptions?.mode || 'Byte',
        ...options.qrOptions,
      },
      dotsOptions: {
        color: options.color?.dark || options.dotsOptions?.color || '#000000',
        type: mapLegacyStyle(options.style) || options.dotsOptions?.type || 'square',
        ...options.dotsOptions,
      },
      backgroundOptions: {
        color: options.color?.light || options.backgroundOptions?.color || '#FFFFFF',
        ...options.backgroundOptions,
      },
      cornersSquareOptions: {
        color: options.color?.dark || options.cornersSquareOptions?.color || '#000000',
        type: options.cornersSquareOptions?.type || 'square',
        ...options.cornersSquareOptions,
      },
      cornersDotOptions: {
        color: options.color?.dark || options.cornersDotOptions?.color || '#000000',
        type: options.cornersDotOptions?.type || 'square',
        ...options.cornersDotOptions,
      },
    };

    // Add image/logo if specified
    if (options.iconStyle === 'logo' && (options.logoImage || options.image)) {
      qrOptions.image = options.logoImage || options.image;
      qrOptions.imageOptions = {
        hideBackgroundDots: true,
        imageSize: 0.3, // 30% of QR code size
        margin: 8,
        crossOrigin: "anonymous",
        ...options.imageOptions,
      };
    }

    return qrOptions;
  }

  // Validate content based on type
  static validateContent(
    contentType: keyof QRCodeContent,
    contentData: QRCodeContent[keyof QRCodeContent]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (contentType) {
      case 'URL': {
        const urlData = contentData as QRCodeContent['URL'];
        if (!urlData.url) errors.push('URL is required');
        else if (!this.isValidUrl(urlData.url)) errors.push('Please enter a valid URL');
        break;
      }
      
      case 'Email': {
        const emailData = contentData as QRCodeContent['Email'];
        if (!emailData.email) errors.push('Email is required');
        else if (!this.isValidEmail(emailData.email)) errors.push('Please enter a valid email address');
        break;
      }
      
      case 'Phone': {
        const phoneData = contentData as QRCodeContent['Phone'];
        if (!phoneData.phone) errors.push('Phone number is required');
        else if (!this.isValidPhone(phoneData.phone)) errors.push('Please enter a valid phone number');
        break;
      }
      
      case 'SMS': {
        const smsData = contentData as QRCodeContent['SMS'];
        if (!smsData.phone) errors.push('Phone number is required');
        else if (!this.isValidPhone(smsData.phone)) errors.push('Please enter a valid phone number');
        break;
      }
      
      case 'VCard': {
        const vCardData = contentData as QRCodeContent['VCard'];
        if (!vCardData.firstName) errors.push('First name is required');
        if (!vCardData.lastName) errors.push('Last name is required');
        if (vCardData.email && !this.isValidEmail(vCardData.email)) errors.push('Please enter a valid email address');
        if (vCardData.phone && !this.isValidPhone(vCardData.phone)) errors.push('Please enter a valid phone number');
        if (vCardData.website && !this.isValidUrl(vCardData.website)) errors.push('Please enter a valid website URL');
        break;
      }
      
      case 'Event': {
        const eventData = contentData as QRCodeContent['Event'];
        if (!eventData.title) errors.push('Event title is required');
        if (!eventData.startDate) errors.push('Start date is required');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility validation methods
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Get QR code size recommendations for different use cases
  static getSizeRecommendations(): { size: number; description: string; use: string }[] {
    return [
      { size: 150, description: 'Small', use: 'Business cards, labels' },
      { size: 200, description: 'Medium', use: 'Flyers, posters' },
      { size: 300, description: 'Large', use: 'Banners, large displays' },
      { size: 500, description: 'Extra Large', use: 'High-resolution printing' },
    ];
  }

  // Get error correction level descriptions
  static getErrorCorrectionLevels(): { level: 'L' | 'M' | 'Q' | 'H'; description: string; recovery: string }[] {
    return [
      { level: 'L', description: 'Low', recovery: '~7%' },
      { level: 'M', description: 'Medium', recovery: '~15%' },
      { level: 'Q', description: 'Quartile', recovery: '~25%' },
      { level: 'H', description: 'High', recovery: '~30%' },
    ];
  }

  // Get available style options
  static getStyleOptions(): { value: string; label: string; description: string }[] {
    return [
      { value: 'square', label: 'Square', description: 'Classic square dots' },
      { value: 'rounded', label: 'Rounded', description: 'Rounded corner dots' },
      { value: 'dots', label: 'Dots', description: 'Circular dots' },
      { value: 'classy', label: 'Classy', description: 'Elegant style' },
      { value: 'classy-rounded', label: 'Classy Rounded', description: 'Elegant with rounded corners' },
      { value: 'extra-rounded', label: 'Extra Rounded', description: 'Very rounded corners' },
    ];
  }

  // Get corner square style options
  static getCornerSquareStyleOptions(): { value: string; label: string }[] {
    return [
      { value: 'square', label: 'Square' },
      { value: 'dot', label: 'Dot' },
      { value: 'extra-rounded', label: 'Extra Rounded' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'dots', label: 'Dots' },
      { value: 'classy', label: 'Classy' },
      { value: 'classy-rounded', label: 'Classy Rounded' },
    ];
  }

  // Get corner dot style options
  static getCornerDotStyleOptions(): { value: string; label: string }[] {
    return [
      { value: 'square', label: 'Square' },
      { value: 'dot', label: 'Dot' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'dots', label: 'Dots' },
      { value: 'classy', label: 'Classy' },
      { value: 'classy-rounded', label: 'Classy Rounded' },
      { value: 'extra-rounded', label: 'Extra Rounded' },
    ];
  }

  // Get QR mode options
  static getQRModeOptions(): { value: string; label: string; description: string }[] {
    return [
      { value: 'Numeric', label: 'Numeric', description: 'Numbers only (0-9)' },
      { value: 'Alphanumeric', label: 'Alphanumeric', description: 'Numbers, letters, and some symbols' },
      { value: 'Byte', label: 'Byte', description: 'Any data (default)' },
      { value: 'Kanji', label: 'Kanji', description: 'Japanese characters' },
    ];
  }

  // Get gradient type options
  static getGradientTypeOptions(): { value: string; label: string }[] {
    return [
      { value: 'linear', label: 'Linear' },
      { value: 'radial', label: 'Radial' },
    ];
  }

  // Create gradient from simple two-color setup
  static createSimpleGradient(color1: string, color2: string, type: 'linear' | 'radial' = 'linear') {
    return {
      type,
      rotation: 0,
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    };
  }
}
