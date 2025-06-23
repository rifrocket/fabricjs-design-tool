import { useEffect, useCallback, useRef } from 'react';
import { Canvas, FabricObject, Group, ActiveSelection } from 'fabric';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: (canvas: Canvas) => void;
  description: string;
  category?: string;
}

interface UseCanvasKeyboardShortcutsOptions {
  enabled?: boolean;
  enableClipboard?: boolean;
  onObjectUpdate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const DEFAULT_OPTIONS: UseCanvasKeyboardShortcutsOptions = {
  enabled: true,
  enableClipboard: true,
  onObjectUpdate: undefined,
};

export const useCanvasKeyboardShortcuts = (
  canvas: Canvas | null,
  options: UseCanvasKeyboardShortcutsOptions = DEFAULT_OPTIONS
) => {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const clipboardDataRef = useRef<string | null>(null);
  const isEnabledRef = useRef(options.enabled ?? true);

  // Helper function to create shortcut key
  const createShortcutKey = (shortcut: Omit<KeyboardShortcut, 'action' | 'description' | 'category'>): string => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.metaKey) parts.push('meta');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  };

  // Register a new keyboard shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = createShortcutKey(shortcut);
    shortcutsRef.current.set(key, shortcut);
  }, []);

  // Unregister a keyboard shortcut
  const unregisterShortcut = useCallback((shortcutKey: string | Omit<KeyboardShortcut, 'action' | 'description' | 'category'>) => {
    const key = typeof shortcutKey === 'string' ? shortcutKey : createShortcutKey(shortcutKey);
    shortcutsRef.current.delete(key);
  }, []);

  // Get all registered shortcuts
  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  // Copy selected objects to clipboard
  const copyToClipboard = useCallback(async (canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    
    if (activeObjects.length === 0) {
      return;
    }

    try {
      const serializedObjects = activeObjects.map(obj => obj.toObject());
      const clipboardData = JSON.stringify(serializedObjects);
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(clipboardData);
      } else {
        // Fallback for non-secure contexts
        clipboardDataRef.current = clipboardData;
      }
    } catch {
      // Fallback to internal clipboard
      const serializedObjects = activeObjects.map(obj => obj.toObject());
      clipboardDataRef.current = JSON.stringify(serializedObjects);
    }
  }, []);

  // Paste objects from clipboard
  const pasteFromClipboard = useCallback(async (canvas: Canvas) => {
    try {
      let clipboardData: string | null = null;
      
      if (navigator.clipboard && window.isSecureContext) {
        clipboardData = await navigator.clipboard.readText();
      } else {
        clipboardData = clipboardDataRef.current;
      }

      if (!clipboardData) {
        return;
      }

      let objects;
      try {
        objects = JSON.parse(clipboardData);
      } catch {
        return;
      }

      if (!Array.isArray(objects)) {
        return;
      }

      canvas.discardActiveObject();
      
      // Use canvas.loadFromJSON to load all objects at once
      const currentObjects = canvas.getObjects().map(obj => obj.toObject());
      const offsetObjects = objects.map(obj => ({
        ...obj,
        left: (obj.left || 0) + 20,
        top: (obj.top || 0) + 20,
      }));
      
      const allObjects = [...currentObjects, ...offsetObjects];
      
      canvas.loadFromJSON({ objects: allObjects }, () => {
        const newObjects = canvas.getObjects().slice(-objects.length);
        
        if (newObjects.length > 0) {
          if (newObjects.length === 1) {
            canvas.setActiveObject(newObjects[0]);
          } else {
            const selection = new ActiveSelection(newObjects, {
              canvas: canvas
            });
            canvas.setActiveObject(selection);
          }
          
          // Trigger object list update
          if (options.onObjectUpdate) {
            setTimeout(() => options.onObjectUpdate!(), 100);
          }
        }
        
        canvas.renderAll();
      });
    } catch {
      // Failed to paste from clipboard
    }
  }, [options]);

  // Move selected objects
  const moveSelection = useCallback((canvas: Canvas, deltaX: number, deltaY: number) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set({
        left: (obj.left || 0) + deltaX,
        top: (obj.top || 0) + deltaY,
      });
      obj.setCoords();
    });
    
    canvas.renderAll();
  }, []);

  // Rotate selected objects
  const rotateSelection = useCallback((canvas: Canvas, deltaAngle: number) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      const currentAngle = obj.angle || 0;
      obj.set('angle', currentAngle + deltaAngle);
      obj.setCoords();
    });
    
    canvas.renderAll();
  }, []);

  // Group/ungroup selection
  const toggleGroup = useCallback((canvas: Canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject.type === 'group') {
      // Ungroup
      const group = activeObject as Group;
      const objects = group.getObjects().slice() as FabricObject[];
      
      canvas.remove(group);
      objects.forEach((obj: FabricObject) => {
        (group as any)._exitGroup(obj);
        obj.set({ selectable: true, evented: true });
        obj.setCoords();
        canvas.add(obj);
      });
      
      if (objects.length === 1) {
        canvas.setActiveObject(objects[0]);
      } else if (objects.length > 1) {
        const selection = new ActiveSelection(objects, {
          canvas: canvas
        });
        canvas.setActiveObject(selection);
      }
    } else {
      // Group
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 1) {
        canvas.discardActiveObject();
        
        activeObjects.forEach((obj: FabricObject) => {
          canvas.remove(obj);
        });

        const group = new Group(activeObjects, {
          selectable: true,
          evented: true,
        });

        canvas.add(group);
        canvas.setActiveObject(group);
      }
    }
    
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Delete selected objects
  const deleteSelection = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    canvas.discardActiveObject();
    activeObjects.forEach(obj => {
      canvas.remove(obj);
    });
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Bring selection forward
  const bringSelectionForward = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj: FabricObject) => {
      const currentIndex = canvas.getObjects().indexOf(obj);
      if (currentIndex < canvas.getObjects().length - 1) {
        canvas.moveObjectTo(obj, currentIndex + 1);
      }
    });
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Send selection backward
  const sendSelectionBackward = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj: FabricObject) => {
      const currentIndex = canvas.getObjects().indexOf(obj);
      if (currentIndex > 0) {
        canvas.moveObjectTo(obj, currentIndex - 1);
      }
    });
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Bring selection to front
  const bringSelectionToFront = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj: FabricObject) => {
      canvas.moveObjectTo(obj, canvas.getObjects().length - 1);
    });
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Send selection to back
  const sendSelectionToBack = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj: FabricObject) => {
      canvas.moveObjectTo(obj, 0);
    });
    canvas.renderAll();
    
    // Trigger object list update
    if (options.onObjectUpdate) {
      options.onObjectUpdate();
    }
  }, [options]);

  // Select all objects
  const selectAll = useCallback((canvas: Canvas) => {
    const allObjects = canvas.getObjects();
    if (allObjects.length === 0) return;

    if (allObjects.length === 1) {
      canvas.setActiveObject(allObjects[0]);
    } else {
      const selection = new ActiveSelection(allObjects, {
        canvas: canvas
      });
      canvas.setActiveObject(selection);
    }
    canvas.renderAll();
  }, []);

  // Register default shortcuts
  const registerDefaultShortcuts = useCallback(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      // Copy/Paste
      {
        key: 'c',
        ctrlKey: true,
        action: copyToClipboard,
        description: 'Copy selected objects',
        category: 'Clipboard'
      },
      {
        key: 'c',
        metaKey: true,
        action: copyToClipboard,
        description: 'Copy selected objects (Mac)',
        category: 'Clipboard'
      },
      {
        key: 'v',
        ctrlKey: true,
        action: pasteFromClipboard,
        description: 'Paste objects from clipboard',
        category: 'Clipboard'
      },
      {
        key: 'v',
        metaKey: true,
        action: pasteFromClipboard,
        description: 'Paste objects from clipboard (Mac)',
        category: 'Clipboard'
      },
      
      // Delete
      {
        key: 'Delete',
        action: deleteSelection,
        description: 'Delete selected objects',
        category: 'Edit'
      },
      {
        key: 'Backspace',
        action: deleteSelection,
        description: 'Delete selected objects',
        category: 'Edit'
      },
      
      // Undo/Redo
      {
        key: 'z',
        ctrlKey: true,
        action: () => options.onUndo?.(),
        description: 'Undo last action',
        category: 'Edit'
      },
      {
        key: 'z',
        metaKey: true,
        action: () => options.onUndo?.(),
        description: 'Undo last action (Mac)',
        category: 'Edit'
      },
      {
        key: 'y',
        ctrlKey: true,
        action: () => options.onRedo?.(),
        description: 'Redo last action',
        category: 'Edit'
      },
      {
        key: 'y',
        metaKey: true,
        action: () => options.onRedo?.(),
        description: 'Redo last action (Mac)',
        category: 'Edit'
      },
      {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        action: () => options.onRedo?.(),
        description: 'Redo last action (Ctrl+Shift+Z)',
        category: 'Edit'
      },
      {
        key: 'z',
        metaKey: true,
        shiftKey: true,
        action: () => options.onRedo?.(),
        description: 'Redo last action (Cmd+Shift+Z)',
        category: 'Edit'
      },
      
      // Group/Ungroup
      {
        key: 'g',
        ctrlKey: true,
        action: toggleGroup,
        description: 'Group/ungroup selection',
        category: 'Edit'
      },
      
      // Move (1px)
      {
        key: 'ArrowLeft',
        action: (canvas) => moveSelection(canvas, -1, 0),
        description: 'Move selection left (1px)',
        category: 'Move'
      },
      {
        key: 'ArrowRight',
        action: (canvas) => moveSelection(canvas, 1, 0),
        description: 'Move selection right (1px)',
        category: 'Move'
      },
      {
        key: 'ArrowUp',
        action: (canvas) => moveSelection(canvas, 0, -1),
        description: 'Move selection up (1px)',
        category: 'Move'
      },
      {
        key: 'ArrowDown',
        action: (canvas) => moveSelection(canvas, 0, 1),
        description: 'Move selection down (1px)',
        category: 'Move'
      },
      
      // Move more (10px)
      {
        key: 'ArrowLeft',
        shiftKey: true,
        action: (canvas) => moveSelection(canvas, -10, 0),
        description: 'Move selection left (10px)',
        category: 'Move'
      },
      {
        key: 'ArrowRight',
        shiftKey: true,
        action: (canvas) => moveSelection(canvas, 10, 0),
        description: 'Move selection right (10px)',
        category: 'Move'
      },
      {
        key: 'ArrowUp',
        shiftKey: true,
        action: (canvas) => moveSelection(canvas, 0, -10),
        description: 'Move selection up (10px)',
        category: 'Move'
      },
      {
        key: 'ArrowDown',
        shiftKey: true,
        action: (canvas) => moveSelection(canvas, 0, 10),
        description: 'Move selection down (10px)',
        category: 'Move'
      },
      
      // Rotate (1deg)
      {
        key: 'ArrowLeft',
        ctrlKey: true,
        action: (canvas) => rotateSelection(canvas, -1),
        description: 'Rotate selection left (1°)',
        category: 'Transform'
      },
      {
        key: 'ArrowRight',
        ctrlKey: true,
        action: (canvas) => rotateSelection(canvas, 1),
        description: 'Rotate selection right (1°)',
        category: 'Transform'
      },
      
      // Rotate more (10deg)
      {
        key: 'ArrowLeft',
        ctrlKey: true,
        shiftKey: true,
        action: (canvas) => rotateSelection(canvas, -10),
        description: 'Rotate selection left (10°)',
        category: 'Transform'
      },
      {
        key: 'ArrowRight',
        ctrlKey: true,
        shiftKey: true,
        action: (canvas) => rotateSelection(canvas, 10),
        description: 'Rotate selection right (10°)',
        category: 'Transform'
      },
      
      // Layer order
      {
        key: 'ArrowUp',
        ctrlKey: true,
        action: bringSelectionForward,
        description: 'Bring selection forward',
        category: 'Layer'
      },
      {
        key: 'ArrowDown',
        ctrlKey: true,
        action: sendSelectionBackward,
        description: 'Send selection backward',
        category: 'Layer'
      },
      
      // Layer order more
      {
        key: 'ArrowUp',
        ctrlKey: true,
        shiftKey: true,
        action: bringSelectionToFront,
        description: 'Bring selection to front',
        category: 'Layer'
      },
      {
        key: 'ArrowDown',
        ctrlKey: true,
        shiftKey: true,
        action: sendSelectionToBack,
        description: 'Send selection to back',
        category: 'Layer'
      },
      
      // Select all
      {
        key: 'a',
        ctrlKey: true,
        action: selectAll,
        description: 'Select all objects',
        category: 'Selection'
      },
    ];

    defaultShortcuts.forEach(registerShortcut);
  }, [
    registerShortcut,
    copyToClipboard,
    pasteFromClipboard,
    deleteSelection,
    toggleGroup,
    moveSelection,
    rotateSelection,
    bringSelectionForward,
    sendSelectionBackward,
    bringSelectionToFront,
    sendSelectionToBack,
    selectAll,
    options
  ]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!canvas || !isEnabledRef.current) {
      return;
    }

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key;
    const ctrlKey = event.ctrlKey;
    const metaKey = event.metaKey;
    const shiftKey = event.shiftKey;
    const altKey = event.altKey;

    const shortcutKey = createShortcutKey({ key, ctrlKey, metaKey, shiftKey, altKey });
    const shortcut = shortcutsRef.current.get(shortcutKey);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action(canvas);
    }
  }, [canvas]);

  // Enable/disable shortcuts
  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  // Get enabled state
  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!canvas) return;

    // Register default shortcuts
    registerDefaultShortcuts();

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Capture the current value at cleanup time
      const currentShortcuts = shortcutsRef.current;
      if (currentShortcuts) {
        currentShortcuts.clear();
      }
    };
  }, [canvas, handleKeyDown, registerDefaultShortcuts]);

  // Update enabled state when options change
  useEffect(() => {
    isEnabledRef.current = options.enabled ?? true;
  }, [options.enabled]);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    setEnabled,
    isEnabled,
    // Expose individual actions for programmatic use
    actions: {
      copyToClipboard,
      pasteFromClipboard,
      deleteSelection,
      toggleGroup,
      moveSelection,
      rotateSelection,
      bringSelectionForward,
      sendSelectionBackward,
      bringSelectionToFront,
      sendSelectionToBack,
      selectAll,
    }
  };
};
