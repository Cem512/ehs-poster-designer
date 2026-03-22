import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "Fire Safety" template — red theme.
 *
 * Layout (top to bottom):
 * 1. Header — red background with "FIRE SAFETY" title — ~14% height
 * 2. Content — fire extinguisher locations, evacuation route placeholder, assembly point,
 *    numbered "In case of fire:" steps — ~70% height
 * 3. Footer — "KNOW YOUR EXITS — PRACTICE YOUR EVACUATION ROUTE" — ~8% height
 */
function applyFireSafety(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;

  const accent = theme.accent;
  const textDark = theme.textColor;
  const white = '#FFFFFF';

  const margin = mmToPx(8);

  // ── 1. Header ──
  const headerH = height * 0.14;
  const headerBg = new fabric.Rect({
    left: 0, top: 0, width, height: headerH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(headerBg);

  // Fire icon placeholder (left)
  const iconSize = headerH * 0.5;
  const iconX = margin + iconSize * 0.6;
  const iconY = headerH / 2;
  const fireIcon = new fabric.Circle({
    left: iconX - iconSize / 2,
    top: iconY - iconSize / 2,
    radius: iconSize / 2,
    fill: accent,
    strokeWidth: 0,
  });
  canvas.add(fireIcon);

  const fireIconLabel = new fabric.IText('🔥', {
    left: iconX,
    top: iconY,
    fontSize: height * 0.03,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: white,
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(fireIconLabel);

  const titleText = new fabric.IText('FIRE SAFETY', {
    left: width / 2,
    top: headerH * 0.2,
    fontSize: height * 0.085,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    originX: 'center',
    editable: true,
  });
  canvas.add(titleText);

  // ── 2. Content area ──
  const contentTop = headerH;
  const footerH = height * 0.08;
  const contentH = height - contentTop - footerH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  // -- "In case of fire:" section heading --
  const sectionY = contentTop + mmToPx(10);
  const sectionTitle = new fabric.IText('In case of fire:', {
    left: margin,
    top: sectionY,
    fontSize: height * 0.035,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: primary,
    editable: true,
  });
  canvas.add(sectionTitle);

  // Numbered steps
  const steps = [
    'Activate the nearest fire alarm',
    'Call emergency services immediately',
    'Evacuate using the nearest safe exit',
    'Proceed to the assembly point',
    'Do NOT use elevators',
  ];

  const stepStartY = sectionY + height * 0.055;
  const stepSpacing = height * 0.042;
  const circleR = mmToPx(5);
  const circleX = margin + circleR + mmToPx(2);
  const textStartX = circleX + circleR + mmToPx(6);

  for (let i = 0; i < steps.length; i++) {
    const sy = stepStartY + stepSpacing * i;

    const numCircle = new fabric.Circle({
      left: circleX - circleR,
      top: sy - circleR + height * 0.012,
      radius: circleR,
      fill: primary,
      strokeWidth: 0,
    });
    canvas.add(numCircle);

    const numText = new fabric.IText(String(i + 1), {
      left: circleX,
      top: sy + height * 0.012,
      fontSize: height * 0.022,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      fill: white,
      originX: 'center',
      originY: 'center',
      editable: true,
    });
    canvas.add(numText);

    const stepText = new fabric.IText(steps[i], {
      left: textStartX,
      top: sy,
      fontSize: height * 0.024,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: textDark,
      editable: true,
    });
    canvas.add(stepText);
  }

  // -- Fire Extinguisher Locations section --
  const extSectionY = stepStartY + stepSpacing * steps.length + mmToPx(8);

  const extTitle = new fabric.IText('Fire Extinguisher Locations:', {
    left: margin,
    top: extSectionY,
    fontSize: height * 0.026,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: primary,
    editable: true,
  });
  canvas.add(extTitle);

  // Extinguisher placeholder boxes
  const extBoxY = extSectionY + height * 0.04;
  const extBoxW = (width - margin * 3) / 2;
  const extBoxH = height * 0.08;

  const extBox1 = new fabric.Rect({
    left: margin,
    top: extBoxY,
    width: extBoxW, height: extBoxH,
    fill: 'transparent',
    stroke: primary,
    strokeWidth: mmToPx(0.5),
    strokeDashArray: [4, 4],
    rx: mmToPx(2),
    ry: mmToPx(2),
  });
  canvas.add(extBox1);

  const extLabel1 = new fabric.IText('Extinguisher\nLocation 1', {
    left: margin + extBoxW / 2,
    top: extBoxY + extBoxH / 2,
    fontSize: height * 0.016,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#999',
    originX: 'center',
    originY: 'center',
    textAlign: 'center',
    editable: true,
  });
  canvas.add(extLabel1);

  const extBox2 = new fabric.Rect({
    left: margin * 2 + extBoxW,
    top: extBoxY,
    width: extBoxW, height: extBoxH,
    fill: 'transparent',
    stroke: primary,
    strokeWidth: mmToPx(0.5),
    strokeDashArray: [4, 4],
    rx: mmToPx(2),
    ry: mmToPx(2),
  });
  canvas.add(extBox2);

  const extLabel2 = new fabric.IText('Extinguisher\nLocation 2', {
    left: margin * 2 + extBoxW + extBoxW / 2,
    top: extBoxY + extBoxH / 2,
    fontSize: height * 0.016,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#999',
    originX: 'center',
    originY: 'center',
    textAlign: 'center',
    editable: true,
  });
  canvas.add(extLabel2);

  // -- Assembly Point section --
  const asmY = extBoxY + extBoxH + mmToPx(10);

  const asmTitle = new fabric.IText('Assembly Point:', {
    left: margin,
    top: asmY,
    fontSize: height * 0.026,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: primary,
    editable: true,
  });
  canvas.add(asmTitle);

  // Assembly point placeholder area
  const asmBoxY = asmY + height * 0.04;
  const asmBoxH = height * 0.08;
  const asmBox = new fabric.Rect({
    left: margin,
    top: asmBoxY,
    width: width - margin * 2,
    height: asmBoxH,
    fill: '#FFF3F0',
    stroke: primary,
    strokeWidth: mmToPx(0.5),
    rx: mmToPx(2),
    ry: mmToPx(2),
  });
  canvas.add(asmBox);

  const asmText = new fabric.IText('Evacuation Route / Assembly Point Map\n[Insert map or directions here]', {
    left: width / 2,
    top: asmBoxY + asmBoxH / 2,
    fontSize: height * 0.018,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#999',
    originX: 'center',
    originY: 'center',
    textAlign: 'center',
    editable: true,
  });
  canvas.add(asmText);

  // ── 3. Footer bar ──
  const footerTop = height - footerH;
  const footerBgRect = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(footerBgRect);

  const footerText = new fabric.IText(
    'KNOW YOUR EXITS — PRACTICE YOUR EVACUATION ROUTE',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.022,
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
  <!-- Header -->
  <rect y="0" width="120" height="24" fill="#CC0000"/>
  <text x="60" y="17" font-size="10" fill="#fff" font-weight="bold" text-anchor="middle">FIRE SAFETY</text>
  <!-- Section heading -->
  <text x="8" y="36" font-size="5" fill="#CC0000" font-weight="bold">In case of fire:</text>
  <!-- Numbered steps -->
  <circle cx="14" cy="46" r="4" fill="#CC0000"/>
  <text x="14" y="48" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">1</text>
  <rect x="22" y="44" width="65" height="3" rx="1" fill="#ddd"/>
  <circle cx="14" cy="57" r="4" fill="#CC0000"/>
  <text x="14" y="59" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">2</text>
  <rect x="22" y="55" width="60" height="3" rx="1" fill="#ddd"/>
  <circle cx="14" cy="68" r="4" fill="#CC0000"/>
  <text x="14" y="70" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">3</text>
  <rect x="22" y="66" width="70" height="3" rx="1" fill="#ddd"/>
  <circle cx="14" cy="79" r="4" fill="#CC0000"/>
  <text x="14" y="81" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">4</text>
  <rect x="22" y="77" width="55" height="3" rx="1" fill="#ddd"/>
  <circle cx="14" cy="90" r="4" fill="#CC0000"/>
  <text x="14" y="92" font-size="5" fill="#fff" font-weight="bold" text-anchor="middle">5</text>
  <rect x="22" y="88" width="50" height="3" rx="1" fill="#ddd"/>
  <!-- Extinguisher section -->
  <text x="8" y="106" font-size="4" fill="#CC0000" font-weight="bold">Fire Extinguisher Locations:</text>
  <rect x="8" y="110" width="48" height="16" rx="2" fill="none" stroke="#CC0000" stroke-dasharray="2" stroke-width="0.5"/>
  <rect x="62" y="110" width="48" height="16" rx="2" fill="none" stroke="#CC0000" stroke-dasharray="2" stroke-width="0.5"/>
  <!-- Assembly point -->
  <text x="8" y="138" font-size="4" fill="#CC0000" font-weight="bold">Assembly Point:</text>
  <rect x="8" y="140" width="104" height="12" rx="2" fill="#FFF3F0" stroke="#CC0000" stroke-width="0.5"/>
  <text x="60" y="148" font-size="3" fill="#999" text-anchor="middle">Evacuation Route / Assembly Point</text>
  <!-- Footer -->
  <rect y="155" width="120" height="15" fill="#CC0000"/>
  <text x="60" y="165" font-size="3" fill="#fff" font-weight="bold" text-anchor="middle">KNOW YOUR EXITS — PRACTICE YOUR EVACUATION ROUTE</text>
</svg>`;

export const fireSafetyTemplate: TemplateDefinition = {
  id: 'fire-safety',
  name: 'Fire Safety',
  description: 'Red-themed fire safety poster with numbered emergency steps, extinguisher location placeholders, assembly point area, and evacuation reminder.',
  category: 'general',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyFireSafety,
};
