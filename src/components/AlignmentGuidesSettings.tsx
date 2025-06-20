import { useState } from 'react';
import type { AlignmentGuidesConfig } from '../types/canvas';

interface AlignmentGuidesSettingsProps {
  config: AlignmentGuidesConfig;
  onUpdate: (config: Partial<AlignmentGuidesConfig>) => void;
  onToggle: () => void;
}

export const AlignmentGuidesSettings: React.FC<AlignmentGuidesSettingsProps> = ({
  config,
  onUpdate,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleColorChange = (color: string) => {
    onUpdate({ lineColor: color });
  };

  const handleWidthChange = (width: number) => {
    onUpdate({ lineWidth: width });
  };

  const handleMarginChange = (margin: number) => {
    onUpdate({ lineMargin: margin });
  };

  const presetColors = [
    '#32D10A', // Default green
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Light green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#FFA07A', // Light salmon
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Alignment Guides
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.enabled
                ? 'bg-green-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className={`h-4 w-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && config.enabled && (
        <div className="space-y-4">
          {/* Line Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Line Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    config.lineColor === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={config.lineColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* Line Width */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Line Width: {config.lineWidth}px
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={config.lineWidth}
              onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Snap Distance */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Snap Distance: {config.lineMargin}px
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={config.lineMargin}
              onChange={(e) => handleMarginChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showCenterGuides}
                onChange={(e) => onUpdate({ showCenterGuides: e.target.checked })}
                className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Show center guides
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.snapToObjects}
                onChange={(e) => onUpdate({ snapToObjects: e.target.checked })}
                className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Snap to objects
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.snapToCanvas}
                onChange={(e) => onUpdate({ snapToCanvas: e.target.checked })}
                className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Snap to canvas edges
              </span>
            </label>
          </div>

          {/* Status Indicator */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: config.enabled ? config.lineColor : '#gray' }}
              />
              <span>
                {config.enabled ? 'Guides active' : 'Guides disabled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlignmentGuidesSettings;
