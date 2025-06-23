import React, { useState, useEffect } from 'react';
import { X, Globe, Mail, Phone, MessageSquare, User, Calendar, Upload } from '../utils/icons';
import { AdvancedQRCodeGenerator } from '../utils/advancedQRGenerator';
import type { QRCodeOptions, QRCodeContent } from '../types/canvas';

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string, type: string, options: QRCodeOptions) => void;
}

type ContentType = keyof QRCodeContent;

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ isOpen, onClose, onGenerate }) => {
  const [contentType, setContentType] = useState<ContentType>('URL');
  const [contentData, setContentData] = useState<QRCodeContent[ContentType]>({ url: 'https://brandcrowd.com/' });
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    width: 200,
    height: 200,
    margin: 10,
    errorCorrectionLevel: 'M',
    dotsOptions: {
      color: '#000000',
      type: 'square'
    },
    backgroundOptions: {
      color: '#FFFFFF'
    },
    cornersSquareOptions: {
      color: '#000000',
      type: 'square'
    },
    cornersDotOptions: {
      color: '#000000',
      type: 'square'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.3,
      margin: 8
    },
    iconStyle: 'none',
    // Legacy compatibility
    color: { dark: '#000000', light: '#FFFFFF' },
    style: 'square'
  });
  const [previewSvg, setPreviewSvg] = useState<string>('');
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Content type configurations
  const contentTypes = [
    { type: 'URL', icon: Globe, label: 'URL', color: 'bg-blue-500' },
    { type: 'Email', icon: Mail, label: 'Email', color: 'bg-green-500' },
    { type: 'Phone', icon: Phone, label: 'Phone', color: 'bg-purple-500' },
    { type: 'SMS', icon: MessageSquare, label: 'SMS', color: 'bg-orange-500' },
    { type: 'VCard', icon: User, label: 'V-Card', color: 'bg-indigo-500' },
    { type: 'Event', icon: Calendar, label: 'Event', color: 'bg-red-500' },
  ];

  // QR Code styles - updated with more options
  const qrStyles = [
    { id: 'square', name: 'Square', preview: '■■■■' },
    { id: 'rounded', name: 'Rounded', preview: '●●●●' },
    { id: 'dots', name: 'Dots', preview: '••••' },
    { id: 'classy', name: 'Classy', preview: '◇◇◇◇' },
    { id: 'classy-rounded', name: 'Classy Rounded', preview: '◆◆◆◆' },
    { id: 'extra-rounded', name: 'Extra Rounded', preview: '⬬⬬⬬⬬' },
  ];

  // Corner square styles
  const cornerSquareStyles = [
    { id: 'square', name: 'Square' },
    { id: 'dot', name: 'Dot' },
    { id: 'extra-rounded', name: 'Extra Rounded' },
    { id: 'rounded', name: 'Rounded' },
    { id: 'dots', name: 'Dots' },
    { id: 'classy', name: 'Classy' },
    { id: 'classy-rounded', name: 'Classy Rounded' },
  ];

  // Icon styles
  const iconStyles = [
    { id: 'none', name: 'None', icon: null },
    { id: 'logo', name: 'Logo', icon: Upload },
  ];

  // Update preview when options change
  useEffect(() => {
    if (validation.isValid && contentData) {
      const generatePreview = async () => {
        try {
          const content = AdvancedQRCodeGenerator.generateContentString(contentType, contentData);
          const svg = await AdvancedQRCodeGenerator.generateAdvancedQRCode(content, qrOptions);
          setPreviewSvg(svg);
        } catch {
          // Error generating QR code preview
        }
      };
      generatePreview();
    }
  }, [contentType, contentData, qrOptions, validation.isValid]);

  // Validate content when it changes
  useEffect(() => {
    const validationResult = AdvancedQRCodeGenerator.validateContent(contentType, contentData);
    setValidation(validationResult);
  }, [contentType, contentData]);

  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    // Reset content data based on type
    switch (newType) {
      case 'URL':
        setContentData({ url: 'https://brandcrowd.com/' });
        break;
      case 'Email':
        setContentData({ email: '' });
        break;
      case 'Phone':
        setContentData({ phone: '' });
        break;
      case 'SMS':
        setContentData({ phone: '', message: '' });
        break;
      case 'VCard':
        setContentData({ firstName: '', lastName: '' });
        break;
      case 'Event':
        setContentData({ title: '', startDate: '' });
        break;
    }
  };

  const handleGenerate = () => {
    if (!validation.isValid) return;
    
    const content = AdvancedQRCodeGenerator.generateContentString(contentType, contentData);
    onGenerate(content, contentType, qrOptions);
    onClose();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string;
        setUploadedLogo(logoDataUrl);
        setQrOptions(prev => ({
          ...prev,
          image: logoDataUrl,
          logoImage: logoDataUrl, // Legacy compatibility
          iconStyle: 'logo'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateQRStyle = (style: string) => {
    setQrOptions(prev => ({
      ...prev,
      dotsOptions: {
        ...prev.dotsOptions,
        type: style as 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
      },
      style: style as 'square' | 'rounded' | 'dots' | 'extra-rounded' | 'classy' | 'classy-rounded' // Legacy compatibility
    }));
  };

  const updateQRColor = (color: string) => {
    setQrOptions(prev => ({
      ...prev,
      dotsOptions: {
        ...prev.dotsOptions,
        color
      },
      cornersSquareOptions: {
        ...prev.cornersSquareOptions,
        color
      },
      cornersDotOptions: {
        ...prev.cornersDotOptions,
        color
      },
      color: { ...prev.color, dark: color } // Legacy compatibility
    }));
  };

  const updateBackgroundColor = (color: string) => {
    setQrOptions(prev => ({
      ...prev,
      backgroundOptions: {
        ...prev.backgroundOptions,
        color
      },
      color: { ...prev.color, light: color } // Legacy compatibility
    }));
  };

  const updateCornerSquareStyle = (type: string) => {
    setQrOptions(prev => ({
      ...prev,
      cornersSquareOptions: {
        ...prev.cornersSquareOptions,
        type: type as 'dot' | 'square' | 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded'
      }
    }));
  };

  const updateCornerSquareColor = (color: string) => {
    setQrOptions(prev => ({
      ...prev,
      cornersSquareOptions: {
        ...prev.cornersSquareOptions,
        color
      }
    }));
  };

  const updateLogoSize = (size: number) => {
    setQrOptions(prev => ({
      ...prev,
      imageOptions: {
        ...prev.imageOptions,
        imageSize: size
      }
    }));
  };

  const updateCornerDotStyle = (type: string) => {
    setQrOptions(prev => ({
      ...prev,
      cornersDotOptions: {
        ...prev.cornersDotOptions,
        type: type as 'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded'
      }
    }));
  };

  const updateCornerDotColor = (color: string) => {
    setQrOptions(prev => ({
      ...prev,
      cornersDotOptions: {
        ...prev.cornersDotOptions,
        color
      }
    }));
  };

  const handleIconStyleChange = (style: string) => {
    setQrOptions(prev => ({
      ...prev,
      iconStyle: style as any
    }));
    
    // Clear logo if switching away from logo style
    if (style !== 'logo') {
      setUploadedLogo(null);
      setQrOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions.logoImage;
        return newOptions;
      });
    }
  };

  const renderContentForm = () => {
    switch (contentType) {
      case 'URL': {
        const urlData = contentData as QRCodeContent['URL'];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Website URL *</label>
            <input
              type="url"
              value={urlData.url}
              onChange={(e) => setContentData({ url: e.target.value })}
              placeholder="https://brandcrowd.com/"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      }

      case 'Email': {
        const emailData = contentData as QRCodeContent['Email'];
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                value={emailData.email}
                onChange={(e) => setContentData({ ...emailData, email: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={emailData.subject || ''}
                onChange={(e) => setContentData({ ...emailData, subject: e.target.value })}
                placeholder="Subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={emailData.body || ''}
                onChange={(e) => setContentData({ ...emailData, body: e.target.value })}
                placeholder="Message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      }

      case 'Phone': {
        const phoneData = contentData as QRCodeContent['Phone'];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              value={phoneData.phone}
              onChange={(e) => setContentData({ phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      }

      case 'SMS': {
        const smsData = contentData as QRCodeContent['SMS'];
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                value={smsData.phone}
                onChange={(e) => setContentData({ ...smsData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={smsData.message || ''}
                onChange={(e) => setContentData({ ...smsData, message: e.target.value })}
                placeholder="Pre-filled message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      }

      case 'VCard': {
        const vCardData = contentData as QRCodeContent['VCard'];
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  value={vCardData.firstName}
                  onChange={(e) => setContentData({ ...vCardData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  value={vCardData.lastName}
                  onChange={(e) => setContentData({ ...vCardData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <input
                type="text"
                value={vCardData.organization || ''}
                onChange={(e) => setContentData({ ...vCardData, organization: e.target.value })}
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={vCardData.phone || ''}
                onChange={(e) => setContentData({ ...vCardData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={vCardData.email || ''}
                onChange={(e) => setContentData({ ...vCardData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                value={vCardData.website || ''}
                onChange={(e) => setContentData({ ...vCardData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      }

      case 'Event': {
        const eventData = contentData as QRCodeContent['Event'];
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Title *</label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setContentData({ ...eventData, title: e.target.value })}
                placeholder="Conference 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => setContentData({ ...eventData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  value={eventData.endDate || ''}
                  onChange={(e) => setContentData({ ...eventData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={eventData.location || ''}
                onChange={(e) => setContentData({ ...eventData, location: e.target.value })}
                placeholder="New York, NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={eventData.description || ''}
                onChange={(e) => setContentData({ ...eventData, description: e.target.value })}
                placeholder="Event description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Generate QR Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Content Type Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Content Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map(({ type, icon: Icon, label, color }) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeChange(type as ContentType)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      contentType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="text-xs font-medium text-gray-700">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Content</h3>
              {renderContentForm()}
              {validation.errors.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {validation.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Style Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Style</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {qrStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateQRStyle(style.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      qrOptions.style === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{style.preview}</div>
                    <div className="text-sm font-medium text-gray-700">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Style */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Icon Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {iconStyles.map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleIconStyleChange(id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      qrOptions.iconStyle === id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {Icon && <Icon size={20} className="mx-auto mb-1" />}
                    <div className="text-xs font-medium text-gray-700">{name}</div>
                  </button>
                ))}
              </div>
              
              {/* Logo Upload */}
              {qrOptions.iconStyle === 'logo' && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadedLogo && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img
                        src={uploadedLogo}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain border border-gray-200 rounded"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, 64x64px or larger. Will be automatically resized to fit QR code.
                  </p>
                </div>
              )}
            </div>

            {/* Logo Size Control */}
            {qrOptions.iconStyle === 'logo' && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Logo Size</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Size ({Math.round((qrOptions.imageOptions?.imageSize || 0.3) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={qrOptions.imageOptions?.imageSize || 0.3}
                    onChange={(e) => updateLogoSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>30%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                {previewSvg && validation.isValid ? (
                  <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                      <span className="text-xs">QR</span>
                    </div>
                    <p>QR Code preview will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Corner Squares and Logo Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Style</label>
                <select
                  value={qrOptions.cornersSquareOptions?.type || 'square'}
                  onChange={(e) => updateCornerSquareStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cornerSquareStyles.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={qrOptions.cornersSquareOptions?.color || '#000000'}
                    onChange={(e) => updateCornerSquareColor(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={qrOptions.cornersSquareOptions?.color || '#000000'}
                    onChange={(e) => updateCornerSquareColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Corner Dots Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Style</label>
                <select
                  value={qrOptions.cornersDotOptions?.type || 'square'}
                  onChange={(e) => updateCornerDotStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AdvancedQRCodeGenerator.getCornerDotStyleOptions().map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={qrOptions.cornersDotOptions?.color || '#000000'}
                    onChange={(e) => updateCornerDotColor(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={qrOptions.cornersDotOptions?.color || '#000000'}
                    onChange={(e) => updateCornerDotColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Colors</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={qrOptions.color?.dark || '#000000'}
                        onChange={(e) => updateQRColor(e.target.value)}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={qrOptions.color?.dark || '#000000'}
                        onChange={(e) => updateQRColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={qrOptions.color?.light || '#FFFFFF'}
                        onChange={(e) => updateBackgroundColor(e.target.value)}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={qrOptions.color?.light || '#FFFFFF'}
                        onChange={(e) => updateBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
                <select
                  value={qrOptions.errorCorrectionLevel}
                  onChange={(e) => setQrOptions({ ...qrOptions, errorCorrectionLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AdvancedQRCodeGenerator.getErrorCorrectionLevels().map(({ level, description, recovery }) => (
                    <option key={level} value={level}>
                      {description} ({level}) - {recovery} recovery
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            QR codes work on all modern smartphones (iOS 11+ / Android 8+)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!validation.isValid}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Generate QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDialog;
