import { create } from 'zustand';
import type { PosterDocument, PaperSizeKey, Orientation, SafetyTheme, BorderConfig, ZoneConfig, PosterPurpose } from '../types/poster';
import { PAPER_SIZES } from '../constants/paper-sizes';
import { SAFETY_THEMES } from '../constants/safety-colors';
import { getDefaultBorder } from '../constants/border-presets';

/** Human-readable labels for poster purposes */
const PURPOSE_LABELS: Record<PosterPurpose, string> = {
  ppe: 'PPE Required',
  danger: 'Danger Zone',
  emergency: 'Emergency Procedures',
  fire: 'Fire Safety',
  chemical: 'Chemical Hazard',
  general: 'General Safety',
};

function createDefaultDocument(): PosterDocument {
  const theme = SAFETY_THEMES[4]; // neutral industrial
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Poster',
    size: PAPER_SIZES.A2,
    sizeKey: 'A2',
    orientation: 'portrait',
    dpi: 300,
    theme,
    purpose: 'general',
    header: {
      visible: true,
      heightPercent: 18,
      backgroundColor: theme.primary,
      textColor: theme.accent,
    },
    footer: {
      visible: true,
      heightPercent: 10,
      backgroundColor: theme.darkGray ?? '#2D2D2D',
      textColor: '#FFFFFF',
    },
    border: getDefaultBorder(theme.primary, theme.secondary),
    canvasJSON: '',
    viewingDistance: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface PosterStore {
  document: PosterDocument;
  isSetupComplete: boolean;

  // Setup actions
  completeSetup: (config: {
    purpose: PosterPurpose;
    sizeKey: PaperSizeKey;
    customSize?: { width: number; height: number };
    orientation: Orientation;
    theme: SafetyTheme;
    viewingDistance: number;
  }) => void;

  // Document actions
  setName: (name: string) => void;
  setSize: (sizeKey: PaperSizeKey) => void;
  setOrientation: (orientation: Orientation) => void;
  setTheme: (theme: SafetyTheme) => void;
  setBorder: (border: BorderConfig) => void;
  setHeader: (header: ZoneConfig) => void;
  setFooter: (footer: ZoneConfig) => void;
  setViewingDistance: (distance: number) => void;
  setCanvasJSON: (json: string) => void;
  resetDocument: () => void;
  restoreDocument: (doc: PosterDocument) => void;
}

export const usePosterStore = create<PosterStore>((set) => ({
  document: createDefaultDocument(),
  isSetupComplete: false,

  completeSetup: (config) => set((state) => {
    const size = config.sizeKey === 'CUSTOM' && config.customSize
      ? { label: `Custom (${config.customSize.width} × ${config.customSize.height} mm)`, ...config.customSize }
      : PAPER_SIZES[config.sizeKey as keyof typeof PAPER_SIZES];

    const purposeLabel = PURPOSE_LABELS[config.purpose] || 'Safety Poster';
    const name = `${purposeLabel} — ${config.sizeKey} ${config.orientation}`;

    return {
      isSetupComplete: true,
      document: {
        ...state.document,
        name,
        purpose: config.purpose,
        size,
        sizeKey: config.sizeKey,
        orientation: config.orientation,
        theme: config.theme,
        viewingDistance: config.viewingDistance,
        header: {
          visible: true,
          heightPercent: 18,
          backgroundColor: config.theme.primary,
          textColor: config.theme.accent,
        },
        footer: {
          visible: true,
          heightPercent: 10,
          backgroundColor: '#2D2D2D',
          textColor: '#FFFFFF',
        },
        border: getDefaultBorder(config.theme.primary, config.theme.secondary),
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  setName: (name) => set((state) => ({
    document: { ...state.document, name, updatedAt: new Date().toISOString() },
  })),

  setSize: (sizeKey) => set((state) => ({
    document: {
      ...state.document,
      sizeKey,
      size: PAPER_SIZES[sizeKey as keyof typeof PAPER_SIZES] ?? state.document.size,
      updatedAt: new Date().toISOString(),
    },
  })),

  setOrientation: (orientation) => set((state) => ({
    document: { ...state.document, orientation, updatedAt: new Date().toISOString() },
  })),

  setTheme: (theme) => set((state) => ({
    document: {
      ...state.document,
      theme,
      header: { ...state.document.header, backgroundColor: theme.primary, textColor: theme.accent },
      border: { ...state.document.border, primaryColor: theme.primary, secondaryColor: theme.secondary },
      updatedAt: new Date().toISOString(),
    },
  })),

  setBorder: (border) => set((state) => ({
    document: { ...state.document, border, updatedAt: new Date().toISOString() },
  })),

  setHeader: (header) => set((state) => ({
    document: { ...state.document, header, updatedAt: new Date().toISOString() },
  })),

  setFooter: (footer) => set((state) => ({
    document: { ...state.document, footer, updatedAt: new Date().toISOString() },
  })),

  setViewingDistance: (viewingDistance) => set((state) => ({
    document: { ...state.document, viewingDistance, updatedAt: new Date().toISOString() },
  })),

  setCanvasJSON: (canvasJSON) => set((state) => ({
    document: { ...state.document, canvasJSON, updatedAt: new Date().toISOString() },
  })),

  resetDocument: () => set({
    document: createDefaultDocument(),
    isSetupComplete: false,
  }),

  restoreDocument: (doc) => set({
    document: doc,
    isSetupComplete: true,
  }),
}));
