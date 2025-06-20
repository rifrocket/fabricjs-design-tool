/**
 * Shape coordinate definitions and default colors
 * Separated from ShapeFactory for better organization and maintainability
 */

// Shape coordinates for polygon creation
export const SHAPE_COORDINATES = {
  triangle: [
    { x: 0, y: -50 },
    { x: -43.3, y: 25 },
    { x: 43.3, y: 25 }
  ],
  pentagon: [
    { x: 0, y: -50 },
    { x: 47.6, y: -15.5 },
    { x: 29.4, y: 40.5 },
    { x: -29.4, y: 40.5 },
    { x: -47.6, y: -15.5 }
  ],
  hexagon: [
    { x: 0, y: -50 },
    { x: 43.3, y: -25 },
    { x: 43.3, y: 25 },
    { x: 0, y: 50 },
    { x: -43.3, y: 25 },
    { x: -43.3, y: -25 }
  ],
  star: [
    { x: 0, y: -50 },
    { x: 14.7, y: -15.5 },
    { x: 47.6, y: -15.5 },
    { x: 23.5, y: 5 },
    { x: 29.4, y: 40.5 },
    { x: 0, y: 20 },
    { x: -29.4, y: 40.5 },
    { x: -23.5, y: 5 },
    { x: -47.6, y: -15.5 },
    { x: -14.7, y: -15.5 }
  ],
  diamond: [
    { x: 0, y: -50 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: -50, y: 0 }
  ],
  heart: [
    { x: 0, y: 15 },
    { x: -25, y: -10 },
    { x: -25, y: -25 },
    { x: -15, y: -35 },
    { x: 0, y: -25 },
    { x: 15, y: -35 },
    { x: 25, y: -25 },
    { x: 25, y: -10 }
  ],
  arrow: [
    { x: 0, y: 0 },
    { x: 60, y: 0 },
    { x: 60, y: -15 },
    { x: 80, y: 10 },
    { x: 60, y: 35 },
    { x: 60, y: 20 },
    { x: 0, y: 20 }
  ],
  cloud: [
    { x: -40, y: 10 },
    { x: -45, y: 0 },
    { x: -35, y: -15 },
    { x: -15, y: -20 },
    { x: 5, y: -15 },
    { x: 25, y: -20 },
    { x: 45, y: -10 },
    { x: 45, y: 5 },
    { x: 35, y: 15 },
    { x: 15, y: 15 },
    { x: -5, y: 20 },
    { x: -25, y: 15 }
  ],
  lightning: [
    { x: 0, y: -50 },
    { x: 15, y: -20 },
    { x: 5, y: -20 },
    { x: 20, y: 10 },
    { x: 10, y: 10 },
    { x: 25, y: 50 },
    { x: 5, y: 20 },
    { x: 15, y: 20 },
    { x: -10, y: -10 },
    { x: 0, y: -10 },
    { x: -15, y: -50 }
  ],
  speechBubble: [
    { x: -40, y: -25 },
    { x: 40, y: -25 },
    { x: 40, y: 15 },
    { x: 10, y: 15 },
    { x: 0, y: 35 },
    { x: -10, y: 15 },
    { x: -40, y: 15 }
  ],
  cross: [
    { x: -10, y: -40 },
    { x: 10, y: -40 },
    { x: 10, y: -10 },
    { x: 40, y: -10 },
    { x: 40, y: 10 },
    { x: 10, y: 10 },
    { x: 10, y: 40 },
    { x: -10, y: 40 },
    { x: -10, y: 10 },
    { x: -40, y: 10 },
    { x: -40, y: -10 },
    { x: -10, y: -10 }
  ],
  parallelogram: [
    { x: 20, y: -30 },
    { x: 60, y: -30 },
    { x: 40, y: 30 },
    { x: 0, y: 30 }
  ],
  trapezoid: [
    { x: -20, y: -30 },
    { x: 20, y: -30 },
    { x: 40, y: 30 },
    { x: -40, y: 30 }
  ],
  octagon: [
    { x: 0, y: -50 },
    { x: 35, y: -35 },
    { x: 50, y: 0 },
    { x: 35, y: 35 },
    { x: 0, y: 50 },
    { x: -35, y: 35 },
    { x: -50, y: 0 },
    { x: -35, y: -35 }
  ]
} as const;

// Default colors for shapes
export const SHAPE_COLORS: Record<string, string> = {
  triangle: '#4ecdc4',
  pentagon: '#45b7d1',
  hexagon: '#f7b801',
  star: '#fd79a8',
  diamond: '#f39c12',
  heart: '#e91e63',
  arrow: '#e74c3c',
  cloud: '#bdc3c7',
  lightning: '#f1c40f',
  speechBubble: '#95a5a6',
  cross: '#34495e',
  parallelogram: '#16a085',
  trapezoid: '#8e44ad',
  octagon: '#d35400',
  ellipse: '#9b59b6',
  roundedRectangle: '#3498db'
};
