import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '../../store/canvas-store';
import { usePosterStore } from '../../store/poster-store';
import { useUIStore } from '../../store/ui-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { getPosterDimensionsPx } from '../../constants/paper-sizes';

/** Format a relative time using i18n translation keys */
function formatTimeAgo(date: Date, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return t('status.justNow');
  if (seconds < 60) return t('status.secondsAgo', { seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('status.minutesAgo', { minutes });
  return t('status.hoursAgo', { hours: Math.floor(minutes / 60) });
}

export default function StatusBar() {
  const { t } = useTranslation();
  const { zoom, gridVisible, snapEnabled, toggleGrid, toggleSnap, setZoom } = useCanvasStore();
  const { document: posterDoc } = usePosterStore();
  const { isMobile, hasUnsavedChanges, lastSavedAt } = useUIStore();

  const handleZoomFit = useCallback(() => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const el = canvas.getElement().parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
    const fitZoom = Math.min((rect.width - 80) / dims.width, (rect.height - 80) / dims.height, 1);
    canvas.setZoom(fitZoom);
    setZoom(fitZoom);
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] = (rect.width - dims.width * fitZoom) / 2;
      vpt[5] = (rect.height - dims.height * fitZoom) / 2;
    }
    canvas.requestRenderAll();
  }, [posterDoc.size, posterDoc.orientation, setZoom]);

  // Re-render every 10s to update "X ago" label
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-7 lg:h-8 flex items-center px-3 lg:px-4 text-xs lg:text-sm border-t shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
      }}
    >
      <button
        onClick={handleZoomFit}
        className="hover:underline cursor-pointer"
        title={t('status.clickZoomFit')}
      >{Math.round(zoom * 100)}%</button>
      <StatusDivider />
      <span>{posterDoc.sizeKey} ({posterDoc.size.width} x {posterDoc.size.height} mm)</span>
      <StatusDivider />
      <span>{t(`status.${posterDoc.orientation}`)}</span>

      {!isMobile && (
        <>
          <StatusDivider />
          <span>{t('status.viewing')}: {posterDoc.viewingDistance}m</span>
        </>
      )}

      <div className="flex-1" />

      {/* Save status indicator */}
      <span
        className="flex items-center gap-1"
        title={lastSavedAt ? t('status.lastAutoSaved', { time: lastSavedAt.toLocaleTimeString() }) : t('status.notYetSaved')}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: hasUnsavedChanges ? '#F59E0B' : lastSavedAt ? '#22c55e' : 'var(--color-border)',
          }}
        />
        {hasUnsavedChanges
          ? t('status.unsavedChanges')
          : lastSavedAt
            ? t('status.saved', { time: formatTimeAgo(lastSavedAt, t) })
            : t('status.notSaved')}
      </span>
      <StatusDivider />

      {!isMobile && (
        <>
          <button onClick={toggleGrid} className="hover:underline cursor-pointer" title={t('status.toggleGrid')}>
            {gridVisible ? t('status.gridOn') : t('status.gridOff')}
          </button>
          <StatusDivider />
          <button onClick={toggleSnap} className="hover:underline cursor-pointer" title={t('status.toggleSnap')}>
            {snapEnabled ? t('status.snapOn') : t('status.snapOff')}
          </button>
          <StatusDivider />
        </>
      )}
      <span>DPI: {posterDoc.dpi}</span>
    </div>
  );
}

function StatusDivider() {
  return (
    <span
      className="mx-2 h-3 w-px inline-block"
      style={{ backgroundColor: 'var(--color-border)' }}
    />
  );
}
