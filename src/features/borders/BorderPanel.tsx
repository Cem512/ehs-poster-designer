import { usePosterStore } from '../../store/poster-store';
import { BORDER_PRESETS } from '../../constants/border-presets';
import type { BorderType } from '../../types/poster';

export default function BorderPanel() {
  const { document: posterDoc, setBorder } = usePosterStore();

  const handleBorderChange = (type: BorderType) => {
    setBorder({
      ...posterDoc.border,
      type,
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Select a border style for your poster
      </p>

      <div className="space-y-2">
        {BORDER_PRESETS.map((preset) => (
          <button
            key={preset.type}
            onClick={() => handleBorderChange(preset.type)}
            className="w-full text-left p-3 rounded-lg transition-all"
            style={{
              backgroundColor: posterDoc.border.type === preset.type ? 'var(--color-surface-hover)' : 'transparent',
              border: `1px solid ${posterDoc.border.type === preset.type ? posterDoc.theme.primary : 'var(--color-border)'}`,
            }}
          >
            {/* Mini preview */}
            <div className="flex items-center gap-3">
              <BorderMiniPreview
                type={preset.type}
                primaryColor={posterDoc.theme.primary}
                secondaryColor={posterDoc.theme.secondary}
              />
              <div>
                <div className="text-sm font-medium">{preset.label}</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {preset.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Border thickness */}
      <div>
        <label className="text-xs font-medium mb-1 block">
          Thickness: {posterDoc.border.thickness}mm
        </label>
        <input
          type="range"
          min={2}
          max={20}
          step={1}
          value={posterDoc.border.thickness}
          onChange={(e) => setBorder({ ...posterDoc.border, thickness: Number(e.target.value) })}
          className="w-full accent-[#003DA5]"
        />
      </div>
    </div>
  );
}

function BorderMiniPreview({ type, primaryColor, secondaryColor }: {
  type: BorderType; primaryColor: string; secondaryColor: string;
}) {
  const w = 40;
  const h = 56;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={0} y={0} width={w} height={h} fill="#fff" />

      {type === 'hazard-stripe' && (
        <>
          <rect x={0} y={0} width={w} height={h} fill={primaryColor} />
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={i}
              x1={-h + i * 8}
              y1={0}
              x2={i * 8}
              y2={h}
              stroke={secondaryColor}
              strokeWidth={3}
            />
          ))}
          <rect x={5} y={5} width={w - 10} height={h - 10} fill="#fff" />
        </>
      )}

      {type === 'solid-industrial' && (
        <>
          <rect x={1} y={1} width={w - 2} height={h - 2} fill="none" stroke={primaryColor} strokeWidth={4} />
          <rect x={5} y={5} width={w - 10} height={h - 10} fill="none" stroke={primaryColor} strokeWidth={0.5} />
        </>
      )}

      {type === 'double-line' && (
        <>
          <rect x={1} y={1} width={w - 2} height={h - 2} fill="none" stroke={primaryColor} strokeWidth={3} />
          <rect x={5} y={5} width={w - 10} height={h - 10} fill="none" stroke={secondaryColor} strokeWidth={2} />
        </>
      )}

      {type === 'rounded-safety' && (
        <rect x={2} y={2} width={w - 4} height={h - 4} fill="none" stroke={primaryColor} strokeWidth={3} rx={6} ry={6} />
      )}

      {type === 'color-banded' && (
        <>
          <rect x={1} y={1} width={w - 2} height={h - 2} fill="none" stroke={secondaryColor} strokeWidth={2} />
          <rect x={0} y={0} width={w} height={14} fill={primaryColor} />
        </>
      )}
    </svg>
  );
}
