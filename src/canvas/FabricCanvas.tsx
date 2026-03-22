import { useEffect, useRef, useCallback, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../store/canvas-store';
import { usePosterStore } from '../store/poster-store';
import { useHistoryStore } from '../store/history-store';
import { getPosterDimensionsPx } from '../constants/paper-sizes';

/** Singleton canvas reference accessible outside React */
let fabricCanvasInstance: fabric.Canvas | null = null;
export function getFabricCanvas(): fabric.Canvas | null {
  return fabricCanvasInstance;
}
// Expose to window for dev tools & color editor integration
if (typeof window !== 'undefined') {
  (window as any).__getFabricCanvas = getFabricCanvas;
}

interface FabricCanvasProps {
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

export default function FabricCanvas({ onCanvasReady }: FabricCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [error, setError] = useState<string | null>(null);

  const posterDoc = usePosterStore((s) => s.document);
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setPan = useCanvasStore((s) => s.setPan);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const pushState = useHistoryStore((s) => s.pushState);

  // Initialize canvas
  useEffect(() => {
    if (!canvasElRef.current || canvasRef.current) return;

    try {
      const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);

      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: dims.width,
        height: dims.height,
        backgroundColor: posterDoc.theme.background,
        selection: true,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;
      fabricCanvasInstance = canvas;

      // Push initial state
      pushState(JSON.stringify(canvas.toJSON()));

      // Object modification events -> push history
      const handleModified = () => {
        pushState(JSON.stringify(canvas.toJSON()));
      };
      canvas.on('object:modified', handleModified);

      if (onCanvasReady) {
        // Defer to allow canvas to fully initialize
        setTimeout(() => {
          try {
            onCanvasReady(canvas);
          } catch (err) {
            console.error('onCanvasReady error:', err);
            setError(String(err));
          }
        }, 50);
      }

      return () => {
        canvas.off('object:modified', handleModified);
        canvas.dispose();
        canvasRef.current = null;
        fabricCanvasInstance = null;
      };
    } catch (err) {
      console.error('Canvas init error:', err);
      setError(String(err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const delta = e.deltaY;
    let newZoom = zoom * (1 - delta / 500);
    newZoom = Math.max(0.1, Math.min(5, newZoom));

    const point = new fabric.Point(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    canvas.zoomToPoint(point, newZoom);
    setZoom(newZoom);

    const vpt = canvas.viewportTransform;
    if (vpt) {
      setPan(vpt[4], vpt[5]);
    }
  }, [zoom, setZoom, setPan]);

  // Pan with middle mouse button or when pan tool is active
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const onMouseDown = (opt: any) => {
      const evt = opt.e as MouseEvent;
      if (evt.button === 1 || activeTool === 'pan') {
        isPanning = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.selection = false;
      }
    };

    const onMouseMove = (opt: any) => {
      if (!isPanning) return;
      const evt = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform;
      if (!vpt) return;
      vpt[4] += evt.clientX - lastPosX;
      vpt[5] += evt.clientY - lastPosY;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      canvas.requestRenderAll();
      setPan(vpt[4], vpt[5]);
    };

    const onMouseUp = () => {
      isPanning = false;
      if (activeTool !== 'pan') {
        canvas.selection = true;
      }
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [activeTool, setPan]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-red-400 mb-2">Canvas initialization error:</p>
          <pre className="text-xs text-red-300 bg-red-950 p-3 rounded max-w-lg overflow-auto">{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden flex-1"
      onWheel={handleWheel}
    >
      <canvas ref={canvasElRef} />
    </div>
  );
}
