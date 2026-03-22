import { WORKING_PPI } from '../constants/paper-sizes';

/** Convert mm to canvas pixels at working PPI */
export function mmToCanvasPx(mm: number): number {
  return (mm / 25.4) * WORKING_PPI;
}

/** Convert canvas pixels to mm at working PPI */
export function canvasPxToMm(px: number): number {
  return (px / WORKING_PPI) * 25.4;
}

/** Convert point size to mm */
export function ptToMm(pt: number): number {
  return (pt / 72) * 25.4;
}

/** Convert mm to point size */
export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

/** Format mm value for display */
export function formatMm(mm: number, decimals: number = 1): string {
  return `${mm.toFixed(decimals)} mm`;
}
