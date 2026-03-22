import * as fabric from 'fabric';
import { getFabricCanvas } from '../../canvas/FabricCanvas';

export type LayoutPreset = 'center-stack' | 'two-column' | 'grid-2x2' | 'thirds';

export interface LayoutOption {
  id: LayoutPreset;
  label: string;
  description: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: 'center-stack', label: 'Center Stack', description: 'All objects stacked vertically, centered' },
  { id: 'two-column', label: 'Two Column', description: 'Objects split into two columns' },
  { id: 'grid-2x2', label: '2x2 Grid', description: 'Objects arranged in a 2x2 grid' },
  { id: 'thirds', label: 'Rule of Thirds', description: 'Objects placed on thirds intersections' },
];

/** Get user-created objects (not borders, zones, or guides) */
function getUserObjects(canvas: fabric.Canvas): fabric.FabricObject[] {
  return canvas.getObjects().filter(
    (obj: any) => !obj._customId && !obj._isGuide
  );
}

/** Apply a layout preset to all user objects on the canvas */
export function applyLayout(preset: LayoutPreset): void {
  const canvas = getFabricCanvas();
  if (!canvas) return;

  const objects = getUserObjects(canvas);
  if (objects.length === 0) return;

  const canvasW = canvas.width!;
  const canvasH = canvas.height!;
  const margin = canvasW * 0.08;
  const usableW = canvasW - 2 * margin;
  const usableH = canvasH - 2 * margin;

  switch (preset) {
    case 'center-stack':
      applyCenterStack(objects, canvasW, margin, usableH);
      break;
    case 'two-column':
      applyTwoColumn(objects, margin, usableW, usableH);
      break;
    case 'grid-2x2':
      applyGrid2x2(objects, margin, usableW, usableH);
      break;
    case 'thirds':
      applyThirds(objects, canvasW, canvasH);
      break;
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

function applyCenterStack(
  objects: fabric.FabricObject[],
  canvasW: number,
  marginTop: number,
  usableH: number,
) {
  const totalObjects = objects.length;
  const spacing = usableH / (totalObjects + 1);

  objects.forEach((obj, i) => {
    obj.set({
      left: canvasW / 2,
      top: marginTop + spacing * (i + 1),
      originX: 'center',
      originY: 'center',
    });
    obj.setCoords();
  });
}

function applyTwoColumn(
  objects: fabric.FabricObject[],
  margin: number,
  usableW: number,
  usableH: number,
) {
  const colW = usableW / 2;
  const leftCol = margin + colW * 0.5;
  const rightCol = margin + colW * 1.5;

  const leftObjects = objects.filter((_, i) => i % 2 === 0);
  const rightObjects = objects.filter((_, i) => i % 2 === 1);

  const distributeInColumn = (objs: fabric.FabricObject[], centerX: number) => {
    const spacing = usableH / (objs.length + 1);
    objs.forEach((obj, i) => {
      obj.set({
        left: centerX,
        top: margin + spacing * (i + 1),
        originX: 'center',
        originY: 'center',
      });
      obj.setCoords();
    });
  };

  distributeInColumn(leftObjects, leftCol);
  distributeInColumn(rightObjects, rightCol);
}

function applyGrid2x2(
  objects: fabric.FabricObject[],
  margin: number,
  usableW: number,
  usableH: number,
) {
  const positions = [
    { x: margin + usableW * 0.25, y: margin + usableH * 0.25 },
    { x: margin + usableW * 0.75, y: margin + usableH * 0.25 },
    { x: margin + usableW * 0.25, y: margin + usableH * 0.75 },
    { x: margin + usableW * 0.75, y: margin + usableH * 0.75 },
  ];

  objects.forEach((obj, i) => {
    const pos = positions[i % positions.length];
    obj.set({
      left: pos.x,
      top: pos.y,
      originX: 'center',
      originY: 'center',
    });
    obj.setCoords();
  });
}

function applyThirds(
  objects: fabric.FabricObject[],
  canvasW: number,
  canvasH: number,
) {
  // Rule of thirds: place objects at the 4 intersections
  const positions = [
    { x: canvasW / 3, y: canvasH / 3 },
    { x: (canvasW * 2) / 3, y: canvasH / 3 },
    { x: canvasW / 3, y: (canvasH * 2) / 3 },
    { x: (canvasW * 2) / 3, y: (canvasH * 2) / 3 },
  ];

  objects.forEach((obj, i) => {
    const pos = positions[i % positions.length];
    obj.set({
      left: pos.x,
      top: pos.y,
      originX: 'center',
      originY: 'center',
    });
    obj.setCoords();
  });
}
