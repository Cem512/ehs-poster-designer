import * as fabric from 'fabric';
import type { PosterDocument } from '../../types/poster';
import { getPosterDimensionsPx, mmToPx } from '../../constants/paper-sizes';

const BORDER_GROUP_ID = '__poster_border__';

/** Remove existing border objects from canvas */
function clearBorder(canvas: fabric.Canvas) {
  const objects = canvas.getObjects().filter(
    (obj: any) => obj._customId === BORDER_GROUP_ID
  );
  objects.forEach((obj) => canvas.remove(obj));
}

/** Mark an object as a border element (locked, non-selectable) */
function markAsBorder(obj: fabric.FabricObject) {
  (obj as any)._customId = BORDER_GROUP_ID;
  obj.selectable = false;
  obj.evented = false;
  obj.excludeFromExport = false;
}

/** Render hazard stripe border (diagonal alternating stripes) */
function renderHazardStripe(
  canvas: fabric.Canvas,
  w: number,
  h: number,
  primaryColor: string,
  secondaryColor: string,
  thickness: number
) {
  const thickPx = mmToPx(thickness);
  const stripeWidth = mmToPx(thickness * 1.5);

  // Outer background rect
  const outerRect = new fabric.Rect({
    left: 0, top: 0, width: w, height: h,
    fill: secondaryColor,
    strokeWidth: 0,
  });
  markAsBorder(outerRect);
  canvas.add(outerRect);

  // Create diagonal stripe pattern using a group of lines
  // We'll draw diagonal lines across the border area
  const lines: fabric.FabricObject[] = [];
  const totalDiag = w + h;
  for (let i = -h; i < totalDiag; i += stripeWidth * 2) {
    const line = new fabric.Line([i, 0, i + h, h], {
      stroke: primaryColor,
      strokeWidth: stripeWidth,
      selectable: false,
      evented: false,
    });
    lines.push(line);
  }

  // Use clipPath to make stripes only appear in border area
  // Create the border frame as 4 rectangles
  const borderRects = [
    // Top
    new fabric.Rect({ left: 0, top: 0, width: w, height: thickPx, fill: 'transparent' }),
    // Bottom
    new fabric.Rect({ left: 0, top: h - thickPx, width: w, height: thickPx, fill: 'transparent' }),
    // Left
    new fabric.Rect({ left: 0, top: 0, width: thickPx, height: h, fill: 'transparent' }),
    // Right
    new fabric.Rect({ left: w - thickPx, top: 0, width: thickPx, height: h, fill: 'transparent' }),
  ];

  // Simpler approach: draw 4 stripe-filled border rectangles
  for (const stripeRect of borderRects) {
    markAsBorder(stripeRect);
  }

  // Actually, let's use a simpler visual: solid colored border rectangles with diagonal line overlay
  // Top border with stripes
  const regions = [
    { x: 0, y: 0, rw: w, rh: thickPx },           // top
    { x: 0, y: h - thickPx, rw: w, rh: thickPx },  // bottom
    { x: 0, y: thickPx, rw: thickPx, rh: h - 2 * thickPx }, // left
    { x: w - thickPx, y: thickPx, rw: thickPx, rh: h - 2 * thickPx }, // right
  ];

  // Remove the outer rect we added, use region rects instead
  canvas.remove(outerRect);

  for (const region of regions) {
    // Background
    const bg = new fabric.Rect({
      left: region.x, top: region.y,
      width: region.rw, height: region.rh,
      fill: primaryColor,
      strokeWidth: 0,
    });
    markAsBorder(bg);
    canvas.add(bg);

    // Diagonal stripes overlay
    const step = stripeWidth * 2;
    for (let pos = -region.rh; pos < region.rw + region.rh; pos += step) {
      const stripeLine = new fabric.Line(
        [region.x + pos, region.y, region.x + pos + region.rh, region.y + region.rh],
        {
          stroke: secondaryColor,
          strokeWidth: stripeWidth * 0.5,
        }
      );
      markAsBorder(stripeLine);
      canvas.add(stripeLine);
    }
  }

  // Inner white area
  const innerRect = new fabric.Rect({
    left: thickPx, top: thickPx,
    width: w - 2 * thickPx, height: h - 2 * thickPx,
    fill: canvas.backgroundColor as string || '#FFFFFF',
    strokeWidth: 0,
  });
  markAsBorder(innerRect);
  canvas.add(innerRect);
}

