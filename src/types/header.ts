// Header action props interface for better type safety and maintainability
export interface HeaderActions {
  // Tool selection
  onToolSelect: (tool: string) => void;
  selectedTool: string;
  
  // Object creation functions
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
  
  // Export functionality
  onExport: (format: 'pdf' | 'png' | 'svg' | 'json' | 'jpeg') => void;
  
  // History actions
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Object alignment
  onAlignObjects: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  
  // Object grouping
  onGroupObjects: () => void;
  onUngroupObjects: () => void;
  canGroup: boolean;
  canUngroup: boolean;
  
  // Testing (optional)
  onTestCanvas?: () => void;
}

// Tool button configuration
export interface ToolConfig {
  tool: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  title: string;
}

// Export format configuration
export interface ExportFormat {
  format: 'pdf' | 'png' | 'svg' | 'json' | 'jpeg';
  label: string;
  description: string;
}
