import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MousePointer2, Type, Hand, Square, Undo2, Redo2, ZoomIn, ZoomOut,
  Grid3x3, Ruler, Download, Eye, Contrast, PanelLeftOpen, PanelRightOpen,
  ImagePlus, Magnet, Settings, FilePlus2, X
} from 'lucide-react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../store/canvas-store';
import { useHistoryStore } from '../../store/history-store';
import { useUIStore } from '../../store/ui-store';
import { usePosterStore } from '../../store/poster-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { getPosterDimensionsPx } from '../../constants/paper-sizes';
import { SAFETY_THEMES } from '../../constants/safety-colors';
import { renderBorder } from '../../features/borders/border-factory';
import { renderZones } from '../../features/frames/zone-renderer';
import { getMinFontSizePt } from '../../constants/readability-table';
import type { ActiveTool } from '../../types/canvas';
import type { SafetyTheme, Orientation } from '../../types/poster';

export default function Toolbar() {
  const { t } = useTranslation();
  const { activeTool, setActiveTool, zoom, setZoom, gridVisible, toggleGrid, snapEnabled, toggleSnap, guidesVisible, toggleGuides } = useCanvasStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const { toggleLeftPanel, toggleRightPanel, readabilityOverlayVisible, toggleReadabilityOverlay, contrastOverlayVisible, toggleContrastOverlay, setExportDialogOpen, isMobile } = useUIStore();
  const { document: posterDoc, resetDocument, setTheme, setViewingDistance, setOrientation } = usePosterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = getFabricCanvas();
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const imgEl = new Image();
      imgEl.onload = () => {
        const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
        const img = new fabric.FabricImage(imgEl, {
          left: dims.width / 2,
          top: dims.height / 2,
          originX: 'center',
          originY: 'center',
        });

        // Scale image to fit within 60% of poster width
        const maxWidth = dims.width * 0.6;
        const maxHeight = dims.height * 0.4;
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1);
        img.scaleX = scale;
        img.scaleY = scale;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      };
      imgEl.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleUndo = () => {
    const json = undo();
    const canvas = getFabricCanvas();
    if (json && canvas) {
      canvas.loadFromJSON(json).then(() => canvas.requestRenderAll());
    }
  };

  const handleRedo = () => {
    const json = redo();
    const canvas = getFabricCanvas();
    if (json && canvas) {
      canvas.loadFromJSON(json).then(() => canvas.requestRenderAll());
    }
  };

  const handleZoomIn = () => {
    const canvas = getFabricCanvas();
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    if (canvas) canvas.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const canvas = getFabricCanvas();
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    if (canvas) canvas.setZoom(newZoom);
  };

  /** Apply a new theme and re-render the border to match */
  const handleThemeChange = (theme: SafetyTheme) => {
    setTheme(theme);
    const canvas = getFabricCanvas();
    if (canvas) {
      const updatedDoc = usePosterStore.getState().document;
      renderBorder(canvas, updatedDoc);
      renderZones(canvas, updatedDoc);
      canvas.requestRenderAll();
    }
  };

  /** Switch orientation — resize canvas and re-render border/zones */
  const handleOrientationChange = (o: Orientation) => {
    if (o === posterDoc.orientation) return;
    setOrientation(o);
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const updatedDoc = usePosterStore.getState().document;
    const dims = getPosterDimensionsPx(updatedDoc.size, updatedDoc.orientation);

    // Resize the canvas to the new dimensions
    canvas.setDimensions({ width: dims.width, height: dims.height });

    // Re-fit zoom to the container
    const container = canvas.getElement().parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      const scaleX = (rect.width - 80) / dims.width;
      const scaleY = (rect.height - 80) / dims.height;
      const fitZoom = Math.min(scaleX, scaleY, 1);
      canvas.setZoom(fitZoom);
      setZoom(fitZoom);

      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] = (rect.width - dims.width * fitZoom) / 2;
        vpt[5] = (rect.height - dims.height * fitZoom) / 2;
      }
    }

    // Re-render border and zones for new orientation
    renderBorder(canvas, updatedDoc);
    renderZones(canvas, updatedDoc);
    canvas.requestRenderAll();
  };

  const tools: { tool: ActiveTool; icon: typeof MousePointer2; labelKey: string; shortcut?: string }[] = [
    { tool: 'select', icon: MousePointer2, labelKey: 'toolbar.select', shortcut: 'V' },
    { tool: 'pan', icon: Hand, labelKey: 'toolbar.pan', shortcut: 'H' },
    { tool: 'text', icon: Type, labelKey: 'toolbar.text', shortcut: 'T' },
    { tool: 'shape', icon: Square, labelKey: 'toolbar.shape' },
  ];

  return (
    <div
      className="h-12 lg:h-14 flex items-center gap-1 lg:gap-1.5 px-2 md:px-3 lg:px-4 border-b shrink-0"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Left panel toggle */}
      <ToolbarButton icon={PanelLeftOpen} label={t('toolbar.toggleLeftPanel')} onClick={toggleLeftPanel} />

      <Divider />

      {/* Tools */}
      {tools.map(({ tool, icon, labelKey, shortcut }) => {
        const label = t(labelKey);
        return (
          <ToolbarButton
            key={tool}
            icon={icon}
            label={shortcut ? `${label} (${shortcut})` : label}
            active={activeTool === tool}
            onClick={() => setActiveTool(tool)}
          />
        );
      })}

      {/* Image upload */}
      <ToolbarButton icon={ImagePlus} label={t('toolbar.addImage')} onClick={handleImageUpload} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton icon={Undo2} label={t('toolbar.undoShortcut')} onClick={handleUndo} disabled={!canUndo} />
      <ToolbarButton icon={Redo2} label={t('toolbar.redoShortcut')} onClick={handleRedo} disabled={!canRedo} />

      {/* Hide zoom/view-options section on very small screens to avoid overflow */}
      {!isMobile && (
        <>
          <Divider />

          {/* Zoom */}
          <ToolbarButton icon={ZoomOut} label={t('toolbar.zoomOut')} onClick={handleZoomOut} />
          <span className="text-xs px-2 min-w-[50px] text-center" style={{ color: 'var(--color-text-muted)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarButton icon={ZoomIn} label={t('toolbar.zoomIn')} onClick={handleZoomIn} />

          <Divider />

          {/* View options */}
          <ToolbarButton icon={Grid3x3} label={t('toolbar.toggleGrid')} active={gridVisible} onClick={toggleGrid} />
          <ToolbarButton icon={Ruler} label={t('toolbar.toggleSnap')} active={snapEnabled} onClick={toggleSnap} />
          <ToolbarButton icon={Magnet} label={t('toolbar.guides')} active={guidesVisible} onClick={toggleGuides} />
          <ToolbarButton icon={Eye} label={t('toolbar.readability')} active={readabilityOverlayVisible} onClick={toggleReadabilityOverlay} />
          <ToolbarButton icon={Contrast} label={t('toolbar.contrast')} active={contrastOverlayVisible} onClick={toggleContrastOverlay} />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Poster settings menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title={t('toolbar.posterSettings')}
        >
          <Settings size={14} />
          {!isMobile && (
            <span>
              {posterDoc.sizeKey} {t(`toolbar.${posterDoc.orientation}`).toLowerCase()} — {posterDoc.viewingDistance}m
            </span>
          )}
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg shadow-xl py-1 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Current poster info */}
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  {t('toolbar.currentPoster')}
                </p>
                <p className="text-xs">
                  {posterDoc.sizeKey} ({posterDoc.size.width}×{posterDoc.size.height} mm) • {t(`toolbar.${posterDoc.orientation}`)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {t(`wizard.theme.themes.${posterDoc.theme.id}`)} • {posterDoc.viewingDistance}m {t('status.viewing').toLowerCase()}
                </p>
              </div>

              <MenuButton
                icon={Settings}
                label={t('toolbar.settingsMenu')}
                subtitle={t('toolbar.settingsSubtitle')}
                onClick={() => {
                  setMenuOpen(false);
                  setSettingsOpen(true);
                }}
              />
              <div className="mx-2 border-t" style={{ borderColor: 'var(--color-border)' }} />
              <MenuButton
                icon={FilePlus2}
                label={t('toolbar.newPosterMenu')}
                subtitle={t('toolbar.newPosterSubtitle')}
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmNewOpen(true);
                }}
              />
            </div>
          </>
        )}
      </div>

      <Divider />

      {/* Export */}
      <button
        onClick={() => setExportDialogOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
        style={{ backgroundColor: 'var(--color-mandatory, #003DA5)', color: '#fff' }}
      >
        <Download size={14} />
        {!isMobile && t('toolbar.export')}
      </button>

      <Divider />

      {/* Right panel toggle */}
      <ToolbarButton icon={PanelRightOpen} label={t('toolbar.toggleRightPanel')} onClick={toggleRightPanel} />

      {/* ─── Non-destructive Poster Settings dialog ─── */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}
        >
          <div
            className="rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-semibold">{t('toolbar.posterSettings')}</h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Info banner */}
              <p className="text-xs rounded-lg p-2.5" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                {t('toolbar.settingsInfo')}
              </p>

              {/* Orientation */}
              <div>
                <label className="text-xs font-medium mb-2 block">{t('toolbar.orientation')}</label>
                <div className="flex gap-2">
                  {(['portrait', 'landscape'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => handleOrientationChange(o)}
                      className="flex-1 py-2 px-3 rounded-lg text-sm text-center transition-all"
                      style={{
                        backgroundColor: posterDoc.orientation === o ? 'var(--color-surface-hover)' : 'transparent',
                        border: `2px solid ${posterDoc.orientation === o ? posterDoc.theme.primary : 'var(--color-border)'}`,
                        color: posterDoc.orientation === o ? 'var(--color-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      {t(`toolbar.${o}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs font-medium mb-2 block">{t('toolbar.colorTheme')}</label>
                <div className="space-y-1.5">
                  {SAFETY_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                      style={{
                        backgroundColor: posterDoc.theme.id === theme.id ? 'var(--color-surface-hover)' : 'transparent',
                        border: `1.5px solid ${posterDoc.theme.id === theme.id ? theme.primary : 'var(--color-border)'}`,
                      }}
                    >
                      <div className="flex gap-1 shrink-0">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.primary }} />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.secondary }} />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{t(`wizard.theme.themes.${theme.id}`)}</div>
                        <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {t('toolbar.signalWord')}: {theme.signalWord}
                        </div>
                      </div>
                      {posterDoc.theme.id === theme.id && (
                        <span className="text-[10px] font-medium shrink-0" style={{ color: theme.primary }}>{t('toolbar.active')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewing Distance */}
              <div>
                <label className="text-xs font-medium mb-2 block">
                  {t('toolbar.viewingDistance')}: <strong>{posterDoc.viewingDistance}m</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={posterDoc.viewingDistance}
                  onChange={(e) => setViewingDistance(Number(e.target.value))}
                  className="w-full accent-[#003DA5]"
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{t('wizard.viewing.distances.1')}</span>
                  <span>{t('wizard.viewing.distances.10')}</span>
                  <span>{t('wizard.viewing.distances.20')}</span>
                </div>

                {/* Live readability feedback */}
                {(() => {
                  const minPt = getMinFontSizePt(posterDoc.viewingDistance);
                  return (
                    <div
                      className="mt-3 rounded-lg px-3 py-2 text-[11px] flex items-center gap-2"
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: minPt > 72 ? '#F59E0B' : '#22c55e' }}
                      />
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {t('toolbar.minReadable')} <strong style={{ color: 'var(--color-text)' }}>{minPt.toFixed(0)} pt</strong>
                        {minPt > 72 && (
                          <span style={{ color: '#F59E0B' }}> — {t('toolbar.largerThanTitle')}</span>
                        )}
                        {minPt <= 72 && minPt > 36 && (
                          <span> — {t('toolbar.headingSize')}</span>
                        )}
                        {minPt <= 36 && (
                          <span style={{ color: '#22c55e' }}> — {t('toolbar.bodyReadable')}</span>
                        )}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-mandatory, #003DA5)', color: '#fff' }}
              >
                {t('toolbar.done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm dialog for New Poster (destructive) ─── */}
      {confirmNewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div
            className="rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="text-base font-semibold mb-2">{t('toolbar.startOver')}</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {t('toolbar.startOverMessage')}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmNewOpen(false)}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  setConfirmNewOpen(false);
                  resetDocument();
                }}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: '#C8102E', color: '#fff' }}
              >
                {t('toolbar.discardStartOver')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-6 mx-1 hidden md:block" style={{ backgroundColor: 'var(--color-border)' }} />;
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: typeof MousePointer2;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-surface-hover)' : 'transparent',
        color: disabled ? 'var(--color-border)' : active ? 'var(--color-text)' : 'var(--color-text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Icon size={16} />
    </button>
  );
}

function MenuButton({
  icon: Icon,
  label,
  subtitle,
  onClick,
}: {
  icon: typeof MousePointer2;
  label: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:brightness-110"
      style={{ color: 'var(--color-text)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Icon size={14} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      <div>
        <div className="text-sm">{label}</div>
        {subtitle && (
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</div>
        )}
      </div>
    </button>
  );
}
