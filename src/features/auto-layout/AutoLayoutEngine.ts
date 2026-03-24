import * as fabric from 'fabric';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { usePosterStore } from '../../store/poster-store';
import { getPosterDimensionsPx, mmToPx } from '../../constants/paper-sizes';
import { getBorderInset } from '../borders/border-factory';

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

/** Get the content zone rect (area between header and footer, inside border) */
function getContentZone() {
  const posterDoc = usePosterStore.getState().document;
  const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
  const borderInset = getBorderInset(posterDoc.border.type, posterDoc.border.thickness);
  const padding = mmToPx(3);
  const innerLeft = borderInset + padding;
  const innerTop = borderInset + padding;
  const innerWidth = dims.width - 2 * (borderInset + padding);
  const innerHeight = dims.height - 2 * (borderInset + padding);

  const headerH = posterDoc.header.visible ? innerHeight * (posterDoc.header.heightPercent / 100) : 0;
  const footerH = posterDoc.footer.visible ? innerHeight * (posterDoc.footer.heightPercent / 100) : 0;
  const gap = mmToPx(2);

  return {
    x: innerLeft,
    y: innerTop + headerH + gap,
    w: innerWidth,
    h: innerHeight - headerH - footerH - gap * 2,
  };
}

/**
 * Position an object so its center lands at (cx, cy)
 * without changing originX/originY (keeps default 'left'/'top').
 */
function centerAt(obj: fabric.FabricObject, cx: number, cy: number) {
  const bound = obj.getBoundingRect();
  obj.set({
    left: cx - bound.width / 2,
    top: cy - bound.height / 2,
  });
  obj.setCoords();
}

/** Apply a layout preset to all user objects on the canvas */
export function applyLayout(preset: LayoutPreset): void {
  const canvas = getFabricCanvas();
  if (!canvas) return;

  const objects = getUserObjects(canvas);
  if (objects.length === 0) return;

  const zone = getContentZone();

  switch (preset) {
    case 'center-stack':
      applyCenterStack(objects, zone);
      break;
    case 'two-column':
      applyTwoColumn(objects, zone);
      break;
    case 'grid-2x2':
      applyGrid2x2(objects, zone);
      break;
    case 'thirds':
      applyThirds(objects, zone);
      break;
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

interface Zone { x: number; y: number; w: number; h: number }

function applyCenterStack(objects: fabric.FabricObject[], zone: Zone) {
  const n = objects.length;
  const spacing = zone.h / (n + 1);
  const centerX = zone.x + zone.w / 2;

  objects.forEach((obj, i) => {
    centerAt(obj, centerX, zone.y + spacing * (i + 1));
  });
}

function applyTwoColumn(objects: fabric.FabricObject[], zone: Zone) {
  const leftCol = zone.x + zone.w * 0.25;
  const rightCol = zone.x + zone.w * 0.75;

  const leftObjects = objects.filter((_, i) => i % 2 === 0);
  const rightObjects = objects.filter((_, i) => i % 2 === 1);

  const distribute = (objs: fabric.FabricObject[], cx: number) => {
    const spacing = zone.h / (objs.length + 1);
    objs.forEach((obj, i) => {
      centerAt(obj, cx, zone.y + spacing * (i + 1));
    });
  };

  distribute(leftObjects, leftCol);
  distribute(rightObjects, rightCol);
}

function applyGrid2x2(objects: fabric.FabricObject[], zone: Zone) {
  const positions = [
    { x: zone.x + zone.w * 0.25, y: zone.y + zone.h * 0.25 },
    { x: zone.x + zone.w * 0.75, y: zone.y + zone.h * 0.25 },
    { x: zone.x + zone.w * 0.25, y: zone.y + zone.h * 0.75 },
    { x: zone.x + zone.w * 0.75, y: zone.y + zone.h * 0.75 },
  ];

  objects.forEach((obj, i) => {
    const pos = positions[i % positions.length];
    centerAt(obj, pos.x, pos.y);
  });
}

function applyThirds(objects: fabric.FabricObject[], zone: Zone) {
  const positions = [
    { x: zone.x + zone.w / 3, y: zone.y + zone.h / 3 },
    { x: zone.x + (zone.w * 2) / 3, y: zone.y + zone.h / 3 },
    { x: zone.x + zone.w / 3, y: zone.y + (zone.h * 2) / 3 },
    { x: zone.x + (zone.w * 2) / 3, y: zone.y + (zone.h * 2) / 3 },
  ];

  objects.forEach((obj, i) => {
    const pos = positions[i % positions.length];
    centerAt(obj, pos.x, pos.y);
  });
}
