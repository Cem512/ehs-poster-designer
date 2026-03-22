import * as fabric from 'fabric';
import type { PosterDocument } from '../../types/poster';
import { getPosterDimensionsPx, mmToPx } from '../../constants/paper-sizes';
import { getBorderInset } from '../borders/border-factory';

const ZONE_GROUP_ID = '__poster_zone__';

function clearZones(canvas: fabric.Canvas) {
  const objects = canvas.getObjects().filter(
    (obj: any) => obj._customId === ZONE_GROUP_ID ||
      obj._customId === '__poster_header_text__' ||
      obj._customId === '__poster_footer_text__'
  );
  objects.forEach((obj) => canvas.remove(obj));
}

function markAsZone(obj: fabric.FabricObject) {
  (obj as any)._customId = ZONE_GROUP_ID;
  obj.selectable = false;
  obj.evented = false;
}

export function renderZones(canvas: fabric.Canvas, posterDoc: PosterDocument) {
  clearZones(canvas);

  const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
  const borderInset = getBorderInset(posterDoc.border.type, posterDoc.border.thickness);
  const padding = mmToPx(3);
  const innerLeft = borderInset + padding;
  const innerTop = borderInset + padding;
  const innerWidth = dims.width - 2 * (borderInset + padding);
  const innerHeight = dims.height - 2 * (borderInset + padding);

  // Header zone
  if (posterDoc.header.visible) {
    const headerHeight = innerHeight * (posterDoc.header.heightPercent / 100);

    const headerBg = new fabric.Rect({
      left: innerLeft,
      top: innerTop,
      width: innerWidth,
      height: headerHeight,
      fill: posterDoc.header.backgroundColor,
      strokeWidth: 0,
    });
    markAsZone(headerBg);
    canvas.add(headerBg);

    // Signal word text — editable IText so user can change it
    const signalWord = posterDoc.theme.signalWord;
    const fontSize = headerHeight * 0.45;
    const text = new fabric.IText(signalWord, {
      left: innerLeft + innerWidth / 2,
      top: innerTop + headerHeight / 2,
      fontSize,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      fill: posterDoc.header.textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      editable: true,
    });
    (text as any)._customId = '__poster_header_text__';
    canvas.add(text);
  }

  // Footer zone
  if (posterDoc.footer.visible) {
    const footerHeight = innerHeight * (posterDoc.footer.heightPercent / 100);
    const footerTop = innerTop + innerHeight - footerHeight;

    const footerBg = new fabric.Rect({
      left: innerLeft,
      top: footerTop,
      width: innerWidth,
      height: footerHeight,
      fill: posterDoc.footer.backgroundColor,
      strokeWidth: 0,
    });
    markAsZone(footerBg);
    canvas.add(footerBg);

    // Footer placeholder text — editable IText so user can fill in details
    const footerFontSize = footerHeight * 0.2;
    const footerText = new fabric.IText('Company Name  |  Regulatory Reference  |  Date', {
      left: innerLeft + innerWidth / 2,
      top: footerTop + footerHeight / 2,
      fontSize: footerFontSize,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: posterDoc.footer.textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      opacity: 0.6,
      editable: true,
    });
    (footerText as any)._customId = '__poster_footer_text__';
    canvas.add(footerText);
  }

  // Content zone indicator (subtle dashed border)
  const headerH = posterDoc.header.visible ? innerHeight * (posterDoc.header.heightPercent / 100) : 0;
  const footerH = posterDoc.footer.visible ? innerHeight * (posterDoc.footer.heightPercent / 100) : 0;
  const contentTop = innerTop + headerH + mmToPx(2);
  const contentHeight = innerHeight - headerH - footerH - mmToPx(4);

  const contentArea = new fabric.Rect({
    left: innerLeft,
    top: contentTop,
    width: innerWidth,
    height: contentHeight,
    fill: 'transparent',
    stroke: '#94a3b8',
    strokeWidth: 0.5,
    strokeDashArray: [5, 5],
    opacity: 0.3,
  });
  markAsZone(contentArea);
  canvas.add(contentArea);

  canvas.requestRenderAll();
}
