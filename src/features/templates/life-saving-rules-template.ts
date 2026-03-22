import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "Life Saving Rules — Line of Fire" template.
 * Faithfully reproduces the reference PDF layout:
 *
 * 1. Clean white top strip — ~3.5% height
 * 2. Light gray header — left teal accent bar, series label, large spaced title — ~26.5%
 * 3. Teal mid-band — subtitle text (Inter-SemiBold) + circular illustration placeholder — ~15.5%
 * 4. White content area — teal bullet dots, body text, indented sub-bullets, QR code — ~44%
 * 5. Lime/accent footer — teal rule + bold call-to-action — ~10%
 */
function applyLifeSavingRules(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;     // teal (#005E60)
  const accent = theme.accent;       // lime (#C7FF05)
  const textDark = theme.textColor;  // black
  const white = '#FFFFFF';

  const margin = mmToPx(8);

  // ── 1. Clean white top strip (~3.5%) ──
  const topStripH = height * 0.035;
  const topStrip = new fabric.Rect({
    left: 0, top: 0, width, height: topStripH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(topStrip);

  // ── 2. Light gray header (~26.5%) ──
  const headerTop = topStripH;
  const headerH = height * 0.265;
  const headerBg = new fabric.Rect({
    left: 0, top: headerTop, width, height: headerH,
    fill: '#EDEDED', strokeWidth: 0,
  });
  canvas.add(headerBg);

  // Left teal accent bar (vertical)
  const accentBarX = margin;
  const accentBarTop = headerTop + mmToPx(12);
  const accentBarH = headerH * 0.72;
  const accentBar = new fabric.Rect({
    left: accentBarX, top: accentBarTop,
    width: mmToPx(2.5), height: accentBarH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(accentBar);

  // Series label: "THE LIFE SAVING RULES"
  const seriesLabel = new fabric.IText('THE LIFE SAVING RULES', {
    left: accentBarX + mmToPx(6),
    top: headerTop + mmToPx(8),
    fontSize: height * 0.027,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: textDark,
    charSpacing: 80,
    editable: true,
  });
  canvas.add(seriesLabel);

  // Large title: "LINE" (letter-spaced)
  const titleLine1 = new fabric.IText('L I N E', {
    left: accentBarX + mmToPx(6),
    top: accentBarTop + mmToPx(2),
    fontSize: height * 0.089,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: '900',
    fill: primary,
    charSpacing: 200,
    lineHeight: 1.0,
    editable: true,
  });
  canvas.add(titleLine1);

  // Large title: "OF FIRE" (letter-spaced)
  const titleLine2 = new fabric.IText('O F  F I R E', {
    left: accentBarX + mmToPx(6),
    top: accentBarTop + mmToPx(2) + height * 0.075,
    fontSize: height * 0.089,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: '900',
    fill: primary,
    charSpacing: 200,
    lineHeight: 1.0,
    editable: true,
  });
  canvas.add(titleLine2);

  // Logo placeholder (top-right corner)
  const logoSize = mmToPx(20);
  const logoPlaceholder = new fabric.Rect({
    left: width - margin - logoSize,
    top: headerTop + mmToPx(8),
    width: logoSize,
    height: logoSize,
    fill: 'transparent',
    stroke: '#CCCCCC',
    strokeWidth: 1,
    strokeDashArray: [4, 4],
    rx: mmToPx(2),
    ry: mmToPx(2),
  });
  canvas.add(logoPlaceholder);

  const logoLabel = new fabric.IText('LOGO', {
    left: width - margin - logoSize / 2,
    top: headerTop + mmToPx(8) + logoSize / 2,
    fontSize: height * 0.014,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#CCCCCC',
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(logoLabel);

  // ── 3. Teal mid-band (~15.5%) ──
  const midTop = headerTop + headerH;
  const midH = height * 0.155;
  const midBg = new fabric.Rect({
    left: 0, top: midTop, width, height: midH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(midBg);

  // Subtitle text (Inter SemiBold, white)
  const subtitle = new fabric.IText('Keep yourself and others\nout of the line of fire', {
    left: margin,
    top: midTop + midH * 0.25,
    fontSize: height * 0.0285,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: '600',
    fill: white,
    lineHeight: 1.3,
    editable: true,
  });
  canvas.add(subtitle);

  // Circular illustration placeholder (right side)
  const circleR = midH * 0.42;
  const circleCx = width - margin - circleR * 1.5;
  const circleCy = midTop + midH / 2;
  const illustrationCircle = new fabric.Circle({
    left: circleCx - circleR,
    top: circleCy - circleR,
    radius: circleR,
    fill: accent,
    strokeWidth: 0,
  });
  canvas.add(illustrationCircle);

  const illustrationLabel = new fabric.IText('Illustration', {
    left: circleCx,
    top: circleCy,
    fontSize: height * 0.014,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: primary,
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(illustrationLabel);

  // ── 4. White content area (~44%) ──
  const contentTop = midTop + midH;
  const footerH = height * 0.10;
  const contentH = height - contentTop - footerH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  // Main bullet points (teal dots, Inter Regular)
  const bulletX = margin + mmToPx(4);
  const textX = margin + mmToPx(12);
  const bulletFontSize = height * 0.024;
  const bulletSpacing = height * 0.045;
  let bulletY = contentTop + mmToPx(12);
  const bulletRadius = mmToPx(2.5);

  const bulletItems = [
    'I comply with barriers or an established exclusion zone',
    'I secure objects such as tools equipment or materials',
    'I position myself to avoid being hit,\npulled in or crushed by:',
  ];

  for (const item of bulletItems) {
    // Teal bullet dot
    const dot = new fabric.Circle({
      left: bulletX,
      top: bulletY + bulletFontSize * 0.35,
      radius: bulletRadius,
      fill: primary,
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

    const lines = item.split('\n').length;
    bulletY += bulletSpacing * lines;
  }

  // Sub-bullet items (indented, smaller black dots)
  const subBulletX = textX + mmToPx(6);
  const subTextX = textX + mmToPx(14);
  const subFontSize = height * 0.024;
  const subSpacing = height * 0.040;

  const subItems = [
    'Moving or rotating objects',
    'Motorized vehicles',
    'Dropped, falling or flying objects',
    'Energy release such as pneumatic,\nhydraulic, pressure and electrical',
  ];

  bulletY += mmToPx(2);

  for (const item of subItems) {
    const dot = new fabric.Circle({
      left: subBulletX,
      top: bulletY + subFontSize * 0.35,
      radius: mmToPx(1.5),
      fill: textDark,
      originX: 'center',
      originY: 'center',
      strokeWidth: 0,
    });
    canvas.add(dot);

    const text = new fabric.IText(item, {
      left: subTextX,
      top: bulletY,
      fontSize: subFontSize,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: textDark,
      lineHeight: 1.3,
      editable: true,
    });
    canvas.add(text);

    const lines = item.split('\n').length;
    bulletY += subSpacing * lines;
  }

  // QR code placeholder (bottom-right of content area)
  const qrSize = mmToPx(22);
  const qrBox = new fabric.Rect({
    left: width - margin - qrSize,
    top: contentTop + contentH - qrSize - mmToPx(6),
    width: qrSize, height: qrSize,
    fill: 'transparent',
    stroke: '#CCCCCC',
    strokeWidth: 1,
    strokeDashArray: [3, 3],
  });
  canvas.add(qrBox);

  const qrLabel = new fabric.IText('QR', {
    left: width - margin - qrSize / 2,
    top: contentTop + contentH - qrSize / 2 - mmToPx(6),
    fontSize: height * 0.016,
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#CCCCCC',
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(qrLabel);

  // ── 5. Lime/accent footer (~10%) ──
  const footerTop = height - footerH;
  const footerBg = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: accent, strokeWidth: 0,
  });
  canvas.add(footerBg);

  // Thin teal line above footer
  const footerLine = new fabric.Line(
    [0, footerTop, width, footerTop],
    { stroke: primary, strokeWidth: mmToPx(1.5) }
  );
  canvas.add(footerLine);

  const footerText = new fabric.IText(
    'WE START WORK ONLY WHEN IT\'S SAFE, AND STOP WHEN IT\'S NOT.',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.034,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: '900',
      fill: textDark,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      charSpacing: 40,
      editable: true,
    }
  );
  canvas.add(footerText);
}

/** SVG thumbnail for template gallery */
const thumbnail = `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="170" fill="#fff" rx="2"/>
  <!-- White top strip -->
  <rect y="0" width="120" height="6" fill="#fff"/>
  <!-- Gray header -->
  <rect y="6" width="120" height="45" fill="#EDEDED"/>
  <rect x="8" y="14" width="2" height="32" fill="#005E60"/>
  <text x="14" y="18" font-size="4.5" fill="#000" font-weight="bold" letter-spacing="1">THE LIFE SAVING RULES</text>
  <text x="14" y="30" font-size="13" fill="#005E60" font-weight="900" letter-spacing="3">L I N E</text>
  <text x="14" y="44" font-size="13" fill="#005E60" font-weight="900" letter-spacing="3">O F  F I R E</text>
  <!-- Teal mid-band -->
  <rect y="51" width="120" height="26" fill="#005E60"/>
  <text x="8" y="64" font-size="5" fill="#fff" font-weight="600">Keep yourself and others</text>
  <text x="8" y="72" font-size="5" fill="#fff" font-weight="600">out of the line of fire</text>
  <circle cx="100" cy="64" r="10" fill="#C7FF05"/>
  <!-- Content -->
  <circle cx="12" cy="88" r="2" fill="#005E60"/>
  <rect x="18" y="86" width="60" height="3" rx="1" fill="#ddd"/>
  <circle cx="12" cy="98" r="2" fill="#005E60"/>
  <rect x="18" y="96" width="55" height="3" rx="1" fill="#ddd"/>
  <circle cx="12" cy="108" r="2" fill="#005E60"/>
  <rect x="18" y="106" width="65" height="3" rx="1" fill="#ddd"/>
  <circle cx="20" cy="118" r="1.5" fill="#333"/>
  <rect x="26" y="116" width="45" height="3" rx="1" fill="#eee"/>
  <circle cx="20" cy="126" r="1.5" fill="#333"/>
  <rect x="26" y="124" width="40" height="3" rx="1" fill="#eee"/>
  <circle cx="20" cy="134" r="1.5" fill="#333"/>
  <rect x="26" y="132" width="50" height="3" rx="1" fill="#eee"/>
  <circle cx="20" cy="142" r="1.5" fill="#333"/>
  <rect x="26" y="140" width="45" height="3" rx="1" fill="#eee"/>
  <!-- QR placeholder -->
  <rect x="96" y="134" width="16" height="16" fill="none" stroke="#ccc" stroke-dasharray="2"/>
  <!-- Lime footer -->
  <rect y="153" width="120" height="17" fill="#C7FF05"/>
  <line x1="0" y1="153" x2="120" y2="153" stroke="#005E60" stroke-width="1.5"/>
  <text x="60" y="164" font-size="3.5" fill="#000" font-weight="900" text-anchor="middle" letter-spacing="0.5">WE START WORK ONLY WHEN IT'S SAFE</text>
</svg>`;

export const lifeSavingRulesTemplate: TemplateDefinition = {
  id: 'life-saving-rules',
  name: 'Life Saving Rules — Line of Fire',
  description: 'Industrial safety poster matching the reference PDF: clean header with spaced title, teal mid-band, bullet points with sub-items, QR placeholder, and lime call-to-action footer.',
  category: 'life-saving-rules',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyLifeSavingRules,
};
