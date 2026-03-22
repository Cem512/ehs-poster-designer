import * as fabric from 'fabric';
import type { TemplateDefinition, TemplateApplyContext } from '../../types/template';

/**
 * "Emergency Procedures" template — green/white theme.
 *
 * Layout (top to bottom):
 * 1. Header — "EMERGENCY PROCEDURES" on green background — ~14% height
 * 2. Content — 4 numbered steps with green number circles and text areas — ~68% height
 * 3. Pictogram row — exit and first-aid placeholders — ~8% height
 * 4. Footer — "IN CASE OF EMERGENCY CALL:" with phone number placeholder — ~8% height
 */
function applyEmergencyProcedures(ctx: TemplateApplyContext) {
  const { canvas, width, height, theme, mmToPx } = ctx;
  const primary = theme.primary;

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

  // White cross icon placeholder (left side)
  const crossSize = headerH * 0.4;
  const crossX = margin + crossSize / 2;
  const crossY = headerH / 2;
  const crossH = new fabric.Rect({
    left: crossX - crossSize / 2,
    top: crossY - crossSize * 0.15,
    width: crossSize,
    height: crossSize * 0.3,
    fill: white,
    strokeWidth: 0,
  });
  canvas.add(crossH);
  const crossV = new fabric.Rect({
    left: crossX - crossSize * 0.15,
    top: crossY - crossSize / 2,
    width: crossSize * 0.3,
    height: crossSize,
    fill: white,
    strokeWidth: 0,
  });
  canvas.add(crossV);

  const titleText = new fabric.IText('EMERGENCY\nPROCEDURES', {
    left: width / 2,
    top: headerH * 0.12,
    fontSize: height * 0.065,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    textAlign: 'center',
    originX: 'center',
    lineHeight: 1.1,
    editable: true,
  });
  canvas.add(titleText);

  // ── 2. Content — numbered steps ──
  const contentTop = headerH;
  const footerH = height * 0.08;
  const pictoRowH = height * 0.08;
  const contentH = height - contentTop - footerH - pictoRowH;

  const contentBg = new fabric.Rect({
    left: 0, top: contentTop, width, height: contentH,
    fill: white, strokeWidth: 0,
  });
  canvas.add(contentBg);

  const steps = [
    { num: '1', text: 'Raise the alarm — activate nearest\nfire alarm call point or call emergency services' },
    { num: '2', text: 'Evacuate the area immediately —\nuse nearest emergency exit route' },
    { num: '3', text: 'Proceed to designated assembly point —\ndo not use elevators' },
    { num: '4', text: 'Report to your supervisor and await\nfurther instructions from emergency team' },
  ];

  const stepH = contentH / steps.length;
  const circleR = Math.min(mmToPx(10), stepH * 0.25);
  const circleX = margin + circleR + mmToPx(4);
  const textStartX = circleX + circleR + mmToPx(8);

  for (let i = 0; i < steps.length; i++) {
    const sy = contentTop + stepH * i + stepH * 0.3;

    // Separator line (except first)
    if (i > 0) {
      const sepY = contentTop + stepH * i;
      const sep = new fabric.Line(
        [margin, sepY, width - margin, sepY],
        { stroke: '#E0E0E0', strokeWidth: 1 }
      );
      canvas.add(sep);
    }

    // Number circle
    const numCircle = new fabric.Circle({
      left: circleX - circleR,
      top: sy - circleR,
      radius: circleR,
      fill: primary,
      strokeWidth: 0,
    });
    canvas.add(numCircle);

    const numText = new fabric.IText(steps[i].num, {
      left: circleX,
      top: sy,
      fontSize: height * 0.035,
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      fill: white,
      originX: 'center',
      originY: 'center',
      editable: true,
    });
    canvas.add(numText);

    // Step text
    const stepText = new fabric.IText(steps[i].text, {
      left: textStartX,
      top: sy - height * 0.02,
      fontSize: height * 0.024,
      fontFamily: 'Inter, Arial, sans-serif',
      fill: textDark,
      lineHeight: 1.3,
      editable: true,
    });
    canvas.add(stepText);
  }

  // ── 3. Pictogram row ──
  const pictoTop = contentTop + contentH;
  const pictoBg = new fabric.Rect({
    left: 0, top: pictoTop, width, height: pictoRowH,
    fill: '#F5F5F5', strokeWidth: 0,
  });
  canvas.add(pictoBg);

  // Exit pictogram placeholder
  const pictoBoxSize = pictoRowH * 0.7;
  const exitBox = new fabric.Rect({
    left: width * 0.25 - pictoBoxSize / 2,
    top: pictoTop + (pictoRowH - pictoBoxSize) / 2,
    width: pictoBoxSize, height: pictoBoxSize,
    fill: primary,
    strokeWidth: 0,
  });
  canvas.add(exitBox);

  const exitLabel = new fabric.IText('EXIT', {
    left: width * 0.25,
    top: pictoTop + pictoRowH / 2,
    fontSize: height * 0.016,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    originX: 'center',
    originY: 'center',
    editable: true,
  });
  canvas.add(exitLabel);

  // First aid pictogram placeholder
  const aidBox = new fabric.Rect({
    left: width * 0.75 - pictoBoxSize / 2,
    top: pictoTop + (pictoRowH - pictoBoxSize) / 2,
    width: pictoBoxSize, height: pictoBoxSize,
    fill: primary,
    strokeWidth: 0,
  });
  canvas.add(aidBox);

  const aidLabel = new fabric.IText('FIRST\nAID', {
    left: width * 0.75,
    top: pictoTop + pictoRowH / 2,
    fontSize: height * 0.014,
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeight: 'bold',
    fill: white,
    originX: 'center',
    originY: 'center',
    textAlign: 'center',
    editable: true,
  });
  canvas.add(aidLabel);

  // ── 4. Footer bar ──
  const footerTop = height - footerH;
  const footerBgRect = new fabric.Rect({
    left: 0, top: footerTop, width, height: footerH,
    fill: primary, strokeWidth: 0,
  });
  canvas.add(footerBgRect);

  const footerText = new fabric.IText(
    'IN CASE OF EMERGENCY CALL: 000 / 911 / 112',
    {
      left: width / 2,
      top: footerTop + footerH / 2,
      fontSize: height * 0.024,
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
  <rect y="0" width="120" height="24" fill="#008A3E"/>
  <text x="60" y="11" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">EMERGENCY</text>
  <text x="60" y="20" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">PROCEDURES</text>
  <!-- Step 1 -->
  <circle cx="18" cy="38" r="7" fill="#008A3E"/>
  <text x="18" y="41" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">1</text>
  <rect x="30" y="34" width="70" height="3" rx="1" fill="#ddd"/>
  <rect x="30" y="40" width="55" height="3" rx="1" fill="#eee"/>
  <!-- Step 2 -->
  <line x1="8" y1="55" x2="112" y2="55" stroke="#e0e0e0" stroke-width="0.5"/>
  <circle cx="18" cy="66" r="7" fill="#008A3E"/>
  <text x="18" y="69" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">2</text>
  <rect x="30" y="62" width="70" height="3" rx="1" fill="#ddd"/>
  <rect x="30" y="68" width="60" height="3" rx="1" fill="#eee"/>
  <!-- Step 3 -->
  <line x1="8" y1="83" x2="112" y2="83" stroke="#e0e0e0" stroke-width="0.5"/>
  <circle cx="18" cy="94" r="7" fill="#008A3E"/>
  <text x="18" y="97" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">3</text>
  <rect x="30" y="90" width="65" height="3" rx="1" fill="#ddd"/>
  <rect x="30" y="96" width="50" height="3" rx="1" fill="#eee"/>
  <!-- Step 4 -->
  <line x1="8" y1="111" x2="112" y2="111" stroke="#e0e0e0" stroke-width="0.5"/>
  <circle cx="18" cy="122" r="7" fill="#008A3E"/>
  <text x="18" y="125" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">4</text>
  <rect x="30" y="118" width="70" height="3" rx="1" fill="#ddd"/>
  <rect x="30" y="124" width="55" height="3" rx="1" fill="#eee"/>
  <!-- Pictogram row -->
  <rect y="137" width="120" height="14" fill="#f5f5f5"/>
  <rect x="22" y="139" width="10" height="10" fill="#008A3E"/>
  <text x="27" y="146" font-size="4" fill="#fff" text-anchor="middle">EXIT</text>
  <rect x="82" y="139" width="10" height="10" fill="#008A3E"/>
  <text x="87" y="146" font-size="3.5" fill="#fff" text-anchor="middle">AID</text>
  <!-- Footer -->
  <rect y="155" width="120" height="15" fill="#008A3E"/>
  <text x="60" y="165" font-size="3.5" fill="#fff" font-weight="bold" text-anchor="middle">IN CASE OF EMERGENCY CALL: 000 / 911 / 112</text>
</svg>`;

export const emergencyProceduresTemplate: TemplateDefinition = {
  id: 'emergency-procedures',
  name: 'Emergency Procedures',
  description: 'Green/white emergency poster with 4 numbered procedure steps, exit and first-aid pictograms, and emergency contact footer.',
  category: 'emergency',
  thumbnail,
  defaultSize: 'A2',
  defaultOrientation: 'portrait',
  apply: applyEmergencyProcedures,
};
