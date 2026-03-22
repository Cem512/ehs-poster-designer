import { useState, useMemo } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import type { PictogramCategory } from '../../types/pictogram';
import { PICTOGRAM_CATEGORY_COLORS } from '../../types/pictogram';
import { PICTOGRAM_CATALOG } from './pictogram-catalog';

const categories: PictogramCategory[] = ['prohibition', 'warning', 'mandatory', 'safe-condition', 'fire-equipment'];

/** Short labels for category tabs */
const CATEGORY_SHORT_LABELS: Record<PictogramCategory, string> = {
  'prohibition': 'Prohib',
  'warning': 'Warn',
  'mandatory': 'Manda',
  'safe-condition': 'Safe',
  'fire-equipment': 'Fire',
};

export default function PictogramPanel() {
  const [activeCategory, setActiveCategory] = useState<PictogramCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count per category (computed once, doesn't change)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PICTOGRAM_CATALOG.length };
    for (const cat of categories) {
      counts[cat] = PICTOGRAM_CATALOG.filter(p => p.category === cat).length;
    }
    return counts;
  }, []);

  const filtered = PICTOGRAM_CATALOG.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search pictograms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 rounded text-xs outline-none"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category tabs with counts */}
      <div className="flex flex-wrap gap-1">
        <CategoryTab
          label="All"
          count={categoryCounts.all}
          active={activeCategory === 'all'}
          color="var(--color-text-muted)"
          onClick={() => setActiveCategory('all')}
        />
        {categories.map((cat) => (
          <CategoryTab
            key={cat}
            label={CATEGORY_SHORT_LABELS[cat]}
            count={categoryCounts[cat]}
            active={activeCategory === cat}
            color={PICTOGRAM_CATEGORY_COLORS[cat]}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Results count */}
      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        {filtered.length} of {activeCategory === 'all' ? categoryCounts.all : categoryCounts[activeCategory]} pictogram{filtered.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Pictogram grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center p-2 rounded cursor-grab transition-colors"
              style={{ border: '1px solid var(--color-border)' }}
              title={`${p.isoCode}: ${p.label}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/pictogram', JSON.stringify(p));
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}${p.svgPath.replace(/^\//, '')}`}
                alt={p.label}
                className="w-12 h-12 mb-1"
                draggable={false}
                onError={(e) => {
                  // Fallback to text if SVG missing
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-12 h-12 rounded flex items-center justify-center text-xs font-bold mb-1';
                  fallback.style.backgroundColor = PICTOGRAM_CATEGORY_COLORS[p.category] + '20';
                  fallback.style.color = PICTOGRAM_CATEGORY_COLORS[p.category];
                  fallback.style.border = `2px solid ${PICTOGRAM_CATEGORY_COLORS[p.category]}`;
                  fallback.textContent = p.id;
                  el.parentElement?.insertBefore(fallback, el);
                }}
              />
              <span className="text-[9px] text-center leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <SearchX size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            No pictograms found
          </p>
          <p className="text-[10px] text-center leading-relaxed" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
            {searchQuery
              ? <>No results for "<strong>{searchQuery}</strong>"{activeCategory !== 'all' && ' in this category'}. Try a different term or <button className="underline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>clear filters</button>.</>
              : <>This category is empty.</>
            }
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-[10px] text-center" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
          Drag to canvas to add
        </p>
      )}
    </div>
  );
}

function CategoryTab({ label, count, active, color, onClick }: {
  label: string; count: number; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded text-[10px] font-medium transition-colors flex items-center gap-1"
      style={{
        backgroundColor: active ? color + '20' : 'transparent',
        color: active ? color : 'var(--color-text-muted)',
        border: `1px solid ${active ? color : 'var(--color-border)'}`,
      }}
    >
      {label}
      <span
        className="text-[8px] rounded-full px-1"
        style={{
          backgroundColor: active ? color + '30' : 'var(--color-border)',
          color: active ? color : 'var(--color-text-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}
