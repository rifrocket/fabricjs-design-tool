import React from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  Type,
  Square,
  Minus,
  Image,
  Circle,
  Triangle,
  Shapes,
  Octagon,
  Star,
  QrCode
} from '../utils/icons';
import type { CanvasObject } from '../types/canvas';

interface LeftSidebarProps {
  objects: CanvasObject[];
  onSelectObject: (objectId: string) => void;
  onToggleVisibility: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  objects,
  onSelectObject,
  onToggleVisibility,
  onDeleteObject
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type size={14} className="text-gray-500" />;
      case 'rect':
        return <Square size={14} className="text-gray-500" />;
      case 'line':
        return <Minus size={14} className="text-gray-500" />;
      case 'image':
        return <Image size={14} className="text-gray-500" />;
      case 'circle':
        return <Circle size={14} className="text-gray-500" />;
      case 'triangle':
        return <Triangle size={14} className="text-gray-500" />;
      case 'pentagon':
        return <Shapes size={14} className="text-gray-500" />;
      case 'hexagon':
        return <Octagon size={14} className="text-gray-500" />;
      case 'star':
        return <Star size={14} className="text-gray-500" />;
      case 'qrcode':
        return <QrCode size={14} className="text-gray-500" />;
      default:
        return <Type size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-4">
          <div className="space-y-1">
            {objects.map((obj) => (
            <div 
              key={obj.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm group hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectObject(obj.id)}
            >
              <div className="flex items-center space-x-2">
                {getIcon(obj.type)}
                <span className={`text-gray-700 ${obj.object?.visible === false ? 'opacity-50' : ''}`}>
                  {obj.name}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(obj.id);
                  }}
                  title={obj.object?.visible === false ? 'Show layer' : 'Hide layer'}
                >
                  {obj.object?.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button 
                  className="p-1 hover:bg-red-200 rounded text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteObject(obj.id);
                  }}
                  title="Delete layer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;