import { useEffect, useRef } from 'react';
import { getFabricCanvas } from './FabricCanvas';
import { useCanvasStore } from '../store/canvas-store';
import { mmToPx } from '../constants/paper-sizes';

/**
 * Draws a grid overlay on the canvas using the after:render event.
 * Lines are drawn directly on the canvas context (not as Fabric objects)
 * so they don't interfere with selection or export.
 */
export function useGridOverlay(canvasReady: boolean) {
  const gridVisible = useCanvasStore((s) => s.gridVisible);
  const gridSizeMm = useCanvasStore((s) => s.gridSizeMm);
  const callbackRef = useRef<((ctx: { ctx: CanvasRenderingContext2D }) => void) | null>(null);

  useEffect(() => {
    if (!canvasReady) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    // Remove previous listener if any
    if (callbackRef.current) {
      canvas.off('after:render', callbackRef.current as any);
      callbackRef.current = null;
    }

    if (!gridVisible) {
      canvas.requestRenderAll();
      return;
    }

    const gridPx = mmToPx(gridSizeMm);

    const drawGrid = () => {
      const ctx = canvas.getContext();
      const vpt = canvas.viewportTransform;
      if (!ctx || !vpt) return;

      const canvasW = canvas.width!;
      const canvasH = canvas.height!;

      ctx.save();
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.25)';
      ctx.lineWidth = 0.5;

      // Draw vertical lines
      for (let x = gridPx; x < canvasW; x += gridPx) {
        const screenX = x * vpt[0] + vpt[4];
        const screenY1 = 0 * vpt[3] + vpt[5];
        const screenY2 = canvasH * vpt[3] + vpt[5];
        ctx.beginPath();
        ctx.moveTo(screenX, screenY1);
        ctx.lineTo(screenX, screenY2);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = gridPx; y < canvasH; y += gridPx) {
        const screenY = y * vpt[3] + vpt[5];
        const screenX1 = 0 * vpt[0] + vpt[4];
        const screenX2 = canvasW * vpt[0] + vpt[4];
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY);
        ctx.lineTo(screenX2, screenY);
        ctx.stroke();
      }

      ctx.restore();
    };

    callbackRef.current = drawGrid;
    canvas.on('after:render', drawGrid as any);
    canvas.requestRenderAll();

    return () => {
      if (callbackRef.current) {
        canvas.off('after:render', callbackRef.current as any);
        callbackRef.current = null;
        canvas.requestRenderAll();
      }
    };
  }, [canvasReady, gridVisible, gridSizeMm]);
}
