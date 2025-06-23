import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Image,
  Shapes,
  ChevronDown,
  Download,
  Undo,
  Redo,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignStartVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  Group,
  Ungroup,
  QrCode
} from '../utils/icons';
import ShapeDialog from './ShapeDialog';

interface HeaderProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddLine: () => void;
  onAddImage: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddPentagon: () => void;
  onAddHexagon: () => void;
  onAddStar: () => void;
  onAddEllipse: () => void;
  onAddArrow: () => void;
  onAddRoundedRectangle: () => void;
  onAddDiamond: () => void;
  onAddHeart: () => void;
  onAddCloud: () => void;
  onAddLightning: () => void;
  onAddSpeechBubble: () => void;
  onAddCross: () => void;
  onAddParallelogram: () => void;
  onAddTrapezoid: () => void;
  onAddOctagonShape: () => void;
  onAddQRCode?: () => void;
  onExport: (format: 'pdf' | 'png' | 'svg' | 'json' | 'jpeg') => void;
  onTestCanvas?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAlignObjects: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onGroupObjects: () => void;
  onUngroupObjects: () => void;
  canGroup: boolean;
  canUngroup: boolean;
}

const Header: React.FC<HeaderProps> = ({
  selectedTool,
  onToolSelect,
  onAddText,
  onAddRectangle,
  onAddLine,
  onAddImage,
  onAddCircle,
  onAddTriangle,
  onAddPentagon,
  onAddHexagon,
  onAddStar,
  onAddEllipse,
  onAddArrow,
  onAddRoundedRectangle,
  onAddDiamond,
  onAddHeart,
  onAddCloud,
  onAddLightning,
  onAddSpeechBubble,
  onAddCross,
  onAddParallelogram,
  onAddTrapezoid,
  onAddOctagonShape,
  onAddQRCode,
  onExport,
  onTestCanvas,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAlignObjects,
  onGroupObjects,
  onUngroupObjects,
  canGroup,
  canUngroup
}) => {
  const [isShapeDialogOpen, setIsShapeDialogOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  // Temporarily disabled for new QR code dialog
  // const [isQRCodeDropdownOpen, setIsQRCodeDropdownOpen] = useState(false);
  // const [qrCodeContent, setQRCodeContent] = useState('');
  // const [qrCodeType, setQRCodeType] = useState('text');
  
  // vCard fields - temporarily disabled for new QR dialog
  /*
  const [vCardFields, setVCardFields] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    mobile: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    note: ''
  });
  */
  
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle shape selection from dialog
  const handleShapeSelect = (shapeType: string) => {
    onToolSelect(shapeType);
    
    // Call the appropriate shape creation function based on type
    switch (shapeType) {
      case 'rectangle':
        onAddRectangle();
        break;
      case 'circle':
        onAddCircle();
        break;
      case 'line':
        onAddLine();
        break;
      case 'triangle':
        onAddTriangle();
        break;
      case 'pentagon':
        onAddPentagon();
        break;
      case 'hexagon':
        onAddHexagon();
        break;
      case 'star':
        onAddStar();
        break;
      case 'ellipse':
        onAddEllipse();
        break;
      case 'arrow':
        onAddArrow();
        break;
      case 'roundedRectangle':
        onAddRoundedRectangle();
        break;
      case 'diamond':
        onAddDiamond();
        break;
      case 'heart':
        onAddHeart();
        break;
      case 'cloud':
        onAddCloud();
        break;
      case 'lightning':
        onAddLightning();
        break;
      case 'speechBubble':
        onAddSpeechBubble();
        break;
      case 'cross':
        onAddCross();
        break;
      case 'parallelogram':
        onAddParallelogram();
        break;
      case 'trapezoid':
        onAddTrapezoid();
        break;
      case 'octagonShape':
        onAddOctagonShape();
        break;
    }
  };

  // Temporarily disabled QR code generation for new dialog
  /*
  const handleQRCodeGenerate = () => {
    if (!onAddQRCode) return;
    
    let formattedContent = '';
    
    // Format content based on type
    switch (qrCodeType) {
      case 'text':
        if (!qrCodeContent.trim()) return;
        formattedContent = qrCodeContent;
        break;
        
      case 'url':
        if (!qrCodeContent.trim()) return;
        if (!qrCodeContent.startsWith('http://') && !qrCodeContent.startsWith('https://')) {
          formattedContent = `https://${qrCodeContent}`;
        } else {
          formattedContent = qrCodeContent;
        }
        break;
        
      case 'vcard':
        // Generate vCard 3.0 format (compatible with both Android and iOS)
        const vcard = generateVCard(vCardFields);
        if (!vcard) return;
        formattedContent = vcard;
        break;
        
      default:
        if (!qrCodeContent.trim()) return;
        formattedContent = qrCodeContent;
    }
    
    onAddQRCode(qrCodeType, formattedContent, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    setIsQRCodeDropdownOpen(false);
    setQRCodeContent('');
    
    // Reset vCard fields if it was a vCard
    if (qrCodeType === 'vcard') {
      setVCardFields({
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phone: '',
        mobile: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        note: ''
      });
    }
  };
  */

  // generateVCard function temporarily disabled for new QR dialog
  /*
  const generateVCard = (fields: typeof vCardFields) => {
    // Check if at least name or organization is provided
    if (!fields.firstName && !fields.lastName && !fields.organization) {
      return null;
    }

    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    
    // Full name (required)
    const fullName = `${fields.firstName} ${fields.lastName}`.trim();
    if (fullName) {
      vcard += `FN:${fullName}\n`;
      vcard += `N:${fields.lastName};${fields.firstName};;;\n`;
    }
    
    // Organization
    if (fields.organization) {
      vcard += `ORG:${fields.organization}\n`;
    }
    
    // Title
    if (fields.title) {
      vcard += `TITLE:${fields.title}\n`;
    }
    
    // Phone numbers
    if (fields.phone) {
      vcard += `TEL;TYPE=WORK,VOICE:${fields.phone}\n`;
    }
    if (fields.mobile) {
      vcard += `TEL;TYPE=CELL:${fields.mobile}\n`;
    }
    
    // Email
    if (fields.email) {
      vcard += `EMAIL;TYPE=INTERNET:${fields.email}\n`;
    }
    
    // Website
    if (fields.website) {
      let url = fields.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      vcard += `URL:${url}\n`;
    }
    
    // Address
    if (fields.address || fields.city || fields.state || fields.postalCode || fields.country) {
      const addressParts = [
        '', // PO Box (empty)
        '', // Extended address (empty)
        fields.address || '',
        fields.city || '',
        fields.state || '',
        fields.postalCode || '',
        fields.country || ''
      ];
      vcard += `ADR;TYPE=WORK:${addressParts.join(';')}\n`;
    }
    
    // Note
    if (fields.note) {
      vcard += `NOTE:${fields.note}\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
  };
  */
  return (
    <header className="bg-white border-b border-gray-200 h-14">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section - Logo */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
          </div>



          {/* Tools */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => {
                onToolSelect('text');
                onAddText();
              }}
              aria-label="Text"
              className={`p-2 rounded-md ${
                selectedTool === 'text' 
                  ? 'bg-cyan-100 text-cyan-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Type size={18} />
            </button>
            <button 
              onClick={() => {
                onToolSelect('image');
                onAddImage();
              }}
              aria-label="Image"
              className={`p-2 rounded-md ${
                selectedTool === 'image' 
                  ? 'bg-cyan-100 text-cyan-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Image size={18} />
            </button>
            
            {/* QR Code Generator */}
            <button 
              onClick={onAddQRCode}
              className={`p-2 rounded-md ${
                selectedTool === 'qrcode' 
                  ? 'bg-cyan-100 text-cyan-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="QR Code Generator"
            >
              <QrCode size={18} />
            </button>
            
            {/* Shapes Button */}
            <button 
              onClick={() => setIsShapeDialogOpen(true)}
              className={`p-2 rounded-md ${
                ['rectangle', 'line', 'circle', 'triangle', 'pentagon', 'hexagon', 'star', 'ellipse', 'arrow', 'roundedRectangle', 'diamond', 'heart', 'cloud', 'lightning', 'speechBubble', 'cross', 'parallelogram', 'trapezoid', 'octagonShape'].includes(selectedTool)
                  ? 'bg-cyan-100 text-cyan-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Shapes"
            >
              <Shapes size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo"
              className={`p-2 rounded-md ${
                canUndo
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo"
              className={`p-2 rounded-md ${
                canRedo
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Redo size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* Alignment Tools (6 tools total) */}
          <div className="flex items-center space-x-1">
            {/* Horizontal Alignment */}
            <button 
              onClick={() => onAlignObjects('left')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Left Edges"
            >
              <AlignStartVertical size={18} />
            </button>
            <button 
              onClick={() => onAlignObjects('center')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Horizontal Centers"
            >
              <AlignHorizontalJustifyCenter size={18} />
            </button>
            <button 
              onClick={() => onAlignObjects('right')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Right Edges"
            >
              <AlignEndVertical size={18} />
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            {/* Vertical Alignment */}
            <button 
              onClick={() => onAlignObjects('top')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Top Edges"
            >
              <AlignStartHorizontal size={18} />
            </button>
            <button 
              onClick={() => onAlignObjects('middle')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Vertical Centers"
            >
              <AlignVerticalJustifyCenter size={18} />
            </button>
            <button 
              onClick={() => onAlignObjects('bottom')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Align Bottom Edges"
            >
              <AlignEndHorizontal size={18} />
            </button>

            {/* Grouping Tools */}
            {(canGroup || canUngroup) && (
              <>
                {/* Divider */}
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                
                {canGroup && (
                  <button 
                    onClick={onGroupObjects}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Group Selected Objects"
                  >
                    <Group size={18} />
                  </button>
                )}
                
                {canUngroup && (
                  <button 
                    onClick={onUngroupObjects}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Ungroup Selected Objects"
                  >
                    <Ungroup size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            Templates
          </button>

          {onTestCanvas && (
            <button 
              onClick={onTestCanvas}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-red-300"
            >
              Test Canvas
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button 
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-400 text-white text-sm font-medium rounded-md hover:bg-cyan-500"
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={16} className={`transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isExportDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      onExport('png');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>PNG (High Quality)</span>
                  </button>
                  <button 
                    onClick={() => {
                      onExport('jpeg');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>JPEG (High Quality)</span>
                  </button>
                  <button 
                    onClick={() => {
                      onExport('svg');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>SVG (Vector)</span>
                  </button>
                  <button 
                    onClick={() => {
                      onExport('pdf');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>PDF Document</span>
                  </button>
                  <button 
                    onClick={() => {
                      onExport('json');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>JSON (Data)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Shape Selection Dialog */}
      <ShapeDialog
        isOpen={isShapeDialogOpen}
        onClose={() => setIsShapeDialogOpen(false)}
        onShapeSelect={handleShapeSelect}
      />
    </header>
  );
};

export default Header;
