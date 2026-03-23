import * as fabric from 'fabric';

/**
 * Shared utility for drawing highlight overlays on canvas objects.
 * Used by readability and contrast check overlays.
 */

/** Find the background color behind a given object by walking z-order */
export function findBackgroundColor(
  canvas: fabric.Canvas,
  target: fabric.FabricObject,
  posterBg: string
): string {
  const objects = canvas.getObjects();
  const targetIndex = objects.indexOf(target);
  const targetBounds = target.getBoundingRect();

  for (let i = targetIndex - 1; i >= 0; i--) {
    const obj = objects[i];
    if (obj instanceof fabric.IText || obj instanceof fabric.FabricText) continue;
    if ((obj as any)._isOverlay) continue;

    const bounds = obj.getBoundingRect();
    if (
      bounds.left <= targetBounds.left &&
      bounds.top <= targetBounds.top &&
      bounds.left + bounds.width >= targetBounds.left + targetBounds.width &&
      bounds.top + bounds.height >= targetBounds.top + targetBounds.height
    ) {
      const fill = obj.fill;
      if (typeof fill === 'string' && fill !== 'transparent') {
        return fill;
      }
    }
  }

  return posterBg;
}

/** Create a highlight rectangle + label over a target object */
export function createHighlight(
  target: fabric.FabricObject,
  color: string,
  label: string,
  tag: string
): fabric.FabricObject[] {
  const bounds = target.getBoundingRect();
  const result: fabric.FabricObject[] = [];

  // Semi-transparent highlight rectangle
  const rect = new fabric.Rect({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    fill: color,
    stroke: color.replace(/[\d.]+\)$/, '0.6)'),
    strokeWidth: 1.5,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });
  (rect as any)._isOverlay = true;
  (rect as any)._overlayTag = tag;
  result.push(rect);

  // Label badge
  const badge = new fabric.FabricText(label, {
    left: bounds.left + 2,
    top: bounds.top - 18,
    fontSize: 11,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fill: '#ffffff',
    backgroundColor: color.replace(/[\d.]+\)$/, '0.85)'),
    padding: 3,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });
  // Ensure badge stays within canvas
  if (badge.top! < 0) badge.top = bounds.top + 2;
  (badge as any)._isOverlay = true;
  (badge as any)._overlayTag = tag;
  result.push(badge);

  return result;
}

/** Remove all overlay objects with a given tag from the canvas */
export function clearOverlays(canvas: fabric.Canvas, tag: string) {
  const toRemove = canvas.getObjects().filter(
    (obj) => (obj as any)._isOverlay && (obj as any)._overlayTag === tag
  );
  toRemove.forEach((obj) => canvas.remove(obj));
}

/** Get all text objects from the canvas (excluding overlays and system objects) */
export function getTextObjects(canvas: fabric.Canvas): fabric.FabricObject[] {
  return canvas.getObjects().filter(
    (obj) =>
      (obj instanceof fabric.IText || obj instanceof fabric.FabricText) &&
      !(obj as any)._isOverlay &&
      !(obj as any)._isGuide
  );
}
