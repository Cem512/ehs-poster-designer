import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { getExportMultiplier } from '../../constants/paper-sizes';
import type { PosterDocument } from '../../types/poster';

export type ExportFormat = 'pdf' | 'png' | 'svg' | 'json';
export type ExportDPI = 150 | 300;

export interface ExportOptions {
  format: ExportFormat;
  dpi: ExportDPI;
  bleed: boolean;       // 3mm bleed
  cropMarks: boolean;
  filename: string;
}

/**
 * Get poster dimensions in mm (respecting orientation)
 */
function getPosterMm(doc: PosterDocument): { widthMm: number; heightMm: number } {
  const widthMm = doc.orientation === 'landscape' ? doc.size.height : doc.size.width;
  const heightMm = doc.orientation === 'landscape' ? doc.size.width : doc.size.height;
  return { widthMm, heightMm };
}

/**
 * Export canvas as PNG at target DPI
 */
export async function exportAsPNG(
  canvas: fabric.Canvas,
  _doc: PosterDocument,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(10);

  const multiplier = getExportMultiplier(options.dpi);

  // Reset viewport to 1:1 before export
  const origVpt = [...canvas.viewportTransform!];
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  canvas.setZoom(1);

  onProgress?.(30);

  try {
    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier,
      quality: 1,
    });

    onProgress?.(80);

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    saveAs(blob, `${options.filename}.png`);
    onProgress?.(100);
  } finally {
    // Restore viewport
    canvas.viewportTransform = origVpt as any;
    canvas.requestRenderAll();
  }
}

/**
 * Export canvas as SVG
 */
export async function exportAsSVG(
  canvas: fabric.Canvas,
  doc: PosterDocument,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(20);

  const { widthMm, heightMm } = getPosterMm(doc);
  const svgString = canvas.toSVG({
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
    viewBox: {
      x: 0,
      y: 0,
      width: canvas.width!,
      height: canvas.height!,
    },
  });

  onProgress?.(70);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, `${options.filename}.svg`);

  onProgress?.(100);
}

/**
 * Export canvas as PDF (raster approach — reliable WYSIWYG)
 */
export async function exportAsPDF(
  canvas: fabric.Canvas,
  doc: PosterDocument,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(5);

  const { widthMm, heightMm } = getPosterMm(doc);
  const bleedMm = options.bleed ? 3 : 0;
  const cropMarkLen = 5; // mm

  const totalWidthMm = widthMm + bleedMm * 2;
  const totalHeightMm = heightMm + bleedMm * 2;

  // Create PDF with correct dimensions
  const orientation = totalWidthMm > totalHeightMm ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [totalWidthMm, totalHeightMm],
    compress: true,
  });

  onProgress?.(10);

  // Render canvas to image at target DPI
  const multiplier = getExportMultiplier(options.dpi);

  // Reset viewport
  const origVpt = [...canvas.viewportTransform!];
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  canvas.setZoom(1);

  try {
    onProgress?.(20);

    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier,
      quality: 1,
    });

    onProgress?.(60);

    // Add the image to PDF
    pdf.addImage(
      dataUrl,
      'PNG',
      bleedMm,  // x offset for bleed
      bleedMm,  // y offset for bleed
      widthMm,
      heightMm,
      undefined,
      'FAST'
    );

    onProgress?.(80);

    // Add crop marks if requested
    if (options.cropMarks && options.bleed) {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.25);

      // Top-left
      pdf.line(bleedMm, 0, bleedMm, cropMarkLen);
      pdf.line(0, bleedMm, cropMarkLen, bleedMm);

      // Top-right
      pdf.line(bleedMm + widthMm, 0, bleedMm + widthMm, cropMarkLen);
      pdf.line(totalWidthMm, bleedMm, totalWidthMm - cropMarkLen, bleedMm);

      // Bottom-left
      pdf.line(bleedMm, totalHeightMm, bleedMm, totalHeightMm - cropMarkLen);
      pdf.line(0, bleedMm + heightMm, cropMarkLen, bleedMm + heightMm);

      // Bottom-right
      pdf.line(bleedMm + widthMm, totalHeightMm, bleedMm + widthMm, totalHeightMm - cropMarkLen);
      pdf.line(totalWidthMm, bleedMm + heightMm, totalWidthMm - cropMarkLen, bleedMm + heightMm);
    }

    onProgress?.(90);

    pdf.save(`${options.filename}.pdf`);
    onProgress?.(100);
  } finally {
    // Restore viewport
    canvas.viewportTransform = origVpt as any;
    canvas.requestRenderAll();
  }
}

/**
 * Export canvas state as JSON (for save/load)
 */
export async function exportAsJSON(
  canvas: fabric.Canvas,
  doc: PosterDocument,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(20);

  const saveData = {
    version: '1.0',
    appName: 'EHS Poster Designer',
    savedAt: new Date().toISOString(),
    document: {
      name: doc.name,
      sizeKey: doc.sizeKey,
      orientation: doc.orientation,
      purpose: doc.purpose,
      viewingDistance: doc.viewingDistance,
      theme: doc.theme,
      border: doc.border,
      header: doc.header,
      footer: doc.footer,
    },
    canvas: canvas.toJSON(),
  };

  onProgress?.(70);

  const jsonStr = JSON.stringify(saveData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${options.filename}.json`);

  onProgress?.(100);
}

/**
 * Load poster from JSON file
 */
export async function loadFromJSON(
  canvas: fabric.Canvas,
  file: File
): Promise<{
  name: string;
  sizeKey: string;
  orientation: string;
  purpose: string;
  viewingDistance: number;
  theme: any;
  border: any;
  header: any;
  footer: any;
} | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.appName !== 'EHS Poster Designer') {
          throw new Error('Invalid file format');
        }

        await canvas.loadFromJSON(data.canvas);
        canvas.requestRenderAll();

        resolve(data.document);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Main export function that dispatches to the right exporter
 */
export async function exportPoster(
  canvas: fabric.Canvas,
  doc: PosterDocument,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> {
  switch (options.format) {
    case 'png':
      return exportAsPNG(canvas, doc, options, onProgress);
    case 'svg':
      return exportAsSVG(canvas, doc, options, onProgress);
    case 'pdf':
      return exportAsPDF(canvas, doc, options, onProgress);
    case 'json':
      return exportAsJSON(canvas, doc, options, onProgress);
  }
}
