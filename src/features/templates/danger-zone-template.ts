import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "Danger Zone" template — red/black theme.
 *
 * Layout (top to bottom):
 * 1. Hazard stripe bar (black/red diagonal stripes) — ~6% height
 * 2. Header — large "DANGER" in white on red — ~16% height
 * 3. Content area — warning description, hazard pictogram placeholders, sub-bullets — ~66% height
 * 4. Footer bar — "AUTHORIZED PERSONNEL ONLY" on dark background — ~8% height
 */
function applyDangerZone(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;

  const textDark = theme.textColor;
  const white = '#FFFFFF';
  const red = primary;
  const black = textDark;

  const margin = mmToPx(8);

  // ── 1. Hazard stripe bar (black/red diagonal stripes) ──
  const stripeBarH = height * 0.06;
  const stripeBg = new fabric.Rect({
    left: 0, top: 0, width, height: stripeBarH,
    fill: black, strokeWidth: 0,
  });
  canvas.add(stripeBg);

  const stripeW = mmToPx(8);
  const step = stripeW * 2;
  for (let pos = -stripeBarH; pos < width + stripeBarH; pos += step) {
    const line = new fabric.Line(
      [pos, 0, pos + stripeBarH, stripeBarH],
      { stroke: red, strokeWidth: stripeW * 0.6 }
    );
    canvas.add(line);
  }

  // Clip mask below stripes
  const stripeClip = new fabric.Rect({
    left: 0, top: stripeBarH, width, height: height - stripeBarH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(stripeClip);

  // ── 2. Header — DANGER ──
  const headerTop = stripeBarH;
  const headerH = height * 0.16;
  const headerBg = new fabric.Rect({
    left: 0, top: headerTop, width, height: headerH,
    fill: red, strokeWidth: 0,
  });
  canvas.add(headerBg);

  const dangerText = new fabric.IText('DANGER', {
    left: width / 2,
    top: headerTop + headerH * 0.25,
    fontSize: height * 0.09,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    originX: 'center',
    editable: true,
  });
  canvas.add(dangerText);

  // ── 3. Content area ──
  const contentTop = headerTop + headerH;
  const footerH = height * 0.08;
  const contentH = height - contentTop - footerH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  // Warning description text
  const descText = new fabric.IText('DANGER ZONE\nDO NOT ENTER WITHOUT AUTHORIZATION', {
    left: width / 2,
    top: contentTop + mmToPx(12),
    fontSize: height * 0.035,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    textAlign: 'center',
    originX: 'center',
    lineHeight: 1.3,
    editable: true,
  });
  canvas.add(descText);

  // Hazard pictogram placeholders (row of 3)
  const pictoY = contentTop + contentH * 0.25;
  const pictoSize = Math.min(width * 0.2, contentH * 0.2);
  const pictoLabels = ['Hazard\nPictogram 1', 'Hazard\nPictogram 2', 'Hazard\nPictogram 3'];
  const pictoSpacing = (width - margin * 2) / 3;

  for (let i = 0; i < 3; i++) {
    const cx = margin + pictoSpacing * i + pictoSpacing / 2;

    // Diamond shape using rotated rect
    const diamond = new fabric.Rect({
      left: cx - pictoSize / 2,
      top: pictoY,
      width: pictoSize,
      height: pictoSize,
      fill: 'transparent',
      stroke: red,
      strokeWidth: mmToPx(0.8),
      angle: 0,
    });
    canvas.add(diamond);

    const pictoLabel = new fabric.IText(pictoLabels[i], {
      left: cx,
      top: pictoY + pictoSize / 2,
      fontSize: height * 0.016,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: '#999',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      editable: true,
    });
    canvas.add(pictoLabel);
  }

  // Sub-bullet hazard list
  const bulletStartY = pictoY + pictoSize + mmToPx(12);
  const bulletFontSize = height * 0.024;
  const bulletSpacing = height * 0.042;
  const bulletX = margin + mmToPx(4);
  const textX = margin + mmToPx(12);

  const hazards = [
    'High voltage electrical equipment',
    'Moving machinery — risk of entanglement',
    'Confined space — oxygen-deficient atmosphere',
    'Elevated work area — fall hazard',
  ];

  let bulletY = bulletStartY;
  for (const item of hazards) {
    const dot = new fabric.Circle({
      left: bulletX,
      top: bulletY + bulletFontSize * 0.35,
      radius: mmToPx(2),
      fill: red,
      originX: 'center',
      originY: 'center',
      strokeWidth: 0,
    });
    canvas.add(dot);

    const text = new fabric.IText(item, {
      left: textX,
      top: bulletY,
      fontSize: bulletFontSize,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: textDark,
      lineHeight: 1.3,
      editable: true,
    });
    canvas.add(text);

    bulletY += bulletSpacing;
  }

  // ── 4. Footer bar ──
  const footerTop = height - footerH;
  const footerBg = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: textDark, strokeWidth: 0,
  });
  canvas.add(footerBg);

  // Red line above footer
  const footerLine = new fabric.Line(
    [0, footerTop, width, footerTop],
    { stroke: red, strokeWidth: mmToPx(1.5) }
  );
  canvas.add(footerLine);

  const footerText = new fabric.IText(
    'AUTHORIZED PERSONNEL ONLY',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.028,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      fill: white,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      editable: true,
    }
  );
  canvas.add(footerText);
}

