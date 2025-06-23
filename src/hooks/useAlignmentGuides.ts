import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { SmoothAlignmentGuides } from '../utils/smoothAlignmentGuides';

export interface AlignmentGuidesOptions {
  lineColor?: string;
  lineWidth?: number;
  lineMargin?: number;
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<AlignmentGuidesOptions> = {
  lineColor: '#32D10A',
  lineWidth: 1,
  lineMargin: 4,
  enabled: true,
};

export const useAlignmentGuides = (
  canvas: Canvas | null,
  options: AlignmentGuidesOptions = {}
) => {
  const guidelineRef = useRef<SmoothAlignmentGuides | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Initialize guidelines when canvas is available
  useEffect(() => {
    if (!canvas || !finalOptions.enabled) {
      cleanup();
      return;
    }

    // Avoid multiple initializations
    if (isInitializedRef.current && guidelineRef.current) {
      return;
    }

    try {
      const guideline = new SmoothAlignmentGuides(canvas, {
        lineColor: finalOptions.lineColor,
        lineWidth: finalOptions.lineWidth,
        lineMargin: finalOptions.lineMargin,
        enabled: finalOptions.enabled,
      });

      guidelineRef.current = guideline;
      isInitializedRef.current = true;
    } catch {
      // Failed to initialize alignment guides
    }

    return cleanup;
  }, [canvas, finalOptions.enabled, finalOptions.lineColor, finalOptions.lineWidth, finalOptions.lineMargin]);

  // Update options when they change
  useEffect(() => {
    if (!guidelineRef.current || !canvas) return;

    // Update options
    guidelineRef.current.updateOptions({
      lineColor: finalOptions.lineColor,
      lineWidth: finalOptions.lineWidth,
      lineMargin: finalOptions.lineMargin,
      enabled: finalOptions.enabled,
    });

    if (finalOptions.enabled) {
      guidelineRef.current.enable();
    } else {
      guidelineRef.current.disable();
    }
  }, [
    canvas,
    finalOptions.lineColor,
    finalOptions.lineWidth,
    finalOptions.lineMargin,
    finalOptions.enabled,
  ]);

  const cleanup = () => {
    if (guidelineRef.current) {
      try {
        guidelineRef.current.destroy();
        guidelineRef.current = null;
        isInitializedRef.current = false;
      } catch {
        // Error during cleanup
      }
    }
  };

  // Manual control functions
  const enableGuides = () => {
    if (!canvas) return;
    
    if (!guidelineRef.current) {
      try {
        const guideline = new SmoothAlignmentGuides(canvas, finalOptions);
        guidelineRef.current = guideline;
        isInitializedRef.current = true;
      } catch {
        // Failed to enable alignment guides
      }
    } else {
      guidelineRef.current.enable();
    }
  };

  const disableGuides = () => {
    if (guidelineRef.current) {
      guidelineRef.current.disable();
    }
  };

  const isEnabled = () => {
    return !!guidelineRef.current && guidelineRef.current.isActive();
  };

  const clearGuidelines = () => {
    if (guidelineRef.current && canvas) {
      guidelineRef.current.disable();
      guidelineRef.current.enable();
      canvas.requestRenderAll();
    }
  };

  return {
    enableGuides,
    disableGuides,
    isEnabled,
    clearGuidelines,
    guideline: guidelineRef.current,
  };
};
