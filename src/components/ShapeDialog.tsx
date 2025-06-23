import React, { useState, useMemo } from 'react';
import {
  X,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Octagon,
  ArrowRight,
  Heart,
  Cloud,
  Zap,
  MessageCircle,
  Plus,
  Diamond,
  Hexagon,
  Bookmark,
  RectangleHorizontal,
  Ellipsis,
  Shapes,
  Search,
  Grid
} from '../utils/icons';

interface ShapeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShapeSelect: (shapeType: string, shapeConfig?: any) => void;
}

// Shape categories for better organization
const SHAPE_CATEGORIES = [
  {
    id: 'basic',
    name: 'Basic Shapes',
    shapes: [
      { type: 'rectangle', icon: Square, label: 'Rectangle', preview: '▭', color: '#ff0000' },
      { type: 'circle', icon: Circle, label: 'Circle', preview: '●', color: '#0000ff' },
      { type: 'ellipse', icon: Ellipsis, label: 'Ellipse', preview: '⬯', color: '#9b59b6' },
      { type: 'line', icon: Minus, label: 'Line', preview: '—', color: '#000000' },
      { type: 'roundedRectangle', icon: RectangleHorizontal, label: 'Rounded Rectangle', preview: '▢', color: '#3498db' },
    ]
  },
  {
    id: 'polygons',
    name: 'Polygons',
    shapes: [
      { type: 'triangle', icon: Triangle, label: 'Triangle', preview: '▲', color: '#4ecdc4' },
      { type: 'diamond', icon: Diamond, label: 'Diamond', preview: '◆', color: '#f39c12' },
      { type: 'pentagon', icon: Shapes, label: 'Pentagon', preview: '⬟', color: '#45b7d1' },
      { type: 'hexagon', icon: Octagon, label: 'Hexagon', preview: '⬢', color: '#f7b801' },
      { type: 'octagonShape', icon: Octagon, label: 'Octagon', preview: '⯃', color: '#d35400' },
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    shapes: [
      { type: 'star', icon: Star, label: 'Star', preview: '★', color: '#fd79a8' },
      { type: 'heart', icon: Heart, label: 'Heart', preview: '♥', color: '#e91e63' },
      { type: 'cross', icon: Plus, label: 'Cross', preview: '✚', color: '#34495e' },
      { type: 'arrow', icon: ArrowRight, label: 'Arrow', preview: '→', color: '#e74c3c' },
    ]
  },
  {
    id: 'special',
    name: 'Special Shapes',
    shapes: [
      { type: 'cloud', icon: Cloud, label: 'Cloud', preview: '☁', color: '#bdc3c7' },
      { type: 'lightning', icon: Zap, label: 'Lightning', preview: '⚡', color: '#f1c40f' },
      { type: 'speechBubble', icon: MessageCircle, label: 'Speech Bubble', preview: '💬', color: '#95a5a6' },
      { type: 'parallelogram', icon: Hexagon, label: 'Parallelogram', preview: '▱', color: '#16a085' },
      { type: 'trapezoid', icon: Bookmark, label: 'Trapezoid', preview: '⏢', color: '#8e44ad' },
    ]
  }
];

// Get all shapes for the "All" category
const ALL_SHAPES = SHAPE_CATEGORIES.flatMap(category => category.shapes);

const ShapeDialog: React.FC<ShapeDialogProps> = ({ isOpen, onClose, onShapeSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleShapeSelect = (shapeType: string) => {
    // Create basic shape configuration - all customization will be handled in the right panel
    const config: any = {
      fill: '#3498db',
      stroke: '#2c3e50',
      strokeWidth: 2,
      left: 100,
      top: 100,
      selectable: true,
      evented: true
    };

    // Add shape-specific properties with default values
    switch (shapeType) {
      case 'rectangle':
      case 'roundedRectangle':
        config.width = 100;
        config.height = 80;
        break;
      case 'circle':
        config.radius = 50;
        break;
      case 'ellipse':
        config.rx = 50;
        config.ry = 40;
        break;
      case 'line':
        config.x1 = 0;
        config.y1 = 0;
        config.x2 = 100;
        config.y2 = 0;
        break;
      default:
        // For polygon shapes, use default positioning
        break;
    }

    onShapeSelect(shapeType, config);
    onClose();
  };

  // Create filtered shapes based on search and category
  const filteredShapes = useMemo(() => {
    let shapes = selectedCategory === 'all' ? ALL_SHAPES : 
      SHAPE_CATEGORIES.find(cat => cat.id === selectedCategory)?.shapes || [];
    
    if (searchTerm) {
      shapes = shapes.filter(shape => 
        shape.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shape.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return shapes;
  }, [selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Choose a Shape</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search shapes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Categories */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
              <div className="space-y-2">
                {/* All Category */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCategory === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Grid size={16} />
                    <div>
                      <div className="font-medium">All Shapes</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {ALL_SHAPES.length} shapes
                      </div>
                    </div>
                  </div>
                </button>

                {/* Category Buttons */}
                {SHAPE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {category.shapes.length} shapes
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel - Shape Grid (takes up 3 columns) */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {selectedCategory === 'all' ? 'All Shapes' : 
                   SHAPE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'Shapes'}
                  {searchTerm && ` (filtered by "${searchTerm}")`}
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredShapes.length} shape{filteredShapes.length !== 1 ? 's' : ''}
                </div>
              </div>

              {filteredShapes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Grid size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No shapes found</p>
                  <p className="text-sm">Try adjusting your search or selecting a different category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredShapes.map((shape) => {
                    const IconComponent = shape.icon;
                    return (
                      <button
                        key={shape.type}
                        onClick={() => handleShapeSelect(shape.type)}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group hover:scale-105"
                      >
                        <div 
                          className="text-3xl mb-2 group-hover:scale-110 transition-transform"
                          style={{ color: shape.color }}
                        >
                          {shape.preview}
                        </div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <IconComponent size={14} className="text-gray-500" />
                        </div>
                        <div className="text-xs font-medium text-gray-700">{shape.label}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Select a shape to add it to your canvas. Customize properties in the right panel.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShapeDialog;
