import { useEffect, useRef } from 'react';
import { getFabricCanvas } from './FabricCanvas';
import { useUIStore } from '../store/ui-store';
import { usePosterStore } from '../store/poster-store';
import { checkContrast } from '../utils/color-utils';
import { clearOverlays, createHighlight, findBackgroundColor, getTextObjects } from './overlay-utils';

const TAG = 'contrast';

const COLORS = {
  excellent: 'rgba(34, 197, 94, 0.2)',    // green — 7:1+
  good: 'rgba(59, 130, 246, 0.25)',        // blue  — 4.5:1+
  poor: 'rgba(245, 158, 11, 0.3)',         // amber — 3:1+
  fail: 'rgba(239, 68, 68, 0.35)',         // red   — <3:1
};

/**
 * Contrast check overlay — highlights text objects with color-coded
 * indicators showing the WCAG contrast ratio between text color and
 * the background behind each text element.
 */
export function useContrastOverlay(canvasReady: boolean) {
  const visible = useUIStore((s) => s.contrastOverlayVisible);
  const posterBg = usePosterStore((s) => s.document.theme.background);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!canvasReady) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    if (!visible) {
      clearOverlays(canvas, TAG);
      canvas.requestRenderAll();
      return;
    }

    const refresh = () => {
      clearOverlays(canvas, TAG);

      const textObjects = getTextObjects(canvas);

      for (const obj of textObjects) {
        const fg = String((obj as any).fill || '#000000');
        const bg = findBackgroundColor(canvas, obj, posterBg);
        const { ratio, level } = checkContrast(fg, bg);

        const label = `${ratio.toFixed(1)}:1 ${level.toUpperCase()}`;
        const highlights = createHighlight(obj, COLORS[level], label, TAG);
        highlights.forEach((h) => canvas.add(h));
      }

      canvas.requestRenderAll();
    };

    // Debounced refresh
    const debouncedRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refresh, 150);
    };

    // Initial draw
    refresh();

    // Re-draw when objects change
    canvas.on('object:added', debouncedRefresh);
    canvas.on('object:removed', debouncedRefresh);
    canvas.on('object:modified', debouncedRefresh);
    canvas.on('text:changed', debouncedRefresh);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearOverlays(canvas, TAG);
      canvas.off('object:added', debouncedRefresh);
      canvas.off('object:removed', debouncedRefresh);
      canvas.off('object:modified', debouncedRefresh);
      canvas.off('text:changed', debouncedRefresh);
      canvas.requestRenderAll();
    };
  }, [canvasReady, visible, posterBg]);
}
