import { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import FabricCanvas, { getFabricCanvas } from './FabricCanvas';
import { usePosterStore } from '../store/poster-store';
import { useCanvasStore } from '../store/canvas-store';
import { getPosterDimensionsPx, mmToPx } from '../constants/paper-sizes';
import { renderBorder } from '../features/borders/border-factory';
import { renderZones } from '../features/frames/zone-renderer';
import { getMinFontSizePt } from '../constants/readability-table';
import type { PictogramEntry } from '../types/pictogram';
import { PICTOGRAM_CATEGORY_COLORS } from '../types/pictogram';
import { useAlignmentGuides } from './useAlignmentGuides';

export default function CanvasWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const posterDoc = usePosterStore((s) => s.document);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const setSelectedObjects = useCanvasStore((s) => s.setSelectedObjects);

  const setZoom = useCanvasStore((s) => s.setZoom);

  // Smart alignment guides
  useAlignmentGuides(canvasReady);

  const handleCanvasReady = useCallback((canvas: fabric.Canvas) => {
    setCanvasReady(true);

    // Fit canvas to container
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
      const scaleX = (containerRect.width - 80) / dims.width;
      const scaleY = (containerRect.height - 80) / dims.height;
      const fitZoom = Math.min(scaleX, scaleY, 1);
      canvas.setZoom(fitZoom);
      setZoom(fitZoom);

      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] = (containerRect.width - dims.width * fitZoom) / 2;
        vpt[5] = (containerRect.height - dims.height * fitZoom) / 2;
      }
      canvas.requestRenderAll();
    }

    // Render border and zones
    renderBorder(canvas, posterDoc);
    renderZones(canvas, posterDoc);

    // Selection events
    canvas.on('selection:created', (e: any) => {
      const ids = (e.selected || []).map((_: any, i: number) => String(i));
      setSelectedObjects(ids);
    });
    canvas.on('selection:updated', (e: any) => {
      const ids = (e.selected || []).map((_: any, i: number) => String(i));
      setSelectedObjects(ids);
    });
    canvas.on('selection:cleared', () => {
      setSelectedObjects([]);
    });
  }, [posterDoc, setZoom, setSelectedObjects]);

  // Re-render border/zones when poster config changes
  useEffect(() => {
    if (!canvasReady) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;
    renderBorder(canvas, posterDoc);
    renderZones(canvas, posterDoc);
  }, [canvasReady, posterDoc.border, posterDoc.header, posterDoc.footer, posterDoc.theme]);

  // Text tool: click on canvas to add text
  useEffect(() => {
    if (!canvasReady) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const handleCanvasClick = (opt: any) => {
      if (activeTool !== 'text') return;

      const pointer = canvas.getScenePoint(opt.e);
      const minFont = Math.max(getMinFontSizePt(posterDoc.viewingDistance), 24);

      const text = new fabric.IText('Double-click to edit', {
        left: pointer.x,
        top: pointer.y,
        fontSize: minFont,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: posterDoc.theme.textColor,
        fontWeight: 'normal',
        editable: true,
        originX: 'left',
        originY: 'top',
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      setActiveTool('select');
    };

    canvas.on('mouse:down', handleCanvasClick);
    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvasReady, activeTool, posterDoc.viewingDistance, posterDoc.theme.textColor, setActiveTool]);

  // NOTE: All keyboard shortcuts (Delete, Undo, Redo, Escape, etc.)
  // are centralized in AppShell.tsx to avoid duplicate handlers.

  // Drop handler for pictograms — loads SVG as vector Fabric objects
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const data = e.dataTransfer.getData('application/pictogram');
    if (!data) return;

    try {
      const picto: PictogramEntry = JSON.parse(data);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Convert screen coords to canvas coords
      const vpt = canvas.viewportTransform;
      const currentZoom = canvas.getZoom();
      const canvasX = (e.clientX - rect.left - (vpt?.[4] || 0)) / currentZoom;
      const canvasY = (e.clientY - rect.top - (vpt?.[5] || 0)) / currentZoom;

      const size = mmToPx(50); // ISO minimum 50mm for pictograms

      // Fetch SVG text and parse it as Fabric vector objects
      fetch(picto.svgPath)
        .then((res) => res.text())
        .then((svgText) => {
          fabric.loadSVGFromString(svgText).then((result) => {
            const group = fabric.util.groupSVGElements(
              result.objects.filter(Boolean) as fabric.FabricObject[],
              result.options
            );

            // Scale to ISO minimum size
            const groupW = group.width || 200;
            const groupH = group.height || 200;
            const scale = size / Math.max(groupW, groupH);
            group.scaleX = scale;
            group.scaleY = scale;

            group.set({
              left: canvasX,
              top: canvasY,
              originX: 'center',
              originY: 'center',
            });

            // Store metadata
            (group as any)._pictogramId = picto.id;
            (group as any)._isoCode = picto.isoCode;
            (group as any)._pictogramCategory = picto.category;

            canvas.add(group);
            canvas.setActiveObject(group);
            canvas.requestRenderAll();
          });
        })
        .catch((err) => {
          console.error('SVG load error:', err);
          // Fallback: create a colored placeholder if SVG fails to load
          const color = PICTOGRAM_CATEGORY_COLORS[picto.category];
          const shape = new fabric.Circle({
            radius: size / 2,
            fill: color + '20',
            stroke: color,
            strokeWidth: size * 0.08,
            originX: 'center',
            originY: 'center',
          });
          const label = new fabric.FabricText(picto.id, {
            fontSize: size * 0.25,
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 'bold',
            fill: color,
            originX: 'center',
            originY: 'center',
          });
          const fallbackGroup = new fabric.Group([shape, label], {
            left: canvasX,
            top: canvasY,
            originX: 'center',
            originY: 'center',
          });
          (fallbackGroup as any)._pictogramId = picto.id;
          canvas.add(fallbackGroup);
          canvas.setActiveObject(fallbackGroup);
          canvas.requestRenderAll();
        });
    } catch (err) {
      console.error('Drop error:', err);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear when leaving the container (not child elements)
    if (e.currentTarget === e.target) setIsDragOver(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        background: '#0f1729',
        cursor: activeTool === 'text' ? 'text' : activeTool === 'pan' ? 'grab' : 'default',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <FabricCanvas onCanvasReady={handleCanvasReady} />

      {/* Drop zone visual feedback */}
      {isDragOver && (
        <div
          className="absolute inset-4 rounded-xl pointer-events-none flex items-center justify-center z-10"
          style={{
            border: '3px dashed #003DA5',
            backgroundColor: 'rgba(0, 61, 165, 0.08)',
          }}
        >
          <span className="text-sm font-medium px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            Drop pictogram here
          </span>
        </div>
      )}

      {/* Text tool instruction banner */}
      {activeTool === 'text' && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full shadow-lg"
            style={{ backgroundColor: 'rgba(0, 61, 165, 0.9)', color: '#fff' }}
          >
            Click anywhere on the poster to add text
          </span>
        </div>
      )}
    </div>
  );
}
