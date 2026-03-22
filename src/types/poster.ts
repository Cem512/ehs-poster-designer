export type Orientation = 'portrait' | 'landscape';

export interface PaperSize {
  label: string;
  width: number;  // mm
  height: number; // mm
}

export type PaperSizeKey = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'CUSTOM';

export interface SafetyTheme {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textColor: string;
  signalWord: string;
  darkGray?: string;
}

export type BorderType = 'hazard-stripe' | 'solid-industrial' | 'double-line' | 'rounded-safety' | 'color-banded';

export interface BorderConfig {
  type: BorderType;
  primaryColor: string;
  secondaryColor: string;
  thickness: number; // mm
}

export interface ZoneConfig {
  visible: boolean;
  heightPercent: number;
  backgroundColor: string;
  textColor: string;
}

export type PosterPurpose = 'ppe' | 'danger' | 'emergency' | 'fire' | 'chemical' | 'general';

export interface PosterDocument {
  id: string;
  name: string;

  // Page setup
  size: PaperSize;
  sizeKey: PaperSizeKey;
  orientation: Orientation;
  dpi: 150 | 300;

  // Theme
  theme: SafetyTheme;
  purpose: PosterPurpose;

  // Layout zones
  header: ZoneConfig;
  footer: ZoneConfig;
  border: BorderConfig;

  // Canvas state (Fabric.js serialization)
  canvasJSON: string;

  // Readability
  viewingDistance: number; // meters

  // Metadata
  createdAt: string;
  updatedAt: string;
}
