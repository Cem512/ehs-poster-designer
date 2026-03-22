import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "Chemical Hazard" template — yellow/black warning theme.
 *
 * Layout (top to bottom):
 * 1. Hazard stripe bar (yellow/black diagonal stripes) — ~6% height
 * 2. Header — "WARNING" + "CHEMICAL HAZARD AREA" — ~16% height
 * 3. Content — GHS diamond grid (2×2), chemical name field, hazard class, SDS reference — ~66% height
 * 4. Footer — "REFER TO SAFETY DATA SHEET BEFORE HANDLING" — ~8% height
 */
function applyChemicalHazard(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;

  const textDark = theme.textColor;
  const white = '#FFFFFF';

  const margin = mmToPx(8);

  // ── 1. Hazard stripe bar (yellow/black) ──
  const stripeBarH = height * 0.06;
  const stripeBg = new fabric.Rect({
    left: 0, top: 0, width, height: stripeBarH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(stripeBg);

  const stripeW = mmToPx(8);
  const step = stripeW * 2;
  for (let pos = -stripeBarH; pos < width + stripeBarH; pos += step) {
    const line = new fabric.Line(
      [pos, 0, pos + stripeBarH, stripeBarH],
      { stroke: textDark, strokeWidth: stripeW * 0.6 }
    );
    canvas.add(line);
  }

  // Clip mask below stripes
  const stripeClip = new fabric.Rect({
    left: 0, top: stripeBarH, width, height: height - stripeBarH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(stripeClip);

  // ── 2. Header ──
  const headerTop = stripeBarH;
  const headerH = height * 0.16;
  const headerBg = new fabric.Rect({
    left: 0, top: headerTop, width, height: headerH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(headerBg);

  const warningText = new fabric.IText('WARNING', {
    left: width / 2,
    top: headerTop + headerH * 0.1,
    fontSize: height * 0.065,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    originX: 'center',
    editable: true,
  });
  canvas.add(warningText);

  const chemTitle = new fabric.IText('CHEMICAL HAZARD AREA', {
    left: width / 2,
    top: headerTop + headerH * 0.58,
    fontSize: height * 0.055,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    originX: 'center',
    editable: true,
  });
  canvas.add(chemTitle);

  // ── 3. Content area ──
  const contentTop = headerTop + headerH;
  const footerH = height * 0.08;
  const contentH = height - contentTop - footerH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  // Chemical name field
  const chemNameY = contentTop + mmToPx(10);
  const chemNameLabel = new fabric.IText('Chemical Name:', {
    left: margin,
    top: chemNameY,
    fontSize: height * 0.02,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    editable: true,
  });
  canvas.add(chemNameLabel);

  const chemNameField = new fabric.IText('[Enter Chemical Name]', {
    left: margin,
    top: chemNameY + height * 0.03,
    fontSize: height * 0.028,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: primary,
    editable: true,
  });
  canvas.add(chemNameField);

  // Hazard class field
  const hazClassY = chemNameY + height * 0.075;
  const hazClassLabel = new fabric.IText('Hazard Class:', {
    left: margin,
    top: hazClassY,
    fontSize: height * 0.02,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    editable: true,
  });
  canvas.add(hazClassLabel);

  const hazClassField = new fabric.IText('[Enter Hazard Classification]', {
    left: margin,
    top: hazClassY + height * 0.028,
    fontSize: height * 0.022,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: textDark,
    editable: true,
  });
  canvas.add(hazClassField);

  // GHS diamond grid (2×2)
  const gridTop = hazClassY + height * 0.09;
  const gridAreaH = contentH * 0.45;
  const diamondSize = Math.min((width - margin * 3) / 2.5, gridAreaH / 2.5);
  const gridCenterX = width / 2;
  const gapX = diamondSize * 1.2;
  const gapY = diamondSize * 1.2;

  const ghsLabels = [
    'GHS\nPictogram 1', 'GHS\nPictogram 2',
    'GHS\nPictogram 3', 'GHS\nPictogram 4',
  ];

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const idx = r * 2 + c;
      const cx = gridCenterX + (c - 0.5) * gapX;
      const cy = gridTop + gridAreaH * 0.1 + (r + 0.5) * gapY;

      // Diamond (rotated square) — use border only
      const half = diamondSize / 2;
      // Draw diamond as a polygon-like set of lines
      const diamondBorder = new fabric.Rect({
        left: cx - half,
        top: cy - half,
        width: diamondSize,
        height: diamondSize,
        fill: 'transparent',
        stroke: primary,
        strokeWidth: mmToPx(1),
        angle: 45,
        originX: 'center',
        originY: 'center',
      });
      // Manually position with origin
      diamondBorder.set({ left: cx, top: cy });
      canvas.add(diamondBorder);

      const diamondLabel = new fabric.IText(ghsLabels[idx], {
        left: cx,
        top: cy,
        fontSize: height * 0.016,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#999',
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        editable: true,
      });
      canvas.add(diamondLabel);
    }
  }

  // SDS reference section
  const sdsY = gridTop + gridAreaH + mmToPx(6);
  const sdsBg = new fabric.Rect({
    left: margin,
    top: sdsY,
    width: width - margin * 2,
    height: height * 0.06,
    fill: '#FFF8E1',
    stroke: primary,
    strokeWidth: mmToPx(0.5),
    rx: mmToPx(2),
    ry: mmToPx(2),
  });
  canvas.add(sdsBg);

  const sdsText = new fabric.IText('Safety Data Sheet (SDS) Location:\n[Specify SDS location or reference number]', {
    left: width / 2,
    top: sdsY + height * 0.03,
    fontSize: height * 0.018,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: textDark,
    originX: 'center',
    originY: 'center',
    textAlign: 'center',
    editable: true,
  });
  canvas.add(sdsText);

  // ── 4. Footer bar ──
  const footerTop = height - footerH;
  const footerBgRect = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: textDark, strokeWidth: 0,
  });
  canvas.add(footerBgRect);

  // Yellow line above footer
  const footerLine = new fabric.Line(
    [0, footerTop, width, footerTop],
    { stroke: primary, strokeWidth: mmToPx(1.5) }
  );
  canvas.add(footerLine);

  const footerText = new fabric.IText(
    'REFER TO SAFETY DATA SHEET BEFORE HANDLING',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.022,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      fill: primary,
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
  <rect y="0" width="120" height="10" fill="#FFC107"/>
  <line x1="0" y1="0" x2="10" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="8" y1="0" x2="18" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="16" y1="0" x2="26" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="24" y1="0" x2="34" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="32" y1="0" x2="42" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="40" y1="0" x2="50" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="48" y1="0" x2="58" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="56" y1="0" x2="66" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="64" y1="0" x2="74" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="72" y1="0" x2="82" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="80" y1="0" x2="90" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="88" y1="0" x2="98" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="96" y1="0" x2="106" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="104" y1="0" x2="114" y2="10" stroke="#222" stroke-width="3"/>
  <line x1="112" y1="0" x2="122" y2="10" stroke="#222" stroke-width="3"/>
  <!-- Header -->
  <rect y="10" width="120" height="27" fill="#FFC107"/>
  <text x="60" y="23" font-size="6" fill="#222" font-weight="bold" text-anchor="middle">WARNING</text>
  <text x="60" y="33" font-size="6" fill="#222" font-weight="bold" text-anchor="middle">CHEMICAL HAZARD AREA</text>
  <!-- Chemical name -->
  <text x="8" y="48" font-size="4" fill="#222" font-weight="bold">Chemical Name:</text>
  <rect x="8" y="50" width="60" height="4" rx="1" fill="#eee"/>
  <!-- GHS diamonds (rotated squares) -->
  <rect x="22" y="70" width="16" height="16" fill="none" stroke="#FFC107" stroke-width="1" transform="rotate(45 30 78)"/>
  <rect x="62" y="70" width="16" height="16" fill="none" stroke="#FFC107" stroke-width="1" transform="rotate(45 70 78)"/>
  <rect x="22" y="96" width="16" height="16" fill="none" stroke="#FFC107" stroke-width="1" transform="rotate(45 30 104)"/>
  <rect x="62" y="96" width="16" height="16" fill="none" stroke="#FFC107" stroke-width="1" transform="rotate(45 70 104)"/>
  <!-- SDS reference -->
  <rect x="8" y="125" width="104" height="14" rx="2" fill="#FFF8E1" stroke="#FFC107" stroke-width="0.5"/>
  <text x="60" y="134" font-size="3.5" fill="#222" text-anchor="middle">Safety Data Sheet Location</text>
  <!-- Footer -->
  <rect y="155" width="120" height="15" fill="#222"/>
  <line x1="0" y1="155" x2="120" y2="155" stroke="#FFC107" stroke-width="1.5"/>
  <text x="60" y="165" font-size="3" fill="#FFC107" font-weight="bold" text-anchor="middle">REFER TO SAFETY DATA SHEET BEFORE HANDLING</text>
</svg>`;

export const chemicalHazardTemplate: TemplateDefinition = {
  id: 'chemical-hazard',
  name: 'Chemical Hazard',
  description: 'Yellow/black warning poster with GHS diamond placeholders, chemical name and hazard class fields, and SDS reference section.',
  category: 'chemical',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyChemicalHazard,
};
