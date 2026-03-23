import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { TEMPLATES } from './template-registry';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { usePosterStore } from '../../store/poster-store';
import { getPosterDimensionsPx, mmToPx } from '../../constants/paper-sizes';
import { renderBorder } from '../borders/border-factory';
import { renderZones } from '../frames/zone-renderer';
import { showToast } from '../../components/ui/Toast';
import type { TemplateDefinition } from '../../types/template';

export default function TemplatePanel() {
  const [applying, setApplying] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateDefinition | null>(null);
  const posterDoc = usePosterStore((s) => s.document);

  const applyTemplate = (template: TemplateDefinition) => {
    const canvas = getFabricCanvas();
    if (!canvas || applying) return;

    setApplying(true);
    setConfirmTemplate(null);

    // Remove all objects — template builds from scratch
    canvas.getObjects().slice().forEach((obj) => canvas.remove(obj));

    const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);

    // Re-render border and zones first (template cleared them)
    renderBorder(canvas, posterDoc);
    renderZones(canvas, posterDoc);

    // Apply the template content on top
    template.apply({
      canvas,
      width: dims.width,
      height: dims.height,
      theme: posterDoc.theme,
      border: posterDoc.border,
      mmToPx,
    });

    canvas.requestRenderAll();
    setApplying(false);
    showToast(`Template "${template.name}" applied`, 'success');
  };

  /** Check if canvas has user content worth protecting */
  const requestApply = (template: TemplateDefinition) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    // Count user-created objects (exclude border/zone framework objects)
    const userObjects = canvas.getObjects().filter(
      (obj: any) => !obj._customId
    );

    if (userObjects.length > 0) {
      // Canvas has content — ask for confirmation
      setConfirmTemplate(template);
    } else {
      // Empty canvas — apply immediately
      applyTemplate(template);
    }
  };

  return (
    <div className="space-y-3">
      <p
        className="text-[10px] uppercase tracking-wider font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Templates ({TEMPLATES.length})
      </p>

      <div className="space-y-3">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onApply={() => requestApply(template)}
            applying={applying}
          />
        ))}
      </div>

      <p
        className="text-[10px] mt-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Applying a template replaces all current canvas content. All text is editable after applying.
      </p>

      {/* Confirmation dialog */}
      {confirmTemplate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmTemplate(null); }}
        >
          <div
            className="rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F59E0B20' }}
              >
                <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Replace Canvas Content?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Applying <strong>"{confirmTemplate.name}"</strong> will replace all existing content on the canvas. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => applyTemplate(confirmTemplate)}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: '#C8102E', color: '#fff' }}
              >
                Replace Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onApply,
  applying,
}: {
  template: TemplateDefinition;
  onApply: () => void;
  applying: boolean;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* SVG Thumbnail */}
      <div
        className="w-full aspect-[3/4] flex items-center justify-center p-2"
        style={{ backgroundColor: 'var(--color-bg)' }}
        dangerouslySetInnerHTML={{ __html: template.thumbnail }}
      />

      {/* Info + Apply */}
      <div className="p-2 space-y-1.5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <h4 className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
          {template.name}
        </h4>
        <p className="text-[10px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
          {template.description}
        </p>
        <button
          onClick={onApply}
          disabled={applying}
          className="w-full py-1.5 rounded text-[11px] font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            opacity: applying ? 0.5 : 1,
          }}
        >
          {applying ? 'Applying...' : 'Apply Template'}
        </button>
      </div>
    </div>
  );
}
