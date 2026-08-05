import {
  Square,
  SquareRoundCorner,
  Circle,
  Minus,
  Type,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  Star,
  Heart,
  Cloud,
  Zap,
  ArrowRight,
  MessageSquare,
  Plus,
  Shapes,
} from "lucide-react";

export type ShapeCategory = "basic" | "polygons" | "symbols" | "special";

export interface ShapeCatalogEntry {
  typeId: string;
  label: string;
  category: ShapeCategory;
  Icon: typeof Square;
  iconClassName?: string;
}

export const SHAPE_CATEGORIES: Array<{ id: ShapeCategory; label: string }> = [
  { id: "basic", label: "Basic Shapes" },
  { id: "polygons", label: "Polygons" },
  { id: "symbols", label: "Symbols" },
  { id: "special", label: "Special Shapes" },
];

export const SHAPE_CATALOG: ShapeCatalogEntry[] = [
  { typeId: "rect", label: "Rectangle", category: "basic", Icon: Square },
  { typeId: "rounded-rectangle", label: "Rounded Rectangle", category: "basic", Icon: SquareRoundCorner },
  { typeId: "circle", label: "Circle", category: "basic", Icon: Circle },
  { typeId: "ellipse", label: "Ellipse", category: "basic", Icon: Circle, iconClassName: "scale-x-125" },
  { typeId: "line", label: "Line", category: "basic", Icon: Minus },
  { typeId: "text", label: "Text", category: "basic", Icon: Type },

  { typeId: "triangle", label: "Triangle", category: "polygons", Icon: Triangle },
  { typeId: "pentagon", label: "Pentagon", category: "polygons", Icon: Pentagon },
  { typeId: "hexagon", label: "Hexagon", category: "polygons", Icon: Hexagon },
  { typeId: "octagon", label: "Octagon", category: "polygons", Icon: Octagon },
  { typeId: "diamond", label: "Diamond", category: "polygons", Icon: Diamond },
  { typeId: "parallelogram", label: "Parallelogram", category: "polygons", Icon: Square, iconClassName: "-skew-x-12" },
  { typeId: "trapezoid", label: "Trapezoid", category: "polygons", Icon: Shapes },

  { typeId: "star", label: "Star", category: "symbols", Icon: Star },
  { typeId: "heart", label: "Heart", category: "symbols", Icon: Heart },
  { typeId: "cloud", label: "Cloud", category: "symbols", Icon: Cloud },
  { typeId: "lightning", label: "Lightning", category: "symbols", Icon: Zap },

  { typeId: "arrow", label: "Arrow", category: "special", Icon: ArrowRight },
  { typeId: "speechBubble", label: "Speech Bubble", category: "special", Icon: MessageSquare },
  { typeId: "cross", label: "Cross", category: "special", Icon: Plus },
];
