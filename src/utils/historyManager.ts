import type { HistoryState } from '../types/canvas';

const HISTORY_STORAGE_KEY = 'fabricjs-canvas-history';
const HISTORY_INDEX_KEY = 'fabricjs-canvas-history-index';
const HISTORY_LIMIT = 50;

export class HistoryManager {
  private static instance: HistoryManager;
  private history: HistoryState[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = HISTORY_LIMIT;
  private isRestoring: boolean = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager();
    }
    return HistoryManager.instance;
  }

  /**
   * Load history from localStorage
   */
  private loadFromStorage(): void {
    try {
      const historyData = localStorage.getItem(HISTORY_STORAGE_KEY);
      const indexData = localStorage.getItem(HISTORY_INDEX_KEY);

      if (historyData) {
        this.history = JSON.parse(historyData);
      }

      if (indexData) {
        this.historyIndex = parseInt(indexData, 10);
      }

      // Validate history index
      if (this.historyIndex >= this.history.length) {
        this.historyIndex = this.history.length - 1;
      }
      if (this.historyIndex < -1) {
        this.historyIndex = -1;
      }

    } catch {
      this.history = [];
      this.historyIndex = -1;
    }
  }

  /**
   * Save history to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
      localStorage.setItem(HISTORY_INDEX_KEY, this.historyIndex.toString());
    } catch (error) {
      // If storage is full, try to clear some old history
      if (error instanceof DOMException && error.code === 22) {
        this.clearOldHistory();
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
          localStorage.setItem(HISTORY_INDEX_KEY, this.historyIndex.toString());
        } catch {
          // Failed to save even after clearing old history
        }
      }
    }
  }

  /**
   * Clear old history entries to free up storage space
   */
  private clearOldHistory(): void {
    const targetSize = Math.floor(this.maxHistorySize / 2);
    const itemsToRemove = this.history.length - targetSize;
    
    if (itemsToRemove > 0) {
      this.history.splice(0, itemsToRemove);
      this.historyIndex = Math.max(-1, this.historyIndex - itemsToRemove);
    }
  }

  /**
   * Add a new state to history
   */
  public saveState(state: HistoryState): boolean {
    if (this.isRestoring) {
      return false;
    }

    try {
      // Don't save duplicate states
      if (this.history.length > 0 && this.historyIndex >= 0) {
        const currentState = this.history[this.historyIndex];
        if (currentState?.canvasState === state.canvasState) {
          return false;
        }
      }

      // Remove any states after current index (for branching)
      this.history = this.history.slice(0, this.historyIndex + 1);
      
      // Add new state
      this.history.push(state);
      this.historyIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.historyIndex = this.maxHistorySize - 1;
      }

      this.saveToStorage();
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current state
   */
  public getCurrentState(): HistoryState | null {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return this.history[this.historyIndex];
    }
    return null;
  }

  /**
   * Undo to previous state
   */
  public undo(): HistoryState | null {
    if (this.canUndo()) {
      this.isRestoring = true;
      this.historyIndex--;
      this.saveToStorage();
      
      const state = this.getCurrentState();
      this.isRestoring = false;
      return state;
    }
    return null;
  }

  /**
   * Redo to next state
   */
  public redo(): HistoryState | null {
    if (this.canRedo()) {
      this.isRestoring = true;
      this.historyIndex++;
      this.saveToStorage();
      
      const state = this.getCurrentState();
      this.isRestoring = false;
      return state;
    }
    return null;
  }

  /**
   * Check if undo is possible
   */
  public canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Check if currently restoring
   */
  public isCurrentlyRestoring(): boolean {
    return this.isRestoring;
  }

  /**
   * Get history length
   */
  public getHistoryLength(): number {
    return this.history.length;
  }

  /**
   * Get current history index
   */
  public getHistoryIndex(): number {
    return this.historyIndex;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      localStorage.removeItem(HISTORY_INDEX_KEY);
    } catch {
      // Failed to clear localStorage - ignore error
    }
  }

  /**
   * Get debug information
   */
  public getDebugInfo(): { historyLength: number; historyIndex: number; canUndo: boolean; canRedo: boolean; isRestoring: boolean } {
    return {
      historyLength: this.history.length,
      historyIndex: this.historyIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      isRestoring: this.isRestoring
    };
  }
}

export default HistoryManager;
