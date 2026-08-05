import {
  Sparkles,
  CircleDot,
  BoxSelect,
  Square,
  Droplets,
  Eye,
  Copy,
  Zap,
  Lightbulb,
  Palette,
  Grid2x2,
  Wand2,
  Camera,
  Clapperboard,
  PaintBucket,
  Layers,
  Sun,
  Contrast,
  SunMedium,
  Blend,
  Aperture,
  Image as ImageIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// One icon per built-in effect id, matching ShapeGallery's icon-driven gallery style — no bitmap
// previews in v1. Falls back to Sparkles for any effect (built-in or third-party) not listed here.
const EFFECT_ICONS: Record<string, LucideIcon> = {
  shadow: BoxSelect,
  glow: Sun,
  "inner-shadow": Square,
  outline: CircleDot,
  blur: Droplets,
  opacity: Eye,
  echo: Copy,
  glitch: Zap,
  neon: Lightbulb,
  duotone: Palette,
  pixelate: Grid2x2,
  noise: Wand2,
  vintage: Camera,
  retro: Clapperboard,
  "gradient-fill": PaintBucket,
  "multi-layer-shadow": Layers,
  brightness: SunMedium,
  contrast: Contrast,
  saturation: Blend,
  hue: Aperture,
  vignette: ImageIcon,
  sepia: Camera,
};

export function getEffectIcon(effectId: string): LucideIcon {
  return EFFECT_ICONS[effectId] ?? Sparkles;
}
