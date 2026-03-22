import { LayoutGrid, Columns2, Grid2x2, LayoutDashboard } from 'lucide-react';
import { LAYOUT_OPTIONS, applyLayout, type LayoutPreset } from './AutoLayoutEngine';

const ICONS: Record<LayoutPreset, typeof LayoutGrid> = {
  'center-stack': LayoutGrid,
  'two-column': Columns2,
  'grid-2x2': Grid2x2,
  'thirds': LayoutDashboard,
};

export default function AutoLayoutPanel() {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
        Auto-Layout
      </p>
      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        Rearrange user objects into a layout preset. Does not affect borders or zones.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {LAYOUT_OPTIONS.map((opt) => {
          const Icon = ICONS[opt.id];
          return (
            <button
              key={opt.id}
              onClick={() => applyLayout(opt.id)}
              className="flex flex-col items-center gap-1 p-3 rounded transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              title={opt.description}
            >
              <Icon size={20} />
              <span className="text-[10px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
