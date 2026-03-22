import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "PPE Required" template — mandatory blue theme.
 *
 * Layout (top to bottom):
 * 1. Solid blue header bar — ~8% height
 * 2. Header section — "MANDATORY" signal word + "PERSONAL PROTECTIVE EQUIPMENT" title — ~18% height
 * 3. Mid-band — "Required in this area" subtitle — ~8% height
 * 4. Content section — 2×3 grid of circular PPE pictogram placeholders — ~54% height
 * 5. Footer bar — compliance warning — ~8% height
 */
function applyPpeRequired(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;

  const textDark = theme.textColor;
  const white = '#FFFFFF';

  const margin = mmToPx(8);

  // ── 1. Solid blue top bar ──
  const topBarH = height * 0.08;
  const topBar = new fabric.Rect({
    left: 0, top: 0, width, height: topBarH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(topBar);

  // ── 2. Header section ──
  const headerTop = topBarH;
  const headerH = height * 0.18;
  const headerBg = new fabric.Rect({
    left: 0, top: headerTop, width, height: headerH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(headerBg);

  // Signal word: MANDATORY
  const signalWord = new fabric.IText('MANDATORY', {
    left: width / 2,
    top: headerTop + headerH * 0.08,
    fontSize: height * 0.048,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: primary,
    originX: 'center',
    editable: true,
  });
  canvas.add(signalWord);

  // Title
  const titleText = new fabric.IText('PERSONAL PROTECTIVE\nEQUIPMENT', {
    left: width / 2,
    top: headerTop + headerH * 0.45,
    fontSize: height * 0.055,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    textAlign: 'center',
    originX: 'center',
    lineHeight: 1.1,
    editable: true,
  });
  canvas.add(titleText);

  // ── 3. Mid-band (blue) ──
  const midTop = headerTop + headerH;
  const midH = height * 0.08;
  const midBg = new fabric.Rect({
    left: 0, top: midTop, width, height: midH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(midBg);

  const subtitle = new fabric.IText('Required in this area', {
    left: width / 2,
    top: midTop + midH / 2,
    fontSize: height * 0.03,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(subtitle);

  // ── 4. Content section — 2×3 grid of PPE pictogram circles ──
  const contentTop = midTop + midH;
  const footerH = height * 0.08;
  const contentH = height - contentTop - footerH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  const labels = [
    'Hard Hat', 'Safety Goggles', 'Gloves',
    'Safety Boots', 'Ear Protection', 'Hi-Vis Vest',
  ];

  const cols = 3;
  const rows = 2;
  const cellW = (width - margin * 2) / cols;
  const cellH = contentH / rows;
  const circleR = Math.min(cellW, cellH) * 0.32;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const cx = margin + cellW * c + cellW / 2;
      const cy = contentTop + cellH * r + cellH * 0.45;

      // Blue circle
      const circle = new fabric.Circle({
        left: cx - circleR,
        top: cy - circleR,
        radius: circleR,
        fill: primary,
        strokeWidth: 0,
      });
      canvas.add(circle);

      // Pictogram placeholder text inside circle
      const iconLabel = new fabric.IText(labels[idx], {
        left: cx,
        top: cy,
        fontSize: height * 0.016,
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 'bold',
        fill: white,
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        editable: true,
      });
      canvas.add(iconLabel);

      // Label below circle
      const labelText = new fabric.IText(labels[idx], {
        left: cx,
        top: cy + circleR + mmToPx(4),
        fontSize: height * 0.018,
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 'bold',
        fill: textDark,
        originX: 'center',
        textAlign: 'center',
        editable: true,
      });
      canvas.add(labelText);
    }
  }

  // ── 5. Footer bar ──
  const footerTop = height - footerH;
  const footerBg = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(footerBg);

  const footerText = new fabric.IText(
    'FAILURE TO COMPLY MAY RESULT IN DISCIPLINARY ACTION',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.02,
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
  <!-- Top bar -->
  <rect y="0" width="120" height="14" fill="#0055A4"/>
  <!-- Header -->
  <text x="60" y="28" font-size="5" fill="#0055A4" font-weight="bold" text-anchor="middle">MANDATORY</text>
  <text x="60" y="38" font-size="7" fill="#333" font-weight="bold" text-anchor="middle">PERSONAL PROTECTIVE</text>
  <text x="60" y="47" font-size="7" fill="#333" font-weight="bold" text-anchor="middle">EQUIPMENT</text>
  <!-- Mid band -->
  <rect y="52" width="120" height="14" fill="#0055A4"/>
  <text x="60" y="62" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">Required in this area</text>
  <!-- PPE grid -->
  <circle cx="25" cy="85" r="10" fill="#0055A4"/>
  <text x="25" y="87" font-size="3.5" fill="#fff" text-anchor="middle">Hard Hat</text>
  <circle cx="60" cy="85" r="10" fill="#0055A4"/>
  <text x="60" y="87" font-size="3.5" fill="#fff" text-anchor="middle">Goggles</text>
  <circle cx="95" cy="85" r="10" fill="#0055A4"/>
  <text x="95" y="87" font-size="3.5" fill="#fff" text-anchor="middle">Gloves</text>
  <circle cx="25" cy="120" r="10" fill="#0055A4"/>
  <text x="25" y="122" font-size="3.5" fill="#fff" text-anchor="middle">Boots</text>
  <circle cx="60" cy="120" r="10" fill="#0055A4"/>
  <text x="60" y="122" font-size="3.5" fill="#fff" text-anchor="middle">Ear</text>
  <circle cx="95" cy="120" r="10" fill="#0055A4"/>
  <text x="95" y="122" font-size="3.5" fill="#fff" text-anchor="middle">Hi-Vis</text>
  <!-- Footer -->
  <rect y="155" width="120" height="15" fill="#0055A4"/>
  <text x="60" y="165" font-size="3" fill="#fff" font-weight="bold" text-anchor="middle">FAILURE TO COMPLY MAY RESULT IN DISCIPLINARY ACTION</text>
</svg>`;

export const ppeRequiredTemplate: TemplateDefinition = {
  id: 'ppe-required',
  name: 'PPE Required',
  description: 'Mandatory blue PPE poster with 2×3 grid of pictogram placeholders for personal protective equipment requirements.',
  category: 'ppe',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyPpeRequired,
};