/** Render solid industrial border using filled rects (no stroke ambiguity) */
function renderSolidIndustrial(
  canvas: fabric.Canvas,
  w: number,
  h: number,
  primaryColor: string,
  _secondaryColor: string,
  thickness: number
) {
  const thickPx = mmToPx(thickness);
  const innerRulePx = mmToPx(1);
  const gapPx = mmToPx(3);

  // Outer thick border — 4 filled rects forming a frame
  const outerRects = [
    // Top
    new fabric.Rect({ left: 0, top: 0, width: w, height: thickPx, fill: primaryColor, strokeWidth: 0 }),
    // Bottom
    new fabric.Rect({ left: 0, top: h - thickPx, width: w, height: thickPx, fill: primaryColor, strokeWidth: 0 }),
    // Left
    new fabric.Rect({ left: 0, top: thickPx, width: thickPx, height: h - 2 * thickPx, fill: primaryColor, strokeWidth: 0 }),
    // Right
    new fabric.Rect({ left: w - thickPx, top: thickPx, width: thickPx, height: h - 2 * thickPx, fill: primaryColor, strokeWidth: 0 }),
  ];
  outerRects.forEach((r) => { markAsBorder(r); canvas.add(r); });

  // Inner thin rule — 4 filled rects forming a thinner inner frame
  const inset = thickPx + gapPx;
  const innerRects = [
    // Top
    new fabric.Rect({ left: inset, top: inset, width: w - 2 * inset, height: innerRulePx, fill: primaryColor, strokeWidth: 0 }),
    // Bottom
    new fabric.Rect({ left: inset, top: h - inset - innerRulePx, width: w - 2 * inset, height: innerRulePx, fill: primaryColor, strokeWidth: 0 }),
    // Left
    new fabric.Rect({ left: inset, top: inset + innerRulePx, width: innerRulePx, height: h - 2 * (inset + innerRulePx), fill: primaryColor, strokeWidth: 0 }),
    // Right
    new fabric.Rect({ left: w - inset - innerRulePx, top: inset + innerRulePx, width: innerRulePx, height: h - 2 * (inset + innerRulePx), fill: primaryColor, strokeWidth: 0 }),
  ];
  innerRects.forEach((r) => { markAsBorder(r); canvas.add(r); });
}

/** Render double line border using filled rects (no stroke ambiguity) */
function renderDoubleLine(
  canvas: fabric.Canvas,
  w: number,
  h: number,
  primaryColor: string,
  secondaryColor: string,
  thickness: number
) {
  const thickPx = mmToPx(thickness);
  const gapPx = mmToPx(3);
  const outerStroke = thickPx * 0.6;
  const innerStroke = thickPx * 0.4;

  // Outer line — 4 filled rects
  const outerRects = [
    new fabric.Rect({ left: 0, top: 0, width: w, height: outerStroke, fill: primaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: 0, top: h - outerStroke, width: w, height: outerStroke, fill: primaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: 0, top: outerStroke, width: outerStroke, height: h - 2 * outerStroke, fill: primaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: w - outerStroke, top: outerStroke, width: outerStroke, height: h - 2 * outerStroke, fill: primaryColor, strokeWidth: 0 }),
  ];
  outerRects.forEach((r) => { markAsBorder(r); canvas.add(r); });

  // Inner line — 4 filled rects
  const inset = outerStroke + gapPx;
  const innerRects = [
    new fabric.Rect({ left: inset, top: inset, width: w - 2 * inset, height: innerStroke, fill: secondaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: inset, top: h - inset - innerStroke, width: w - 2 * inset, height: innerStroke, fill: secondaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: inset, top: inset + innerStroke, width: innerStroke, height: h - 2 * (inset + innerStroke), fill: secondaryColor, strokeWidth: 0 }),
    new fabric.Rect({ left: w - inset - innerStroke, top: inset + innerStroke, width: innerStroke, height: h - 2 * (inset + innerStroke), fill: secondaryColor, strokeWidth: 0 }),
  ];
  innerRects.forEach((r) => { markAsBorder(r); canvas.add(r); });
}

