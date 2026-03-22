import { useEffect, useState, useCallback, useRef } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import * as fabric from 'fabric';
import { usePosterStore } from '../../store/poster-store';
import Toolbar from './Toolbar';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import StatusBar from './StatusBar';
import CanvasWorkspace from '../../canvas/CanvasWorkspace';
import PosterSetupDialog from '../../features/poster-setup/PosterSetupDialog';
import ExportDialog from '../../features/export/ExportDialog';
import OnboardingOverlay from './OnboardingOverlay';
import { useUIStore, MOBILE_BREAKPOINT } from '../../store/ui-store';
import { useCanvasStore } from '../../store/canvas-store';
import { useHistoryStore } from '../../store/history-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { renderBorder } from '../../features/borders/border-factory';
import { renderZones } from '../../features/frames/zone-renderer';
import ToastContainer from '../ui/Toast';

/** Check localStorage for an auto-saved session */
function getAutoSave(): { document: any; canvas: any; savedAt: string } | null {
  try {
    const raw = localStorage.getItem('ehs-poster-autosave');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.document && data.canvas && data.savedAt) return data;
  } catch { /* corrupted */ }
  return null;
}

export default function AppShell() {
  const { isSetupComplete, restoreDocument } = usePosterStore();
  const { leftPanelOpen, rightPanelOpen, isMobile, setExportDialogOpen, setIsMobile, closeAllPanels } = useUIStore();
  const [deleteConfirm, setDeleteConfirm] = useState<{ count: number } | null>(null);
  const [recoveryOffer, setRecoveryOffer] = useState<{ savedAt: string } | null>(null);
  const recoveryDataRef = useRef<{ document: any; canvas: any } | null>(null);
  const clipboardRef = useRef<string | null>(null);

  // On mount, check for auto-saved session
  useEffect(() => {
    if (isSetupComplete) return; // Already in editor
    const saved = getAutoSave();
    if (saved) {
      recoveryDataRef.current = { document: saved.document, canvas: saved.canvas };
      setRecoveryOffer({ savedAt: saved.savedAt });
    }
  }, []); // only on mount

  const handleRestore = useCallback(() => {
    const data = recoveryDataRef.current;
    if (!data) return;
    // Restore the poster document into the store
    restoreDocument(data.document);
    // Schedule canvas restore for after the editor mounts
    const waitForCanvas = setInterval(() => {
      const canvas = getFabricCanvas();
      if (canvas) {
        clearInterval(waitForCanvas);
        canvas.loadFromJSON(data.canvas).then(() => {
          const doc = usePosterStore.getState().document;
          renderBorder(canvas, doc);
          renderZones(canvas, doc);
          canvas.requestRenderAll();
        });
        useUIStore.getState().setLastSavedAt(new Date(recoveryOffer?.savedAt || Date.now()));
        useUIStore.getState().setHasUnsavedChanges(false);
      }
    }, 100);
    // Safety timeout — stop trying after 5s
    setTimeout(() => clearInterval(waitForCanvas), 5000);
    setRecoveryOffer(null);
    recoveryDataRef.current = null;
  }, [restoreDocument, recoveryOffer]);

  const handleDiscardRecovery = useCallback(() => {
    setRecoveryOffer(null);
    recoveryDataRef.current = null;
    localStorage.removeItem('ehs-poster-autosave');
  }, []);

  /** Actually perform the delete of all selected objects (skip border/zone objects) */
  const performDelete = useCallback(() => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length > 0) {
      active.forEach((obj) => {
        if (!(obj as any)._customId) canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      useHistoryStore.getState().pushState(JSON.stringify(canvas.toJSON()));
    }
    setDeleteConfirm(null);
  }, []);

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (mobile !== useUIStore.getState().isMobile) {
        setIsMobile(mobile);
      }
    };

    window.addEventListener('resize', handleResize);
    // Run once on mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Also skip if editing text on canvas (Fabric IText)
      const canvas = getFabricCanvas();
      if (canvas) {
        const active = canvas.getActiveObject();
        if (active && 'isEditing' in active && (active as any).isEditing) {
          return;
        }
      }

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+E — Export
      if (ctrl && e.key === 'e') {
        e.preventDefault();
        setExportDialogOpen(true);
      }

      // Ctrl+Z — Undo
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const json = useHistoryStore.getState().undo();
        const canvas = getFabricCanvas();
        if (json && canvas) {
          const doc = usePosterStore.getState().document;
          canvas.loadFromJSON(json).then(() => {
            renderBorder(canvas, doc);
            renderZones(canvas, doc);
            canvas.requestRenderAll();
          });
        }
      }

      // Ctrl+Shift+Z or Ctrl+Y — Redo
      if ((ctrl && e.shiftKey && e.key === 'z') || (ctrl && e.key === 'y')) {
        e.preventDefault();
        const json = useHistoryStore.getState().redo();
        const canvas = getFabricCanvas();
        if (json && canvas) {
          const doc = usePosterStore.getState().document;
          canvas.loadFromJSON(json).then(() => {
            renderBorder(canvas, doc);
            renderZones(canvas, doc);
            canvas.requestRenderAll();
          });
        }
      }

      // Delete / Backspace — Delete selected objects (skip border/zone objects)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = getFabricCanvas();
        if (!canvas) return;
        const active = canvas.getActiveObjects().filter((obj) => !(obj as any)._customId);
        if (active.length > 0) {
          e.preventDefault();
          if (active.length >= 3) {
            // Multiple objects — ask for confirmation
            setDeleteConfirm({ count: active.length });
          } else {
            // 1-2 objects — delete immediately (undo available)
            active.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            useHistoryStore.getState().pushState(JSON.stringify(canvas.toJSON()));
          }
        }
      }

      // Escape — Deselect / close panels on mobile
      if (e.key === 'Escape') {
        const canvas = getFabricCanvas();
        if (canvas) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
        setExportDialogOpen(false);
        if (isMobile) closeAllPanels();
      }

      // Ctrl+C — Copy selected objects
      if (ctrl && e.key === 'c') {
        const canvas = getFabricCanvas();
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && !(active as any)._customId) {
          e.preventDefault();
          active.clone().then((cloned: any) => {
            clipboardRef.current = JSON.stringify(cloned.toJSON());
          });
        }
      }

      // Ctrl+V — Paste
      if (ctrl && e.key === 'v') {
        if (clipboardRef.current) {
          e.preventDefault();
          const canvas = getFabricCanvas();
          if (!canvas) return;
          fabric.util.enlivenObjects([JSON.parse(clipboardRef.current)]).then((objects: any[]) => {
            if (objects.length > 0) {
              const obj = objects[0];
              obj.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
              canvas.add(obj);
              canvas.setActiveObject(obj);
              canvas.requestRenderAll();
              useHistoryStore.getState().pushState(JSON.stringify(canvas.toJSON()));
            }
          });
          return; // Don't fall through to V = select tool
        }
      }

      // Ctrl+D — Duplicate selected object
      if (ctrl && e.key === 'd') {
        const canvas = getFabricCanvas();
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && !(active as any)._customId) {
          e.preventDefault();
          active.clone().then((cloned: any) => {
            cloned.set({ left: (active.left || 0) + 20, top: (active.top || 0) + 20 });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            useHistoryStore.getState().pushState(JSON.stringify(canvas.toJSON()));
          });
        }
      }

      // V — Select tool
      if (!ctrl && e.key === 'v') {
        useCanvasStore.getState().setActiveTool('select');
      }
      // H — Pan tool
      if (!ctrl && e.key === 'h') {
        useCanvasStore.getState().setActiveTool('pan');
      }
      // T — Text tool
      if (!ctrl && e.key === 't') {
        useCanvasStore.getState().setActiveTool('text');
      }
      // G — Toggle grid
      if (!ctrl && e.key === 'g') {
        useCanvasStore.getState().toggleGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setExportDialogOpen, isMobile, closeAllPanels]);

  // Track unsaved changes & auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (!isSetupComplete) return;

    // Mark dirty on any canvas modification
    const markDirty = () => {
      useUIStore.getState().setHasUnsavedChanges(true);
    };

    const canvas = getFabricCanvas();
    if (canvas) {
      canvas.on('object:added', markDirty);
      canvas.on('object:removed', markDirty);
      canvas.on('object:modified', markDirty);
    }

    const interval = setInterval(() => {
      const canvas = getFabricCanvas();
      if (!canvas) return;
      try {
        const state = {
          document: usePosterStore.getState().document,
          canvas: canvas.toJSON(),
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('ehs-poster-autosave', JSON.stringify(state));
        useUIStore.getState().setLastSavedAt(new Date());
        useUIStore.getState().setHasUnsavedChanges(false);
      } catch (e) {
        // localStorage might be full
        console.warn('Auto-save failed:', e);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (canvas) {
        canvas.off('object:added', markDirty);
        canvas.off('object:removed', markDirty);
        canvas.off('object:modified', markDirty);
      }
    };
  }, [isSetupComplete]);

  // Warn before closing tab with unsaved changes
  useEffect(() => {
    if (!isSetupComplete) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useUIStore.getState().hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers show a generic message regardless of returnValue
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSetupComplete]);

  if (!isSetupComplete) {
    return (
      <>
        <PosterSetupDialog />
        {/* Auto-save recovery dialog */}
        {recoveryOffer && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          >
            <div
              className="rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#003DA520' }}
                >
                  <RotateCcw size={18} style={{ color: '#003DA5' }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Restore Previous Session?</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    We found an auto-saved poster from{' '}
                    <strong>{new Date(recoveryOffer.savedAt).toLocaleString()}</strong>.
                    Would you like to restore it?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={handleDiscardRecovery}
                  className="px-4 py-2 rounded text-sm transition-colors"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Start Fresh
                </button>
                <button
                  onClick={handleRestore}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#003DA5', color: '#fff' }}
                >
                  Restore Session
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: panels in normal flex flow (left → canvas → right) */}
        {!isMobile && leftPanelOpen && <LeftPanel />}
        <CanvasWorkspace />
        {!isMobile && rightPanelOpen && <RightPanel />}

        {/* Mobile overlay backdrop */}
        {isMobile && (leftPanelOpen || rightPanelOpen) && (
          <div
            className="absolute inset-0 z-30"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={closeAllPanels}
          />
        )}

        {/* Mobile: overlay left panel */}
        {isMobile && leftPanelOpen && (
          <div className="absolute left-0 top-0 bottom-0 z-40 shadow-2xl animate-slide-in-left">
            <LeftPanel />
          </div>
        )}

        {/* Mobile: overlay right panel */}
        {isMobile && rightPanelOpen && (
          <div className="absolute right-0 top-0 bottom-0 z-40 shadow-2xl animate-slide-in-right">
            <RightPanel />
          </div>
        )}
      </div>
      <StatusBar />
      <ExportDialog />
      <OnboardingOverlay />
      <ToastContainer />

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div
            className="rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#C8102E20' }}
              >
                <AlertTriangle size={18} style={{ color: '#C8102E' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Delete {deleteConfirm.count} Objects?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  You're about to delete {deleteConfirm.count} selected objects. You can undo this action with <strong>Ctrl+Z</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: '#C8102E', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
