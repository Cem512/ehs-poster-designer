export type ActiveTool = 'select' | 'text' | 'pictogram' | 'shape' | 'pan';

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface SnapConfig {
  enabled: boolean;
  gridSize: number; // mm
  showGrid: boolean;
  showGuides: boolean;
}

export interface CanvasObjectMeta {
  id: string;
  type: 'text' | 'pictogram' | 'shape' | 'image' | 'border' | 'zone';
  locked: boolean;
  layer: 'background' | 'content' | 'overlay';
}
