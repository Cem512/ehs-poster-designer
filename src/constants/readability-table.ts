/**
 * Readability calculation based on viewing distance.
 * Rule: cap height (mm) ≈ viewing distance (mm) / 150
 * Cap height ≈ 70% of font size for most sans-serif fonts.
 */

/** Minimum cap height in mm for a given viewing distance in meters */
export function getMinCapHeightMm(viewingDistanceM: number): number {
  return (viewingDistanceM * 1000) / 150;
}

/** Convert font size (pt) to cap height (mm) at given DPI */
export function fontSizeToCapHeightMm(fontSizePt: number, _dpi: number = 72): number {
  // 1 pt = 1/72 inch
  const fontSizeMm = (fontSizePt / 72) * 25.4;
  // Cap height ≈ 70% of font size for sans-serif
  return fontSizeMm * 0.7;
}

/** Get minimum font size (pt) for a viewing distance (m) */
export function getMinFontSizePt(viewingDistanceM: number): number {
  const minCapHeight = getMinCapHeightMm(viewingDistanceM);
  // Reverse: capHeight = fontSize * (25.4/72) * 0.7
  // fontSize = capHeight / (25.4/72 * 0.7)
  return minCapHeight / ((25.4 / 72) * 0.7);
}

export type ReadabilityLevel = 'pass' | 'warn' | 'fail';

/** Check readability of a font size at a viewing distance */
export function checkReadability(
  fontSizePt: number,
  viewingDistanceM: number
): { level: ReadabilityLevel; actualCapMm: number; requiredCapMm: number } {
  const actualCapMm = fontSizeToCapHeightMm(fontSizePt);
  const requiredCapMm = getMinCapHeightMm(viewingDistanceM);
  const ratio = actualCapMm / requiredCapMm;

  let level: ReadabilityLevel;
  if (ratio >= 1.0) {
    level = 'pass';
  } else if (ratio >= 0.8) {
    level = 'warn';
  } else {
    level = 'fail';
  }

  return { level, actualCapMm, requiredCapMm };
}

/** Common viewing distances for quick selection */
export const COMMON_DISTANCES = [
  { label: '1m (close reading)', value: 1 },
  { label: '2m (room notice)', value: 2 },
  { label: '5m (corridor)', value: 5 },
  { label: '10m (warehouse)', value: 10 },
  { label: '15m (large facility)', value: 15 },
  { label: '20m (outdoor)', value: 20 },
];
