import type { PaperSizeKey, Orientation, SafetyTheme, BorderConfig } from './poster';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'life-saving-rules' | 'danger' | 'ppe' | 'emergency' | 'chemical' | 'general';
  thumbnail: string; // SVG string for preview
  defaultSize: PaperSizeKey;
  defaultOrientation: Orientation;

  /** Function that builds all Fabric.js objects on the canvas */
  apply: (ctx: TemplateApplyContext) => void;
}

export interface TemplateApplyContext {
  canvas: import('fabric').Canvas;
  width: number;   // poster width in px
  height: number;  // poster height in px
  theme: SafetyTheme;
  border: BorderConfig;
  mmToPx: (mm: number) => number;
}
