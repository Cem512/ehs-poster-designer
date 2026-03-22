import type { PaperSize, PaperSizeKey } from '../types/poster';

export const PAPER_SIZES: Record<Exclude<PaperSizeKey, 'CUSTOM'>, PaperSize> = {
  A0: { label: 'A0 (841 × 1189 mm)', width: 841, height: 1189 },
  A1: { label: 'A1 (594 × 841 mm)', width: 594, height: 841 },
  A2: { label: 'A2 (420 × 594 mm)', width: 420, height: 594 },
  A3: { label: 'A3 (297 × 420 mm)', width: 297, height: 420 },
  A4: { label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
};

/** Convert mm to pixels at a given DPI (working at 72 PPI internally) */
export const WORKING_PPI = 72;

export function mmToPx(mm: number, ppi: number = WORKING_PPI): number {
  return (mm / 25.4) * ppi;
}

export function pxToMm(px: number, ppi: number = WORKING_PPI): number {
  return (px / ppi) * 25.4;
}

/** Get poster dimensions in pixels at working PPI */
export function getPosterDimensionsPx(
  size: PaperSize,
  orientation: 'portrait' | 'landscape',
  ppi: number = WORKING_PPI
): { width: number; height: number } {
  const w = orientation === 'landscape' ? size.height : size.width;
  const h = orientation === 'landscape' ? size.width : size.height;
  return {
    width: Math.round(mmToPx(w, ppi)),
    height: Math.round(mmToPx(h, ppi)),
  };
}

/** Get export multiplier for target DPI */
export function getExportMultiplier(targetDpi: number): number {
  return targetDpi / WORKING_PPI;
}
