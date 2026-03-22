import { create } from 'zustand';

export type LeftPanelTab = 'pictograms' | 'templates' | 'borders' | 'elements' | 'brand-kit';

/** Breakpoint: screens narrower than this use mobile/overlay layout */
export const MOBILE_BREAKPOINT = 1024;

interface UIStore {
  // Panels
  leftPanelTab: LeftPanelTab;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  isMobile: boolean;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  closeAllPanels: () => void;

  // Overlays
  readabilityOverlayVisible: boolean;
  contrastOverlayVisible: boolean;
  toggleReadabilityOverlay: () => void;
  toggleContrastOverlay: () => void;

  // Dialogs
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;

  // Save state
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  setHasUnsavedChanges: (dirty: boolean) => void;
  setLastSavedAt: (date: Date) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  leftPanelTab: 'pictograms',
  isMobile: typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  leftPanelOpen: typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : true,
  rightPanelOpen: typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : true,
  setLeftPanelTab: (leftPanelTab) => set((s) => ({
    leftPanelTab,
    leftPanelOpen: true,
    // On mobile, close right panel when opening left
    rightPanelOpen: s.isMobile ? false : s.rightPanelOpen,
  })),
  toggleLeftPanel: () => set((s) => ({
    leftPanelOpen: !s.leftPanelOpen,
    // On mobile, close right panel when opening left
    rightPanelOpen: s.isMobile && !s.leftPanelOpen ? false : s.rightPanelOpen,
  })),
  toggleRightPanel: () => set((s) => ({
    rightPanelOpen: !s.rightPanelOpen,
    // On mobile, close left panel when opening right
    leftPanelOpen: s.isMobile && !s.rightPanelOpen ? false : s.leftPanelOpen,
  })),
  setLeftPanelOpen: (leftPanelOpen) => set({ leftPanelOpen }),
  setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
  setIsMobile: (isMobile) => set((_s) => ({
    isMobile,
    // Auto-close panels when switching to mobile, re-open when going back to desktop
    leftPanelOpen: isMobile ? false : true,
    rightPanelOpen: isMobile ? false : true,
  })),
  closeAllPanels: () => set({ leftPanelOpen: false, rightPanelOpen: false }),

  readabilityOverlayVisible: false,
  contrastOverlayVisible: false,
  toggleReadabilityOverlay: () => set((s) => ({ readabilityOverlayVisible: !s.readabilityOverlayVisible })),
  toggleContrastOverlay: () => set((s) => ({ contrastOverlayVisible: !s.contrastOverlayVisible })),

  exportDialogOpen: false,
  setExportDialogOpen: (exportDialogOpen) => set({ exportDialogOpen }),

  hasUnsavedChanges: false,
  lastSavedAt: null,
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
}));
