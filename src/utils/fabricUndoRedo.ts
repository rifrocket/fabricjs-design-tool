import { Canvas } from 'fabric';

export interface CanvasState {
  canvasData: string;
  timestamp: number;
}

export class FabricUndoRedo {
  private canvas: Canvas;
  private undoStack: CanvasState[] = [];
  private redoStack: CanvasState[] = [];
  private maxStackSize: number = 50;
  private isPerformingUndoRedo: boolean = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  private onStateChange?: () => void;

  constructor(canvas: Canvas, maxStackSize: number = 50, onStateChange?: () => void) {
    this.canvas = canvas;
    this.maxStackSize = maxStackSize;
    this.onStateChange = onStateChange;
    this.initializeEventListeners();
    this.saveInitialState();
  }

  /**
   * Initialize event listeners for canvas changes
   */
  private initializeEventListeners(): void {
    // Object addition
    this.canvas.on('object:added', () => {
      if (!this.isPerformingUndoRedo) {
        this.debouncedSaveState();
      }
    });

    // Object modification (move, scale, rotate, etc.)
    this.canvas.on('object:modified', () => {
      if (!this.isPerformingUndoRedo) {
        this.debouncedSaveState();
      }
    });

    // Object removal
    this.canvas.on('object:removed', () => {
      if (!this.isPerformingUndoRedo) {
        this.debouncedSaveState();
      }
    });

    // Path creation (for free drawing)
    this.canvas.on('path:created', () => {
      if (!this.isPerformingUndoRedo) {
        this.debouncedSaveState();
      }
    });

    // Object skewing
    this.canvas.on('object:skewing', () => {
      if (!this.isPerformingUndoRedo) {
        this.debouncedSaveState();
      }
    });
  }

  /**
   * Debounced state saving to prevent too many saves during rapid changes
   */
  private debouncedSaveState(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveState();
    }, 300); // 300ms debounce
  }

  /**
   * Save the current canvas state to the undo stack
   */
  private saveState(): void {
    if (this.isPerformingUndoRedo) {
      return;
    }

    try {
      const canvasData = JSON.stringify(this.canvas.toJSON());
      const state: CanvasState = {
        canvasData,
        timestamp: Date.now()
      };

      // Don't save duplicate states
      const lastState = this.undoStack[this.undoStack.length - 1];
      if (lastState && lastState.canvasData === canvasData) {
        return;
      }

      // Add to undo stack
      this.undoStack.push(state);

      // Clear redo stack when new action is performed
      this.redoStack = [];

      // Limit stack size
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift(); // Remove oldest state
      }

      // Notify UI of state change
      if (this.onStateChange) {
        this.onStateChange();
      }

    } catch {
      // Handle save state error silently
    }
  }

  /**
   * Save the initial canvas state
   */
  private saveInitialState(): void {
    // Small delay to ensure canvas is fully initialized
    setTimeout(() => {
      this.saveState();
    }, 100);
  }

  /**
   * Undo the last action
   */
  public undo(): boolean {
    if (this.undoStack.length <= 1) {
      return false;
    }

    try {
      this.isPerformingUndoRedo = true;

      // Move current state to redo stack
      const currentState = this.undoStack.pop();
      if (currentState) {
        this.redoStack.push(currentState);
      }

      // Get previous state
      const previousState = this.undoStack[this.undoStack.length - 1];
      
      if (previousState) {
        // Load previous state
        this.canvas.loadFromJSON(previousState.canvasData).then(() => {
          this.canvas.renderAll();
          this.isPerformingUndoRedo = false;
          
          // Notify UI of state change
          if (this.onStateChange) {
            this.onStateChange();
          }
        }).catch(() => {
          this.isPerformingUndoRedo = false;
        });

        return true;
      }
    } catch {
      this.isPerformingUndoRedo = false;
    }

    return false;
  }

  /**
   * Redo the last undone action
   */
  public redo(): boolean {
    if (this.redoStack.length === 0) {
      return false;
    }

    try {
      this.isPerformingUndoRedo = true;

      // Get state from redo stack
      const stateToRedo = this.redoStack.pop();
      
      if (stateToRedo) {
        // Add current state to undo stack
        this.undoStack.push(stateToRedo);

        // Load redo state
        this.canvas.loadFromJSON(stateToRedo.canvasData).then(() => {
          this.canvas.renderAll();
          this.isPerformingUndoRedo = false;
          
          // Notify UI of state change
          if (this.onStateChange) {
            this.onStateChange();
          }
        }).catch(() => {
          this.isPerformingUndoRedo = false;
        });

        return true;
      }
    } catch {
      this.isPerformingUndoRedo = false;
    }

    return false;
  }

  /**
   * Check if undo is available
   */
  public canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  /**
   * Check if redo is available
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.saveInitialState();
  }

  /**
   * Get debug information
   */
  public getDebugInfo(): {
    undoStackSize: number;
    redoStackSize: number;
    canUndo: boolean;
    canRedo: boolean;
    isPerformingUndoRedo: boolean;
  } {
    return {
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      isPerformingUndoRedo: this.isPerformingUndoRedo
    };
  }

  /**
   * Manually save current state (useful for programmatic changes)
   */
  public saveCurrentState(): void {
    this.saveState();
  }

  /**
   * Manually trigger state change callback (useful for external updates)
   */
  public triggerStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  /**
   * Destroy the undo/redo system and clean up event listeners
   */
  public destroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Remove event listeners
    this.canvas.off('object:added');
    this.canvas.off('object:modified');
    this.canvas.off('object:removed');
    this.canvas.off('path:created');
    this.canvas.off('object:skewing');
    
    // Clear stacks
    this.undoStack = [];
    this.redoStack = [];
    
  }
}

export default FabricUndoRedo;
