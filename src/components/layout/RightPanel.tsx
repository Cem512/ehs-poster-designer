import { Settings, Type, Move, Eye, Palette, Contrast, Wand2, Paintbrush, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePosterStore } from '../../store/poster-store';
import { useCanvasStore } from '../../store/canvas-store';
import { useUIStore } from '../../store/ui-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { checkReadability, getMinFontSizePt } from '../../constants/readability-table';
import { showToast } from '../ui/Toast';
import TextToolbar from '../../features/text/TextToolbar';
import ContrastChecker from '../../features/text/ContrastChecker';
import AutoLayoutPanel from '../../features/auto-layout/AutoLayoutPanel';
import ColorEditor from '../../features/colors/ColorEditor';

export default function RightPanel() {
  const { t } = useTranslation();
  const { document: posterDoc } = usePosterStore();
  const { selectedObjectIds } = useCanvasStore();
  const { setRightPanelOpen } = useUIStore();

  return (
    <div
      className="w-72 lg:w-80 xl:w-[22rem] flex flex-col border-l overflow-y-auto shrink-0"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-sm font-medium">{t('panels.properties')}</h3>
        <button
          onClick={() => setRightPanelOpen(false)}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors opacity-60 hover:opacity-100"
          style={{ color: 'var(--color-text-muted)' }}
          title={t('rightPanel.closePanel')}
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Text properties (shown when text selected) */}
        <Section title={t('toolbar.text')} icon={Type}>
          <TextToolbar />
        </Section>

        {/* Poster info */}
        <Section title={t('rightPanel.poster')} icon={Settings}>
          <InfoRow label={t('rightPanel.size')} value={`${posterDoc.size.width} × ${posterDoc.size.height} mm`} />
          <InfoRow label={t('rightPanel.orientation')} value={t(`status.${posterDoc.orientation}`)} />
          <InfoRow label={t('rightPanel.theme')} value={t(`wizard.theme.themes.${posterDoc.theme.id}`)} />
          <InfoRow label={t('rightPanel.border')} value={posterDoc.border.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} />
        </Section>

        {/* Readability info */}
        <Section title={t('rightPanel.readability')} icon={Eye}>
          <InfoRow label={t('rightPanel.viewingDistance')} value={`${posterDoc.viewingDistance}m`} />
          <InfoRow
            label={t('rightPanel.minFontSize')}
            value={`${getMinFontSizePt(posterDoc.viewingDistance).toFixed(0)} pt`}
          />
          <div className="mt-2">
            <ReadabilityIndicator distance={posterDoc.viewingDistance} />
          </div>
        </Section>

        {/* Contrast checker */}
        <Section title={t('rightPanel.contrast')} icon={Contrast}>
          <ContrastChecker />
        </Section>

        {/* Selection info */}
        {selectedObjectIds.length > 0 && (
          <Section title={t('rightPanel.selection')} icon={Move}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t('rightPanel.objectsSelected', { count: selectedObjectIds.length })}
            </p>
          </Section>
        )}

        {/* Color editor for selected objects */}
        {selectedObjectIds.length > 0 && (
          <Section title={t('rightPanel.elementColors')} icon={Paintbrush}>
            <ColorEditor />
          </Section>
        )}

        {/* Auto-layout */}
        <Section title={t('rightPanel.autoLayout')} icon={Wand2}>
          <AutoLayoutPanel />
        </Section>

        {/* Theme colors */}
        <Section title={t('rightPanel.themeColors')} icon={Palette}>
          <div className="grid grid-cols-4 gap-2">
            <ColorSwatch color={posterDoc.theme.primary} label={t('rightPanel.primary')} />
            <ColorSwatch color={posterDoc.theme.secondary} label={t('rightPanel.secondary')} />
            <ColorSwatch color={posterDoc.theme.accent} label={t('rightPanel.accent')} />
            <ColorSwatch color={posterDoc.theme.background} label={t('rightPanel.background')} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color: 'var(--color-text-muted)' }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs py-0.5">
      <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const { t } = useTranslation();

  const handleClick = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && 'set' in active) {
      active.set('fill', color);
      canvas.requestRenderAll();
      showToast(t('rightPanel.colorApplied', { label }), 'success');
    } else {
      // No selection — copy hex to clipboard
      navigator.clipboard?.writeText(color).then(() => {
        showToast(t('rightPanel.copied', { color }), 'info');
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1 group"
      title={`${label}: ${color} — ${t('rightPanel.clickToApply')}`}
    >
      <div
        className="w-8 h-8 rounded border transition-transform group-hover:scale-110"
        style={{ backgroundColor: color, borderColor: 'var(--color-border)' }}
      />
      <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </button>
  );
}

function ReadabilityIndicator({ distance }: { distance: number }) {
  const { t } = useTranslation();
  const minPt = getMinFontSizePt(distance);
  const examples = [
    { label: t('rightPanel.title72'), size: 72 },
    { label: t('rightPanel.heading36'), size: 36 },
    { label: t('rightPanel.body18'), size: 18 },
    { label: t('rightPanel.caption12'), size: 12 },
  ];

  const allFail = examples.every((ex) => checkReadability(ex.size, distance).level === 'fail');

  return (
    <div className="space-y-1">
      {/* Show a contextual tip when min size exceeds all standard sizes */}
      {allFail && (
        <div
          className="rounded px-2 py-1.5 mb-2 text-[10px] leading-snug"
          style={{ backgroundColor: '#F59E0B15', border: '1px solid #F59E0B30', color: '#F59E0B' }}
          dangerouslySetInnerHTML={{
            __html: t('rightPanel.readabilityTip', { distance, size: minPt.toFixed(0) }),
          }}
        />
      )}

      {examples.map(({ label, size }) => {
        const result = checkReadability(size, distance);
        const colors = {
          pass: '#22c55e',
          warn: '#f59e0b',
          fail: '#ef4444',
        };
        return (
          <div key={label} className="flex items-center justify-between gap-2 text-xs">
            <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            <span className="flex items-center gap-1" style={{ color: colors[result.level] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[result.level] }} />
              {result.level === 'pass' ? t('rightPanel.ok') : result.level === 'warn' ? t('rightPanel.marginal') : t('rightPanel.tooSmall')}
            </span>
          </div>
        );
      })}

      {/* Show the recommended minimum */}
      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t mt-1" style={{ borderColor: 'var(--color-border)' }}>
        <span className="shrink-0 font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('rightPanel.minimum')}</span>
        <span className="font-medium">{minPt.toFixed(0)} pt</span>
      </div>
    </div>
  );
}
