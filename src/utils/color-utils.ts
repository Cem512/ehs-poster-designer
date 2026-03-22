/** Parse hex color to RGB components */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/** Calculate relative luminance per WCAG 2.1 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate WCAG contrast ratio between two colors */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = 'excellent' | 'good' | 'poor' | 'fail';

/** Check contrast meets safety poster requirements */
export function checkContrast(foreground: string, background: string): {
  ratio: number;
  level: ContrastLevel;
} {
  const ratio = getContrastRatio(foreground, background);
  let level: ContrastLevel;
  if (ratio >= 7) level = 'excellent';
  else if (ratio >= 4.5) level = 'good';
  else if (ratio >= 3) level = 'poor';
  else level = 'fail';
  return { ratio, level };
}
