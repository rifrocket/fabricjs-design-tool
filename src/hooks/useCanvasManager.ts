import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, FabricObject, Text } from 'fabric';
import type { CanvasState, CanvasObject, AlignmentGuidesConfig } from '../types/canvas';
import { CANVAS_DEFAULTS } from '../utils/constants';
import { generateId, formatObjectName } from '../utils/helpers';
import { useAlignmentGuides, type AlignmentGuidesOptions } from './useAlignmentGuides';
import { useCanvasKeyboardShortcuts } from './useCanvasKeyboardShortcuts';
import FabricUndoRedo from '../utils/fabricUndoRedo';

type CanvasLayer = 'front' | 'back';

// Default alignment guides configuration
const DEFAULT_ALIGNMENT_GUIDES: AlignmentGuidesConfig = {
  enabled: true,
  lineColor: '#32D10A',
  lineWidth: 1,
  lineMargin: 4,
  showCenterGuides: true,
  snapToObjects: true,
  snapToCanvas: true,
};

export const useCanvasManager = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    canvas: null,
    selectedObject: null,
    zoom: 1,
    isDarkMode: false,
    alignmentGuides: DEFAULT_ALIGNMENT_GUIDES,
  });

  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [frontObjects, setFrontObjects] = useState<CanvasObject[]>([]);
  const [backObjects, setBackObjects] = useState<CanvasObject[]>([]);
  const [currentCanvasLayer, setCurrentCanvasLayer] = useState<CanvasLayer>('front');
  
  // Undo/Redo management using two-stack approach
  const [undoRedoManager, setUndoRedoManager] = useState<FabricUndoRedo | null>(null);
  const undoRedoManagerRef = useRef<FabricUndoRedo | null>(null);
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
    undoStackSize: 0,
    redoStackSize: 0
  });
  
  // Grouping state
  const [canGroup, setCanGroup] = useState<boolean>(false);
  const [canUngroup, setCanUngroup] = useState<boolean>(false);

  // Initialize alignment guides
  const alignmentGuidesOptions: AlignmentGuidesOptions = {
    enabled: canvasState.alignmentGuides?.enabled || true,
    lineColor: canvasState.alignmentGuides?.lineColor || '#32D10A',
    lineWidth: canvasState.alignmentGuides?.lineWidth || 1,
    lineMargin: canvasState.alignmentGuides?.lineMargin || 4,
  };

  const alignmentGuides = useAlignmentGuides(canvasState.canvas, alignmentGuidesOptions);

  // Initialize keyboard shortcuts
  const keyboardShortcuts = useCanvasKeyboardShortcuts(canvasState.canvas, {
    enabled: true,
    enableClipboard: true,
  });

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvasState.canvas) {
      initializeCanvas();
    }

    return () => {
      if (canvasState.canvas) {
        canvasState.canvas.dispose();
      }
    };
  }, []);

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const canvasEl = canvasRef.current;
    canvasEl.width = CANVAS_DEFAULTS.WIDTH;
    canvasEl.height = CANVAS_DEFAULTS.HEIGHT;
    
    const canvas = new Canvas(canvasEl, {
      width: CANVAS_DEFAULTS.WIDTH,
      height: CANVAS_DEFAULTS.HEIGHT,
      backgroundColor: CANVAS_DEFAULTS.BACKGROUND_COLOR,
      selection: true,
      preserveObjectStacking: true,
      isDrawingMode: false,
      interactive: true,
      defaultCursor: 'default',
      hoverCursor: 'move',
      moveCursor: 'move',
      selectionBorderColor: CANVAS_DEFAULTS.SELECTION_BORDER_COLOR,
      selectionLineWidth: CANVAS_DEFAULTS.SELECTION_LINE_WIDTH,
      selectionDashArray: CANVAS_DEFAULTS.SELECTION_DASH_ARRAY,
      centeredScaling: false,
      centeredRotation: false,
      enableRetinaScaling: false,
    });

    setupCanvasEventHandlers(canvas);
    setupInitialContent(canvas);

    setCanvasState(prev => ({ ...prev, canvas }));
    
    // Initialize undo/redo system with callback
    setTimeout(() => {
      const historyUpdateCallback = () => {
        // This callback will be called by FabricUndoRedo when state changes
        setTimeout(() => {
          if (undoRedoManagerRef.current) {
            const debugInfo = undoRedoManagerRef.current.getDebugInfo();
            setHistoryState({
              canUndo: debugInfo.canUndo,
              canRedo: debugInfo.canRedo,
              undoStackSize: debugInfo.undoStackSize,
              redoStackSize: debugInfo.redoStackSize
            });
          }
        }, 10);
      };
      
      const undoRedo = new FabricUndoRedo(canvas, 50, historyUpdateCallback);
      setUndoRedoManager(undoRedo);
      undoRedoManagerRef.current = undoRedo;
      
      // Initial state update
      historyUpdateCallback();
    }, 100);
  };

  const setupCanvasEventHandlers = (canvas: Canvas) => {
    canvas.on('selection:created', handleSelectionChange);
    canvas.on('selection:updated', handleSelectionChange);
    canvas.on('selection:cleared', handleSelectionClear);
    canvas.on('object:added', handleObjectChange);
    canvas.on('object:removed', handleObjectChange);
    // Note: object:modified and path:created are now handled by FabricUndoRedo
  };

  const handleSelectionChange = (e: any) => {
    const selectedObjects = canvasState.canvas?.getActiveObjects() || [];
    const isGrouped = selectedObjects.length === 1 && selectedObjects[0].type === 'group';
    
    setCanvasState(prev => ({
      ...prev,
      selectedObject: e.selected?.[0] || null
    }));
    
    setCanGroup(selectedObjects.length > 1);
    setCanUngroup(isGrouped);
  };

  const handleSelectionClear = () => {
    setCanvasState(prev => ({ ...prev, selectedObject: null }));
    setCanGroup(false);
    setCanUngroup(false);
  };

  const handleObjectChange = useCallback(() => {
    setTimeout(() => updateCanvasObjects(), 50);
  }, []);

  const setupInitialContent = (canvas: Canvas) => {
    canvas.clear();
    canvas.backgroundColor = CANVAS_DEFAULTS.BACKGROUND_COLOR;
    canvas.renderAll();

    // Add sample text after a short delay (undo/redo is handled automatically)
    setTimeout(() => {
      const sampleText = new Text('Welcome! Try the tools above to add objects', {
        left: 50,
        top: 50,
        fontSize: 18,
        fill: '#666666',
        fontFamily: 'Arial'
      });
      
      canvas.add(sampleText);
      canvas.renderAll();
      
      // Update objects list
      updateCanvasObjects();
    }, 200);
  };

  const updateCanvasObjects = useCallback(() => {
    if (!canvasState.canvas) return;
    
    const objects = canvasState.canvas.getObjects().map((obj: any, index: number) => ({
      id: generateId('object'),
      name: formatObjectName(obj.type || 'object', index),
      type: (obj as any).type || 'text',
      object: obj
    }));
    
    if (currentCanvasLayer === 'front') {
      setFrontObjects(objects);
    } else {
      setBackObjects(objects);
    }
    
    setCanvasObjects(objects);
  }, [canvasState.canvas, currentCanvasLayer]);

  // Update history state when undo/redo manager changes
  const updateHistoryState = useCallback(() => {
    if (!undoRedoManager) return;
    
    const debugInfo = undoRedoManager.getDebugInfo();
    setHistoryState({
      canUndo: debugInfo.canUndo,
      canRedo: debugInfo.canRedo,
      undoStackSize: debugInfo.undoStackSize,
      redoStackSize: debugInfo.redoStackSize
    });
  }, [undoRedoManager]);

  // Effect to set up the callback when undoRedoManager is initialized
  useEffect(() => {
    if (undoRedoManager) {
      // Set up the callback for state changes
      (undoRedoManager as any).setOnStateChangeCallback = (callback: () => void) => {
        (undoRedoManager as any).onStateChange = callback;
      };
      
      // Set the callback
      if ((undoRedoManager as any).setOnStateChangeCallback) {
        (undoRedoManager as any).setOnStateChangeCallback(updateHistoryState);
      }
      
      // Initial update
      updateHistoryState();
    }
  }, [undoRedoManager, updateHistoryState]);

  // Initialize history state on mount and when undoRedoManager changes
  useEffect(() => {
    updateHistoryState();
  }, [updateHistoryState, undoRedoManager]);

  const undo = useCallback(() => {
    if (!undoRedoManager) {
      return;
    }

    const success = undoRedoManager.undo();
    
    if (success) {
      // Update canvas objects list to reflect changes
      setTimeout(() => {
        updateCanvasObjects();
        updateHistoryState();
      }, 100);
    }
  }, [undoRedoManager, updateCanvasObjects, updateHistoryState]);

  const redo = useCallback(() => {
    if (!undoRedoManager) {
      return;
    }

    const success = undoRedoManager.redo();
    
    if (success) {
      // Update canvas objects list to reflect changes
      setTimeout(() => {
        updateCanvasObjects();
        updateHistoryState();
      }, 100);
    }
  }, [undoRedoManager, updateCanvasObjects, updateHistoryState]);

  const addObjectToCanvas = useCallback((object: FabricObject, objectType: string) => {
    if (!canvasState.canvas) return;
    
    canvasState.canvas.add(object);
    canvasState.canvas.setActiveObject(object);
    canvasState.canvas.renderAll();
    
    const newObject = {
      id: generateId(objectType),
      name: formatObjectName(objectType, canvasObjects.length),
      type: objectType as any,
      object
    };
    
    if (currentCanvasLayer === 'front') {
      setFrontObjects(prev => [...prev, newObject]);
    } else {
      setBackObjects(prev => [...prev, newObject]);
    }
    setCanvasObjects(prev => [...prev, newObject]);
    
    // History is automatically saved by FabricUndoRedo
  }, [canvasState.canvas, canvasObjects.length, currentCanvasLayer]);

  const selectObject = useCallback((objectId: string) => {
    if (!canvasState.canvas) return;
    const object = canvasObjects.find(obj => obj.id === objectId);
    if (object) {
      canvasState.canvas.setActiveObject(object.object);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas, canvasObjects]);

  const moveObjectUp = useCallback((objectId: string) => {
    if (!canvasState.canvas) return;
    const object = canvasObjects.find(obj => obj.id === objectId);
    if (object) {
      canvasState.canvas.bringObjectForward(object.object);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas, canvasObjects]);

  const moveObjectDown = useCallback((objectId: string) => {
    if (!canvasState.canvas) return;
    const object = canvasObjects.find(obj => obj.id === objectId);
    if (object) {
      canvasState.canvas.sendObjectBackwards(object.object);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas, canvasObjects]);

  const toggleCanvasLayer = useCallback(() => {
    setCurrentCanvasLayer(prev => prev === 'front' ? 'back' : 'front');
  }, []);

  // Alignment guides functions
  const updateAlignmentGuides = useCallback((config: Partial<AlignmentGuidesConfig>) => {
    setCanvasState(prev => ({
      ...prev,
      alignmentGuides: { ...prev.alignmentGuides!, ...config }
    }));
  }, []);

  const toggleAlignmentGuides = useCallback(() => {
    const enabled = !canvasState.alignmentGuides?.enabled;
    updateAlignmentGuides({ enabled });
    
    if (enabled) {
      alignmentGuides.enableGuides();
    } else {
      alignmentGuides.disableGuides();
    }
  }, [canvasState.alignmentGuides?.enabled, alignmentGuides, updateAlignmentGuides]);

  const toggleObjectVisibility = useCallback((objectId: string) => {
    if (!canvasState.canvas) return;
    const object = canvasObjects.find(obj => obj.id === objectId);
    if (object) {
      const isVisible = object.object.visible !== false;
      object.object.set('visible', !isVisible);
      canvasState.canvas.renderAll();
      updateCanvasObjects();
    }
  }, [canvasState.canvas, canvasObjects, updateCanvasObjects]);

  const deleteObject = useCallback((objectId: string) => {
    if (!canvasState.canvas) return;
    const object = canvasObjects.find(obj => obj.id === objectId);
    if (object) {
      canvasState.canvas.remove(object.object);
      canvasState.canvas.renderAll();
      updateCanvasObjects();
      // History is automatically saved by FabricUndoRedo
    }
  }, [canvasState.canvas, canvasObjects, updateCanvasObjects]);

  // Combined update function for external use (keyboard shortcuts, etc.)
  const updateCanvasAndSaveHistory = useCallback(() => {
    updateCanvasObjects();
    // Manual save current state for programmatic changes
    if (undoRedoManager) {
      undoRedoManager.saveCurrentState();
    }
  }, [updateCanvasObjects, undoRedoManager]);

  // Debug function to log history state
  const logHistoryState = () => {
    if (undoRedoManager) {
      // Debug info available for development
      undoRedoManager.getDebugInfo();
    }
  };

  // Make undo/redo available to keyboard shortcuts
  useEffect(() => {
    if (keyboardShortcuts) {
      // Register undo shortcut
      keyboardShortcuts.registerShortcut({
        key: 'z',
        ctrlKey: true,
        action: () => {
          logHistoryState();
          undo();
        },
        description: 'Undo last action',
        category: 'Edit'
      });

      // Register redo shortcut  
      keyboardShortcuts.registerShortcut({
        key: 'y',
        ctrlKey: true,
        action: () => {
          logHistoryState();
          redo();
        },
        description: 'Redo last action',
        category: 'Edit'
      });

      // Also register Cmd+Shift+Z for redo (Mac style)
      keyboardShortcuts.registerShortcut({
        key: 'z',
        metaKey: true,
        shiftKey: true,
        action: () => {
          logHistoryState();
          redo();
        },
        description: 'Redo last action (Mac)',
        category: 'Edit'
      });
    }
  }, [keyboardShortcuts, undo, redo]);

  return {
    // State
    canvasState,
    canvasObjects,
    frontObjects,
    backObjects,
    currentCanvasLayer,
    canGroup,
    canUngroup,
    
    // History
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    undo,
    redo,
    history: undoRedoManager,
    undoStackSize: historyState.undoStackSize,
    redoStackSize: historyState.redoStackSize,
    logHistoryState,
    
    // Canvas manipulation
    addObjectToCanvas,
    selectObject,
    moveObjectUp,
    moveObjectDown,
    toggleObjectVisibility,
    deleteObject,
    toggleCanvasLayer,
    updateCanvasObjects,
    updateCanvasAndSaveHistory,
    setCanvasState,
    
    // Alignment guides
    alignmentGuides: {
      ...alignmentGuides,
      config: canvasState.alignmentGuides!,
      updateConfig: updateAlignmentGuides,
      toggle: toggleAlignmentGuides,
    },
    
    // Keyboard shortcuts
    keyboardShortcuts,
  };
};
