import { useEffect, useRef } from 'react';
import { getFabricCanvas } from './FabricCanvas';
import { useUIStore } from '../store/ui-store';
import { usePosterStore } from '../store/poster-store';
import { checkReadability } from '../constants/readability-table';
import { clearOverlays, createHighlight, getTextObjects } from './overlay-utils';

const TAG = 'readability';

const COLORS = {
  pass: 'rgba(34, 197, 94, 0.2)',   // green
  warn: 'rgba(245, 158, 11, 0.3)',  // amber
  fail: 'rgba(239, 68, 68, 0.35)',  // red
};

/**
 * Readability check overlay — highlights text objects with color-coded
 * indicators showing whether they meet minimum size requirements for
 * the poster's configured viewing distance.
 */
export function useReadabilityOverlay(canvasReady: boolean) {
  const visible = useUIStore((s) => s.readabilityOverlayVisible);
  const viewingDistance = usePosterStore((s) => s.document.viewingDistance);
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
        const fontSize = (obj as any).fontSize || 12;
        const { level, actualCapMm, requiredCapMm } = checkReadability(fontSize, viewingDistance);

        const label = `${Math.round(fontSize)}pt — ${level.toUpperCase()} (${actualCapMm.toFixed(1)}/${requiredCapMm.toFixed(1)}mm)`;
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
  }, [canvasReady, visible, viewingDistance]);
}
