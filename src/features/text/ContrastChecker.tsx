import { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { checkContrast, type ContrastLevel } from '../../utils/color-utils';
import { usePosterStore } from '../../store/poster-store';

interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  level: ContrastLevel;
}

const LEVEL_COLORS: Record<ContrastLevel, string> = {
  excellent: '#22c55e',
  good: '#3b82f6',
  poor: '#f59e0b',
  fail: '#ef4444',
};

const LEVEL_LABELS: Record<ContrastLevel, string> = {
  excellent: 'Excellent (7:1+)',
  good: 'Good (4.5:1+)',
  poor: 'Poor (3:1+)',
  fail: 'Fail (<3:1)',
};

export default function ContrastChecker() {
  const [result, setResult] = useState<ContrastResult | null>(null);
  const posterBg = usePosterStore((s) => s.document.theme.background);

  useEffect(() => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const updateContrast = () => {
      const obj = canvas.getActiveObject();
      if (!obj || !(obj instanceof fabric.IText || obj instanceof fabric.FabricText)) {
        setResult(null);
        return;
      }

      const fg = String(obj.fill || '#000000');
      // Determine background: find the topmost non-text object behind this one
      const bg = findBackgroundColor(canvas, obj) || posterBg;

      const { ratio, level } = checkContrast(fg, bg);
      setResult({ foreground: fg, background: bg, ratio, level });
    };

    canvas.on('selection:created', updateContrast);
    canvas.on('selection:updated', updateContrast);
    canvas.on('selection:cleared', () => setResult(null));
    canvas.on('object:modified', updateContrast);

    // Check on mount
    updateContrast();

    return () => {
      canvas.off('selection:created', updateContrast);
      canvas.off('selection:updated', updateContrast);
      canvas.off('selection:cleared', () => setResult(null));
      canvas.off('object:modified', updateContrast);
    };
  }, [posterBg]);

  if (!result) {
    return (
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Select a text object to check contrast
      </p>
    );
  }

  const color = LEVEL_COLORS[result.level];

  return (
    <div className="space-y-2">
      {/* Ratio display */}
      <div
        className="p-2 rounded text-center"
        style={{
          backgroundColor: color + '15',
          border: `1px solid ${color}30`,
        }}
      >
        <div className="text-lg font-bold" style={{ color }}>
          {result.ratio.toFixed(1)}:1
        </div>
        <div className="text-[10px] font-medium" style={{ color }}>
          {LEVEL_LABELS[result.level]}
        </div>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-1">
          <div
            className="w-5 h-5 rounded border"
            style={{ backgroundColor: result.foreground, borderColor: 'var(--color-border)' }}
          />
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Text</div>
            <div className="font-mono text-[10px]">{result.foreground}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <div
            className="w-5 h-5 rounded border"
            style={{ backgroundColor: result.background, borderColor: 'var(--color-border)' }}
          />
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Behind</div>
            <div className="font-mono text-[10px]">{result.background}</div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="text-[10px] space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
        <div className="flex justify-between">
          <span>Large text (18pt+ bold)</span>
          <span style={{ color: result.ratio >= 3 ? '#22c55e' : '#ef4444' }}>
            {result.ratio >= 3 ? 'Pass' : 'Fail'} (3:1)
          </span>
        </div>
        <div className="flex justify-between">
          <span>Normal text</span>
          <span style={{ color: result.ratio >= 4.5 ? '#22c55e' : '#ef4444' }}>
            {result.ratio >= 4.5 ? 'Pass' : 'Fail'} (4.5:1)
          </span>
        </div>
        <div className="flex justify-between">
          <span>Safety signage</span>
          <span style={{ color: result.ratio >= 7 ? '#22c55e' : '#ef4444' }}>
            {result.ratio >= 7 ? 'Pass' : 'Fail'} (7:1)
          </span>
        </div>
      </div>
    </div>
  );
}

/** Find the background color behind a text object by checking objects below it */
function findBackgroundColor(canvas: fabric.Canvas, target: fabric.FabricObject): string | null {
  const objects = canvas.getObjects();
  const targetIndex = objects.indexOf(target);
  const targetBounds = target.getBoundingRect();

  // Walk backwards from the object to find what's behind it
  for (let i = targetIndex - 1; i >= 0; i--) {
    const obj = objects[i];
    if (obj instanceof fabric.IText || obj instanceof fabric.FabricText) continue;

    const bounds = obj.getBoundingRect();
    // Check if this object overlaps with the text
    if (
      bounds.left <= targetBounds.left &&
      bounds.top <= targetBounds.top &&
      bounds.left + bounds.width >= targetBounds.left + targetBounds.width &&
      bounds.top + bounds.height >= targetBounds.top + targetBounds.height
    ) {
      const fill = obj.fill;
      if (typeof fill === 'string' && fill !== 'transparent') {
        return fill;
      }
    }
  }

  return null;
}
