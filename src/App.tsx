import { useState, useRef, useEffect } from 'react';
import { FabricImage } from 'fabric';
import { AdvancedQRCodeGenerator } from './utils/advancedQRGenerator';
import './App.css';

// Components
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import CanvasWrapper from './components/CanvasWrapper';
import RightSidebar from './components/RightSidebar';
import BottomToolbar from './components/BottomToolbar';
import QRCodeDialog from './components/QRCodeDialog';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';

// Hooks
import { useCanvasManager } from './hooks/useCanvasManager';
import { useShapeCreator } from './hooks/useShapeCreator';
import { useCanvasKeyboardShortcuts } from './hooks/useCanvasKeyboardShortcuts';

// Utils
import { CanvasExporter, CanvasAligner, CanvasGroupManager } from './utils/canvasUtils';
import { CANVAS_DEFAULTS } from './utils/constants';

// Types
import type { CanvasDimensions } from './types/canvas';

// Styles
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Canvas management hook
  const {
    canvasState,
    canvasObjects,
    currentCanvasLayer,
    canGroup,
    canUngroup,
    canUndo,
    canRedo,
    undo,
    redo,
    addObjectToCanvas,
    selectObject,
    toggleObjectVisibility,
    deleteObject,
    toggleCanvasLayer,
    updateCanvasObjects,
    updateCanvasAndSaveHistory,
    setCanvasState,
    alignmentGuides,
  } = useCanvasManager(canvasRef);

  // Shape creation hook
  const {
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
  } = useShapeCreator(canvasState.canvas, addObjectToCanvas);

  // UI state
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({ 
    width: CANVAS_DEFAULTS.WIDTH, 
    height: CANVAS_DEFAULTS.HEIGHT 
  });
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [canvasSwitchingEnabled, setCanvasSwitchingEnabled] = useState<boolean>(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState<boolean>(false);
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] = useState<boolean>(false);

  // Keyboard shortcuts
  const keyboardShortcuts = useCanvasKeyboardShortcuts(canvasState.canvas, {
    enabled: true,
    enableClipboard: true,
    onObjectUpdate: updateCanvasAndSaveHistory,
    onUndo: undo,
    onRedo: redo
  });

  // Register the '?' shortcut to open shortcuts modal
  useEffect(() => {
    if (keyboardShortcuts) {
      keyboardShortcuts.registerShortcut({
        key: '?',
        action: () => setIsKeyboardShortcutsModalOpen(true),
        description: 'Show keyboard shortcuts',
        category: 'Help'
      });
    }
  }, [keyboardShortcuts]);

  // Canvas utilities - initialized when canvas is available
  const getCanvasExporter = () => canvasState.canvas ? new CanvasExporter(canvasState.canvas as any) : null;
  const getCanvasAligner = () => canvasState.canvas ? new CanvasAligner(canvasState.canvas as any) : null;
  const getGroupManager = () => canvasState.canvas ? new CanvasGroupManager(canvasState.canvas as any) : null;

  // Canvas dimension management
  const updateCanvasDimensions = (width: number, height: number) => {
    if (!canvasState.canvas) return;
    
    setCanvasDimensions({ width, height });
    canvasState.canvas.setDimensions({ width, height });
    canvasState.canvas.renderAll();
    
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  };

  const updateCanvasDimensionsFromCanvas = (dimensions: CanvasDimensions) => {
    updateCanvasDimensions(dimensions.width, dimensions.height);
  };

  const handleToggleCanvasSwitching = (enabled: boolean) => {
    setCanvasSwitchingEnabled(enabled);
  };

  // QR Code dialog handlers
  const handleOpenQRCodeDialog = () => {
    setIsQRCodeDialogOpen(true);
  };

  const handleCloseQRCodeDialog = () => {
    setIsQRCodeDialogOpen(false);
  };

  const handleGenerateQRCode = (content: string, type: string, options: any) => {
    addQRCode(type, content, options);
    setIsQRCodeDialogOpen(false);
  };

  // QR Code color update function
  const updateQRCodeColors = async (qrObject: FabricImage, foregroundColor: string, backgroundColor: string) => {
    if (!canvasState.canvas) return;
    
    try {
      const content = (qrObject as any).qrCodeContent;
      const options = (qrObject as any).qrCodeOptions || {};
      
      if (!content) return;
      
      // Update the QR options with new colors
      const updatedOptions = {
        ...options,
        dotsOptions: {
          ...options.dotsOptions,
          color: foregroundColor
        },
        backgroundOptions: {
          ...options.backgroundOptions,
          color: backgroundColor
        },
        cornersSquareOptions: {
          ...options.cornersSquareOptions,
          color: foregroundColor
        },
        cornersDotOptions: {
          ...options.cornersDotOptions,
          color: foregroundColor
        },
        color: { dark: foregroundColor, light: backgroundColor } // Legacy compatibility
      };
      
      const svgString = await AdvancedQRCodeGenerator.generateAdvancedQRCode(content, updatedOptions);
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
      
      const img = new Image();
      img.onload = () => {
        const left = qrObject.left;
        const top = qrObject.top;
        const scaleX = qrObject.scaleX;
        const scaleY = qrObject.scaleY;
        const angle = qrObject.angle;
        
        (qrObject as any).setSrc(svgDataUrl, {
          crossOrigin: 'anonymous'
        }).then(() => {
          qrObject.set({ left, top, scaleX, scaleY, angle });
          
          (qrObject as any).qrCodeSvg = svgString;
          (qrObject as any).qrCodeOptions = updatedOptions;
          
          canvasState.canvas!.renderAll();
        }).catch(() => {
          // Error loading image
        });
      };
      
      img.src = svgDataUrl;
    } catch {
      // Error generating QR code
    }
  };

  // Export function
  const handleExport = (format: string) => {
    const exporter = getCanvasExporter();
    if (exporter) {
      exporter.export(format as any);
    }
  };

  // Alignment function
  const handleAlignObjects = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const aligner = getCanvasAligner();
    if (aligner) {
      aligner.align(alignment);
    }
  };

  // Group/Ungroup functions
  const handleGroupObjects = () => {
    const groupManager = getGroupManager();
    if (groupManager) {
      groupManager.groupObjects();
    }
  };

  const handleUngroupObjects = () => {
    const groupManager = getGroupManager();
    if (groupManager) {
      groupManager.ungroupObjects();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onAddText={addText}
        onAddRectangle={addRectangle}
        onAddLine={addLine}
        onAddImage={addImage}
        onAddCircle={addCircle}
        onAddTriangle={addTriangle}
        onAddPentagon={addPentagon}
        onAddHexagon={addHexagon}
        onAddStar={addStar}
        onAddEllipse={addEllipse}
        onAddArrow={addArrow}
        onAddRoundedRectangle={addRoundedRectangle}
        onAddDiamond={addDiamond}
        onAddHeart={addHeart}
        onAddCloud={addCloud}
        onAddLightning={addLightning}
        onAddSpeechBubble={addSpeechBubble}
        onAddCross={addCross}
        onAddParallelogram={addParallelogram}
        onAddTrapezoid={addTrapezoid}
        onAddOctagonShape={addOctagonShape}
        onAddQRCode={handleOpenQRCodeDialog}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAlignObjects={handleAlignObjects}
        onGroupObjects={handleGroupObjects}
        onUngroupObjects={handleUngroupObjects}
        canGroup={canGroup}
        canUngroup={canUngroup}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          objects={canvasObjects}
          onSelectObject={selectObject}
          onToggleVisibility={toggleObjectVisibility}
          onDeleteObject={deleteObject}
        />
        
        <div className="flex-1 flex flex-col relative">
          <CanvasWrapper 
            canvasRef={canvasRef}
            canvas={canvasState.canvas}
            zoom={canvasState.zoom}
            canvasDimensions={canvasDimensions}
            onZoomChange={(zoom: number) => setCanvasState(prev => ({ ...prev, zoom }))}
            onCanvasDimensionsChange={updateCanvasDimensionsFromCanvas}
          />
          
          <BottomToolbar 
            zoom={canvasState.zoom}
            onZoomChange={(zoom: number) => setCanvasState(prev => ({ ...prev, zoom }))}
            onToggleCanvasLayer={toggleCanvasLayer}
            currentLayer={currentCanvasLayer}
            canvasSwitchingEnabled={canvasSwitchingEnabled}
            onToggleCanvasSwitching={handleToggleCanvasSwitching}
            onShowKeyboardShortcuts={() => setIsKeyboardShortcutsModalOpen(true)}
          />
        </div>
        
        <RightSidebar 
          selectedObject={canvasState.selectedObject}
          canvas={canvasState.canvas}
          canvasDimensions={canvasDimensions}
          updateCanvasObjects={updateCanvasObjects}
          updateCanvasDimensions={updateCanvasDimensions}
          updateQRCodeColors={updateQRCodeColors}
          onObjectUpdate={updateCanvasObjects}
          alignmentGuides={alignmentGuides}
        />
      </div>

      {/* QR Code Dialog */}
      <QRCodeDialog
        isOpen={isQRCodeDialogOpen}
        onClose={handleCloseQRCodeDialog}
        onGenerate={handleGenerateQRCode}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsModalOpen}
        onClose={() => setIsKeyboardShortcutsModalOpen(false)}
        shortcuts={keyboardShortcuts?.getShortcuts() || []}
      />
    </div>
  );
}

export default App;
