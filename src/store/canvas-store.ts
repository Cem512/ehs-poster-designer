import { create } from 'zustand';
import type { ActiveTool } from '../types/canvas';

interface CanvasStore {
  // Tool state
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;

  // Viewport
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // Grid & guides
  gridVisible: boolean;
  guidesVisible: boolean;
  snapEnabled: boolean;
  gridSizeMm: number;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleSnap: () => void;
  setGridSize: (mm: number) => void;

  // Selection
  selectedObjectIds: string[];
  setSelectedObjects: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  activeTool: 'select',
  setActiveTool: (activeTool) => set({ activeTool }),

  zoom: 1,
  panX: 0,
  panY: 0,
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),

  gridVisible: true,
  guidesVisible: true,
  snapEnabled: true,
  gridSizeMm: 10,
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleGuides: () => set((s) => ({ guidesVisible: !s.guidesVisible })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setGridSize: (gridSizeMm) => set({ gridSizeMm }),

  selectedObjectIds: [],
  setSelectedObjects: (selectedObjectIds) => set({ selectedObjectIds }),
  clearSelection: () => set({ selectedObjectIds: [] }),
}));