/** Render rounded safety border */
function renderRoundedSafety(
  canvas: fabric.Canvas,
  w: number,
  h: number,
  primaryColor: string,
  _secondaryColor: string,
  thickness: number
) {
  const thickPx = mmToPx(thickness);
  const radius = mmToPx(Math.min(thickness * 2, 20));

  const rect = new fabric.Rect({
    left: thickPx / 2, top: thickPx / 2,
    width: w - thickPx, height: h - thickPx,
    fill: 'transparent',
    stroke: primaryColor,
    strokeWidth: thickPx,
    rx: radius,
    ry: radius,
  });
  markAsBorder(rect);
  canvas.add(rect);
}

/** Render color-banded border (OSHA/ANSI style) */
function renderColorBanded(
  canvas: fabric.Canvas,
  w: number,
  h: number,
  primaryColor: string,
  secondaryColor: string,
  thickness: number
) {
  const thickPx = mmToPx(thickness);

  // Full border in secondary color
  const outer = new fabric.Rect({
    left: 0, top: 0, width: w, height: h,
    fill: 'transparent',
    stroke: secondaryColor,
    strokeWidth: thickPx,
  });
  markAsBorder(outer);
  canvas.add(outer);

  // Top color band (signal color)
  const bandHeight = mmToPx(thickness * 3);
  const band = new fabric.Rect({
    left: 0, top: 0, width: w, height: bandHeight,
    fill: primaryColor,
    strokeWidth: 0,
  });
  markAsBorder(band);
  canvas.add(band);
}

/**
 * Returns the inset (in px) from each edge that the border consumes.
 * The content area starts at this inset from the poster edge.
 */
export function getBorderInset(borderType: string, thicknessMm: number): number {
  const thickPx = mmToPx(thicknessMm);

  switch (borderType) {
    case 'hazard-stripe':
      // Solid stripe border region = thickPx
      return thickPx;

    case 'solid-industrial': {
      // Outer stroke + gap + inner rule
      const gapPx = mmToPx(3);
      const innerRulePx = mmToPx(1);
      return thickPx + gapPx + innerRulePx;
    }

    case 'double-line': {
      // Outer stroke + gap + inner stroke
      const outerStroke = thickPx * 0.6;
      const gapPx = mmToPx(3);
      const innerStroke = thickPx * 0.4;
      return outerStroke + gapPx + innerStroke;
    }

    case 'rounded-safety':
      return thickPx;

    case 'color-banded': {
      // The top band is thicker, but side/bottom is just the outer stroke
      return thickPx;
    }

    default:
      return thickPx;
  }
}

/** Main entry: render the appropriate border type onto the canvas */
export function renderBorder(canvas: fabric.Canvas, posterDoc: PosterDocument) {
  clearBorder(canvas);

  const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
  const { type, primaryColor, secondaryColor, thickness } = posterDoc.border;

  switch (type) {
    case 'hazard-stripe':
      renderHazardStripe(canvas, dims.width, dims.height, primaryColor, secondaryColor, thickness);
      break;
    case 'solid-industrial':
      renderSolidIndustrial(canvas, dims.width, dims.height, primaryColor, secondaryColor, thickness);
      break;
    case 'double-line':
      renderDoubleLine(canvas, dims.width, dims.height, primaryColor, secondaryColor, thickness);
      break;
    case 'rounded-safety':
      renderRoundedSafety(canvas, dims.width, dims.height, primaryColor, secondaryColor, thickness);
      break;
    case 'color-banded':
      renderColorBanded(canvas, dims.width, dims.height, primaryColor, secondaryColor, thickness);
      break;
  }

  // Send border objects to back
  const borderObjects = canvas.getObjects().filter(
    (obj: any) => obj._customId === BORDER_GROUP_ID
  );
  borderObjects.forEach((obj) => canvas.sendObjectToBack(obj));

  canvas.requestRenderAll();
}
