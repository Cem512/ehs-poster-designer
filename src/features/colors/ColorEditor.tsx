import { useState, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { useCanvasStore } from '../../store/canvas-store';
import { usePosterStore } from '../../store/poster-store';

/** A single color row: label + swatch + native picker */
function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {value.toUpperCase()}
        </span>
        <label
          className="w-7 h-7 rounded border cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value, borderColor: 'var(--color-border)' }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

/** Quick-pick theme swatch */
function ThemeSwatch({
  color,
  active,
  onClick,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-6 h-6 rounded border-2 transition-all"
      style={{
        backgroundColor: color,
        borderColor: active ? 'var(--color-text)' : 'var(--color-border)',
        transform: active ? 'scale(1.15)' : 'scale(1)',
      }}
      title={color}
    />
  );
}

interface ObjectColors {
  fill: string | null;
  stroke: string | null;
  textFill: string | null;
  hasText: boolean;
  hasShape: boolean;
}

/** Read current colors from the active selection */
function readColors(canvas: fabric.Canvas): ObjectColors | null {
  const active = canvas.getActiveObject();
  if (!active) return null;

  const result: ObjectColors = {
    fill: null,
    stroke: null,
    textFill: null,
    hasText: false,
    hasShape: false,
  };

  // Determine object type
  const isText =
    active instanceof fabric.IText ||
    active instanceof fabric.FabricText ||
    active.type === 'i-text' ||
    active.type === 'text' ||
    active.type === 'textbox';

  if (isText) {
    result.hasText = true;
    result.textFill = (active.fill as string) || '#000000';
  } else {
    result.hasShape = true;
    const fill = active.fill;
    if (typeof fill === 'string') {
      result.fill = fill;
    }
    const stroke = active.stroke;
    if (typeof stroke === 'string' && stroke !== '') {
      result.stroke = stroke;
    }
  }

  // Groups / active selection can have mixed objects
  if (active instanceof fabric.ActiveSelection || active instanceof fabric.Group) {
    const objects = (active as any).getObjects?.() || [];
    for (const obj of objects) {
      const objIsText =
        obj instanceof fabric.IText ||
        obj instanceof fabric.FabricText ||
        obj.type === 'i-text' ||
        obj.type === 'text' ||
        obj.type === 'textbox';
      if (objIsText) {
        result.hasText = true;
        if (!result.textFill) result.textFill = (obj.fill as string) || '#000000';
      } else {
        result.hasShape = true;
        if (!result.fill && typeof obj.fill === 'string') result.fill = obj.fill;
        if (!result.stroke && typeof obj.stroke === 'string' && obj.stroke !== '')
          result.stroke = obj.stroke;
      }
    }
  }

  return result;
}

export default function ColorEditor() {
  const { selectedObjectIds } = useCanvasStore();
  const { document: posterDoc } = usePosterStore();
  const [colors, setColors] = useState<ObjectColors | null>(null);

  // Refresh colors when selection changes
  const refreshColors = useCallback(() => {
    const canvas = getFabricCanvas();
    if (!canvas) {
      setColors(null);
      return;
    }
    setColors(readColors(canvas));
  }, []);

  useEffect(() => {
    refreshColors();
  }, [selectedObjectIds, refreshColors]);

  // Also listen for object:modified to catch changes
  useEffect(() => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    canvas.on('object:modified', refreshColors);
    canvas.on('selection:created', refreshColors);
    canvas.on('selection:updated', refreshColors);
    canvas.on('selection:cleared', refreshColors);

    return () => {
      canvas.off('object:modified', refreshColors);
      canvas.off('selection:created', refreshColors);
      canvas.off('selection:updated', refreshColors);
      canvas.off('selection:cleared', refreshColors);
    };
  }, [refreshColors]);

  if (!colors || selectedObjectIds.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Select an object to edit colors
      </p>
    );
  }

  const applyToSelection = (
    setter: (obj: fabric.FabricObject) => void,
  ) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (active instanceof fabric.ActiveSelection) {
      for (const obj of active.getObjects()) {
        setter(obj);
      }
    } else {
      setter(active);
    }
    canvas.requestRenderAll();
    refreshColors();
  };

  const handleFillChange = (color: string) => {
    applyToSelection((obj) => {
      const isText =
        obj instanceof fabric.IText ||
        obj instanceof fabric.FabricText;
      if (!isText) {
        obj.set('fill', color);
      }
    });
  };

  const handleStrokeChange = (color: string) => {
    applyToSelection((obj) => {
      const isText =
        obj instanceof fabric.IText ||
        obj instanceof fabric.FabricText;
      if (!isText) {
        obj.set('stroke', color);
        if (!obj.strokeWidth || obj.strokeWidth === 0) {
          obj.set('strokeWidth', 2);
        }
      }
    });
  };

  const handleTextColorChange = (color: string) => {
    applyToSelection((obj) => {
      const isText =
        obj instanceof fabric.IText ||
        obj instanceof fabric.FabricText;
      if (isText) {
        obj.set('fill', color);
      }
    });
  };

  // Theme quick-pick colors
  const quickColors = [
    posterDoc.theme.primary,
    posterDoc.theme.secondary,
    posterDoc.theme.accent,
    posterDoc.theme.textColor,
    posterDoc.theme.background,
    '#C8102E', // prohibition red
    '#FFD100', // warning yellow
    '#003DA5', // mandatory blue
    '#007A33', // safe green
    '#000000',
    '#FFFFFF',
    '#6B7280', // gray
  ];

  // Deduplicate
  const uniqueColors = [...new Set(quickColors)];

  return (
    <div className="space-y-3">
      {/* Shape colors */}
      {colors.hasShape && colors.fill !== null && (
        <ColorRow label="Fill" value={colors.fill} onChange={handleFillChange} />
      )}
      {colors.hasShape && colors.stroke !== null && (
        <ColorRow label="Stroke" value={colors.stroke} onChange={handleStrokeChange} />
      )}

      {/* Text color */}
      {colors.hasText && colors.textFill !== null && (
        <ColorRow label="Text Color" value={colors.textFill} onChange={handleTextColorChange} />
      )}

      {/* Quick-pick palette */}
      <div>
        <span className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
          Quick Colors
        </span>
        <div className="flex flex-wrap gap-1.5">
          {uniqueColors.map((c) => (
            <ThemeSwatch
              key={c}
              color={c}
              active={false}
              onClick={() => {
                // Apply to the most relevant property
                if (colors.hasText && colors.textFill !== null) {
                  handleTextColorChange(c);
                } else if (colors.hasShape && colors.fill !== null) {
                  handleFillChange(c);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
