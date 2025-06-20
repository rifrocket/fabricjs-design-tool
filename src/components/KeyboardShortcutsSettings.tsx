import React, { useState, useEffect } from 'react';
import type { KeyboardShortcut } from '../hooks/useCanvasKeyboardShortcuts';

interface KeyboardShortcutsSettingsProps {
  keyboardShortcuts: {
    getShortcuts: () => KeyboardShortcut[];
    registerShortcut: (shortcut: KeyboardShortcut) => void;
    unregisterShortcut: (shortcutKey: string | Omit<KeyboardShortcut, 'action' | 'description' | 'category'>) => void;
    setEnabled: (enabled: boolean) => void;
    isEnabled: () => boolean;
    actions: {
      copyToClipboard: () => void;
      pasteFromClipboard: () => void;
      deleteSelection: () => void;
      toggleGroup: () => void;
      moveSelection: (x: number, y: number) => void;
      rotateSelection: (angle: number) => void;
      bringSelectionForward: () => void;
      sendSelectionBackward: () => void;
      bringSelectionToFront: () => void;
      sendSelectionToBack: () => void;
      selectAll: () => void;
    };
  };
}

interface ShortcutsByCategory {
  [category: string]: KeyboardShortcut[];
}

const KeyboardShortcutsSettings: React.FC<KeyboardShortcutsSettingsProps> = ({
  keyboardShortcuts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutsByCategory>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Edit', 'Move']));

  // Load shortcuts and group by category
  useEffect(() => {
    const allShortcuts = keyboardShortcuts.getShortcuts();
    const grouped: ShortcutsByCategory = {};
    
    allShortcuts.forEach(shortcut => {
      const category = shortcut.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(shortcut);
    });
    
    setShortcuts(grouped);
    setIsEnabled(keyboardShortcuts.isEnabled());
  }, [keyboardShortcuts]);

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

  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    keyboardShortcuts.setEnabled(newEnabled);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryOrder = ['Edit', 'Move', 'Transform', 'Layer', 'Selection', 'Clipboard', 'Other'];
  const sortedCategories = categoryOrder.filter(cat => shortcuts[cat]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">⌨️</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isEnabled 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <span className="text-gray-400">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Shortcuts
            </span>
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="space-y-3">
            {sortedCategories.map(category => (
              <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category} ({shortcuts[category].length})
                  </span>
                  <span className="text-gray-400">
                    {expandedCategories.has(category) ? '▲' : '▼'}
                  </span>
                </button>
                
                {expandedCategories.has(category) && (
                  <div className="px-3 pb-2 space-y-2">
                    {shortcuts[category].map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-600 first:border-t-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {shortcut.description}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {formatShortcutDisplay(shortcut)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="space-y-1">
              <li>• Shortcuts work when the canvas is focused</li>
              <li>• Use Ctrl (or Cmd on Mac) for modifier keys</li>
              <li>• Hold Shift for larger increments (10x)</li>
              <li>• Shortcuts are disabled when typing in input fields</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcutsSettings;
