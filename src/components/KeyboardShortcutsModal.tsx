import React, { useEffect } from 'react';
import type { KeyboardShortcut } from '../hooks/useCanvasKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

interface ShortcutsByCategory {
  [category: string]: KeyboardShortcut[];
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts: ShortcutsByCategory = {};
  shortcuts.forEach(shortcut => {
    const category = shortcut.category || 'Other';
    if (!groupedShortcuts[category]) {
      groupedShortcuts[category] = [];
    }
    groupedShortcuts[category].push(shortcut);
  });

  const formatShortcutDisplay = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey || shortcut.metaKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    let key = shortcut.key;
    if (key === 'ArrowLeft') key = '←';
    else if (key === 'ArrowRight') key = '→';
    else if (key === 'ArrowUp') key = '↑';
    else if (key === 'ArrowDown') key = '↓';
    else if (key === 'Delete') key = 'Del';
    else if (key === 'Backspace') key = '⌫';
    else key = key.toUpperCase();
    
    parts.push(key);
    return parts.join(' + ');
  };

  const categoryOrder = ['Edit', 'Move', 'Transform', 'Layer', 'Selection', 'Clipboard', 'Other'];
  const sortedCategories = categoryOrder.filter(cat => groupedShortcuts[cat]);

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Edit': return '✏️';
      case 'Move': return '🔄';
      case 'Transform': return '🔄';
      case 'Layer': return '📚';
      case 'Selection': return '🎯';
      case 'Clipboard': return '📋';
      default: return '⚙️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⌨️</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {shortcuts.length} shortcuts available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedCategories.map(category => (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {category}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {groupedShortcuts[category].length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {shortcut.description}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          {formatShortcutDisplay(shortcut)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 Tips for using shortcuts
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Make sure the canvas is focused (click on it first)</li>
                <li>• Shortcuts work with selected objects on the canvas</li>
                <li>• Use <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">Shift</kbd> for 10x larger movements/rotations</li>
                <li>• On Mac, use <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">Cmd</kbd> instead of <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">Ctrl</kbd></li>
                <li>• Shortcuts are disabled when typing in input fields</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> to close
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
