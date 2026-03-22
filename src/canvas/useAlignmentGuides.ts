import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { getFabricCanvas } from './FabricCanvas';
import { useCanvasStore } from '../store/canvas-store';

const SNAP_THRESHOLD = 8; // px distance to snap
const GUIDE_COLOR = '#ff00ff';
const GUIDE_WIDTH = 0.5;

interface GuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number;
}

/**
 * Smart alignment guides that appear when moving/resizing objects.
 * Shows guides when object edges/centers align with other objects or canvas center.
 */
export function useAlignmentGuides(canvasReady: boolean) {
  const guidesVisible = useCanvasStore((s) => s.guidesVisible);
  const guideObjectsRef = useRef<fabric.FabricObject[]>([]);

  useEffect(() => {
    if (!canvasReady || !guidesVisible) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const clearGuides = () => {
      guideObjectsRef.current.forEach((g) => canvas.remove(g));
      guideObjectsRef.current = [];
    };

    const drawGuide = (guide: GuideLine) => {
      const canvasW = canvas.width!;
      const canvasH = canvas.height!;

      let line: fabric.Line;
      if (guide.orientation === 'vertical') {
        line = new fabric.Line([guide.position, 0, guide.position, canvasH], {
          stroke: GUIDE_COLOR,
          strokeWidth: GUIDE_WIDTH,
          strokeDashArray: [4, 4],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
      } else {
        line = new fabric.Line([0, guide.position, canvasW, guide.position], {
          stroke: GUIDE_COLOR,
          strokeWidth: GUIDE_WIDTH,
          strokeDashArray: [4, 4],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
      }
      (line as any)._isGuide = true;
      guideObjectsRef.current.push(line);
      canvas.add(line);
    };

    const getObjectEdges = (obj: fabric.FabricObject) => {
      const bound = obj.getBoundingRect();
      return {
        left: bound.left,
        right: bound.left + bound.width,
        top: bound.top,
        bottom: bound.top + bound.height,
        centerX: bound.left + bound.width / 2,
        centerY: bound.top + bound.height / 2,
      };
    };

    const onObjectMoving = (e: any) => {
      clearGuides();
      const target = e.target as fabric.FabricObject;
      if (!target) return;

      const targetEdges = getObjectEdges(target);
      const canvasW = canvas.width!;
      const canvasH = canvas.height!;

      // Collect snap points from other objects
      const snapPointsX: number[] = [canvasW / 2]; // canvas center
      const snapPointsY: number[] = [canvasH / 2];

      const objects = canvas.getObjects().filter(
        (obj) =>
          obj !== target &&
          !(obj as any)._isGuide &&
          obj.selectable !== false // skip border/zone objects from snapping source
          || (!(obj as any)._isGuide && (obj as any)._customId) // but DO use zones as snap targets
      );

      for (const obj of objects) {
        if ((obj as any)._isGuide) continue;
        const edges = getObjectEdges(obj);
        snapPointsX.push(edges.left, edges.right, edges.centerX);
        snapPointsY.push(edges.top, edges.bottom, edges.centerY);
      }

      const guides: GuideLine[] = [];
      let snappedX = false;
      let snappedY = false;

      // Check vertical alignment (X axis)
      const targetXPoints = [targetEdges.left, targetEdges.right, targetEdges.centerX];
      for (const tx of targetXPoints) {
        if (snappedX) break;
        for (const sx of snapPointsX) {
          if (Math.abs(tx - sx) < SNAP_THRESHOLD) {
            // Snap
            const offset = sx - tx;
            target.left! += offset;
            guides.push({ orientation: 'vertical', position: sx });
            snappedX = true;
            break;
          }
        }
      }

      // Check horizontal alignment (Y axis)
      const targetYPoints = [targetEdges.top, targetEdges.bottom, targetEdges.centerY];
      for (const ty of targetYPoints) {
        if (snappedY) break;
        for (const sy of snapPointsY) {
          if (Math.abs(ty - sy) < SNAP_THRESHOLD) {
            const offset = sy - ty;
            target.top! += offset;
            guides.push({ orientation: 'horizontal', position: sy });
            snappedY = true;
            break;
          }
        }
      }

      // Draw guides
      guides.forEach(drawGuide);

      if (guides.length > 0) {
        target.setCoords();
        canvas.requestRenderAll();
      }
    };

    const onMovingEnd = () => {
      clearGuides();
      canvas.requestRenderAll();
    };

    canvas.on('object:moving', onObjectMoving);
    canvas.on('object:modified', onMovingEnd);
    canvas.on('mouse:up', onMovingEnd);

    return () => {
      clearGuides();
      canvas.off('object:moving', onObjectMoving);
      canvas.off('object:modified', onMovingEnd);
      canvas.off('mouse:up', onMovingEnd);
    };
  }, [canvasReady, guidesVisible]);
}