const thumbnail = `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="170" fill="#fff" rx="2"/>
  <!-- Stripe bar -->
  <rect y="0" width="120" height="10" fill="#222"/>
  <line x1="0" y1="0" x2="10" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="8" y1="0" x2="18" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="16" y1="0" x2="26" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="24" y1="0" x2="34" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="32" y1="0" x2="42" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="40" y1="0" x2="50" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="48" y1="0" x2="58" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="56" y1="0" x2="66" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="64" y1="0" x2="74" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="72" y1="0" x2="82" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="80" y1="0" x2="90" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="88" y1="0" x2="98" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="96" y1="0" x2="106" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="104" y1="0" x2="114" y2="10" stroke="#CC0000" stroke-width="3"/>
  <line x1="112" y1="0" x2="122" y2="10" stroke="#CC0000" stroke-width="3"/>
  <!-- Header -->
  <rect y="10" width="120" height="27" fill="#CC0000"/>
  <text x="60" y="30" font-size="16" fill="#fff" font-weight="bold" text-anchor="middle">DANGER</text>
  <!-- Content -->
  <text x="60" y="48" font-size="5" fill="#333" font-weight="bold" text-anchor="middle">DANGER ZONE</text>
  <text x="60" y="55" font-size="4" fill="#333" text-anchor="middle">DO NOT ENTER WITHOUT AUTHORIZATION</text>
  <!-- Pictogram placeholders -->
  <rect x="10" y="62" width="25" height="25" fill="none" stroke="#CC0000" stroke-width="1"/>
  <rect x="47" y="62" width="25" height="25" fill="none" stroke="#CC0000" stroke-width="1"/>
  <rect x="84" y="62" width="25" height="25" fill="none" stroke="#CC0000" stroke-width="1"/>
  <!-- Bullets -->
  <circle cx="12" cy="100" r="2" fill="#CC0000"/>
  <rect x="18" y="98" width="60" height="3" rx="1" fill="#ddd"/>
  <circle cx="12" cy="110" r="2" fill="#CC0000"/>
  <rect x="18" y="108" width="55" height="3" rx="1" fill="#ddd"/>
  <circle cx="12" cy="120" r="2" fill="#CC0000"/>
  <rect x="18" y="118" width="65" height="3" rx="1" fill="#ddd"/>
  <circle cx="12" cy="130" r="2" fill="#CC0000"/>
  <rect x="18" y="128" width="50" height="3" rx="1" fill="#ddd"/>
  <!-- Footer -->
  <rect y="155" width="120" height="15" fill="#222"/>
  <line x1="0" y1="155" x2="120" y2="155" stroke="#CC0000" stroke-width="1.5"/>
  <text x="60" y="165" font-size="4" fill="#fff" font-weight="bold" text-anchor="middle">AUTHORIZED PERSONNEL ONLY</text>
</svg>`;

export const dangerZoneTemplate: TemplateDefinition = {
  id: 'danger-zone',
  name: 'Danger Zone',
  description: 'Red/black danger poster with hazard stripes, pictogram placeholders, hazard bullet list, and restricted-access footer.',
  category: 'danger',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyDangerZone,
};
