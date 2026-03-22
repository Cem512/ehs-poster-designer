import { useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import * as fabric from 'fabric';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { FONT_PRESETS } from '../../constants/font-presets';
import { usePosterStore } from '../../store/poster-store';
import { checkReadability } from '../../constants/readability-table';

interface TextProps {
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  fill: string;
}

const defaultProps: TextProps = {
  fontSize: 24,
  fontFamily: 'Inter',
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  textAlign: 'left',
  fill: '#000000',
};

export default function TextToolbar() {
  const [textProps, setTextProps] = useState<TextProps>(defaultProps);
  const [activeObject, setActiveObject] = useState<fabric.IText | null>(null);
  const viewingDistance = usePosterStore((s) => s.document.viewingDistance);

  // Listen for selection changes
  useEffect(() => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const updateFromSelection = () => {
      const obj = canvas.getActiveObject();
      if (obj && (obj instanceof fabric.IText || obj instanceof fabric.FabricText)) {
        setActiveObject(obj as fabric.IText);
        setTextProps({
          fontSize: obj.fontSize || 24,
          fontFamily: obj.fontFamily || 'Inter',
          fontWeight: String(obj.fontWeight || 'normal'),
          fontStyle: obj.fontStyle || 'normal',
          underline: obj.underline || false,
          textAlign: obj.textAlign || 'left',
          fill: String(obj.fill || '#000000'),
        });
      } else {
        setActiveObject(null);
      }
    };

    canvas.on('selection:created', updateFromSelection);
    canvas.on('selection:updated', updateFromSelection);
    canvas.on('selection:cleared', () => setActiveObject(null));
    canvas.on('object:modified', updateFromSelection);

    return () => {
      canvas.off('selection:created', updateFromSelection);
      canvas.off('selection:updated', updateFromSelection);
      canvas.off('selection:cleared', () => setActiveObject(null));
      canvas.off('object:modified', updateFromSelection);
    };
  }, []);

  const updateProp = useCallback(<K extends keyof TextProps>(key: K, value: TextProps[K]) => {
    if (!activeObject) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    (activeObject as any).set(key, value);
    setTextProps((prev) => ({ ...prev, [key]: value }));
    canvas.requestRenderAll();
  }, [activeObject]);

  if (!activeObject) {
    return (
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Select a text object to edit its properties
      </div>
    );
  }

  const readability = checkReadability(textProps.fontSize, viewingDistance);
  const readabilityColors = { pass: '#22c55e', warn: '#f59e0b', fail: '#ef4444' };

  return (
    <div className="space-y-3">
      {/* Font family */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
          Font
        </label>
        <select
          value={textProps.fontFamily}
          onChange={(e) => updateProp('fontFamily', e.target.value)}
          className="w-full px-2 py-1.5 rounded text-xs outline-none"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          {FONT_PRESETS.map((f) => (
            <option key={f.family} value={f.family}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Font size + readability */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: 'var(--color-text-muted)' }}>
          <span>Size</span>
          <span className="flex items-center gap-1" style={{ color: readabilityColors[readability.level] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: readabilityColors[readability.level] }} />
            {readability.level === 'pass' ? 'Readable' : readability.level === 'warn' ? 'Marginal' : 'Too small'}
            {' at ' + viewingDistance + 'm'}
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={Math.round(textProps.fontSize)}
            onChange={(e) => updateProp('fontSize', Number(e.target.value))}
            min={8}
            max={500}
            className="w-20 px-2 py-1.5 rounded text-xs outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <input
            type="range"
            min={8}
            max={300}
            value={textProps.fontSize}
            onChange={(e) => updateProp('fontSize', Number(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Style toggles */}
      <div className="flex gap-1">
        <StyleButton
          icon={Bold}
          active={textProps.fontWeight === 'bold'}
          onClick={() => updateProp('fontWeight', textProps.fontWeight === 'bold' ? 'normal' : 'bold')}
        />
        <StyleButton
          icon={Italic}
          active={textProps.fontStyle === 'italic'}
          onClick={() => updateProp('fontStyle', textProps.fontStyle === 'italic' ? 'normal' : 'italic')}
        />
        <StyleButton
          icon={Underline}
          active={textProps.underline}
          onClick={() => updateProp('underline', !textProps.underline)}
        />
        <div className="w-px mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
        <StyleButton
          icon={AlignLeft}
          active={textProps.textAlign === 'left'}
          onClick={() => updateProp('textAlign', 'left')}
        />
        <StyleButton
          icon={AlignCenter}
          active={textProps.textAlign === 'center'}
          onClick={() => updateProp('textAlign', 'center')}
        />
        <StyleButton
          icon={AlignRight}
          active={textProps.textAlign === 'right'}
          onClick={() => updateProp('textAlign', 'right')}
        />
      </div>

      {/* Color */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textProps.fill}
            onChange={(e) => updateProp('fill', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <input
            type="text"
            value={textProps.fill}
            onChange={(e) => updateProp('fill', e.target.value)}
            className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      {/* Readability detail */}
      <div
        className="p-2 rounded text-[10px]"
        style={{
          backgroundColor: readabilityColors[readability.level] + '15',
          border: `1px solid ${readabilityColors[readability.level]}30`,
          color: readabilityColors[readability.level],
        }}
      >
        Cap height: {readability.actualCapMm.toFixed(1)}mm
        (need {readability.requiredCapMm.toFixed(1)}mm for {viewingDistance}m)
      </div>
    </div>
  );
}

function StyleButton({ icon: Icon, active, onClick }: {
  icon: typeof Bold; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-surface-hover)' : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
      }}
    >
      <Icon size={14} />
    </button>
  );
}
