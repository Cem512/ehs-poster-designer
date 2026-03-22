import { useRef, useState, useCallback, useEffect } from 'react';
import { ShieldAlert, LayoutTemplate, Frame, Shapes, Palette, ImagePlus, RectangleHorizontal, Circle, Minus, ArrowRight, X, Upload, Trash2, Plus } from 'lucide-react';
import * as fabric from 'fabric';
import { useUIStore, type LeftPanelTab } from '../../store/ui-store';
import { usePosterStore } from '../../store/poster-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { getPosterDimensionsPx, mmToPx } from '../../constants/paper-sizes';
import PictogramPanel from '../../features/pictograms/PictogramPanel';
import BorderPanel from '../../features/borders/BorderPanel';
import TemplatePanel from '../../features/templates/TemplatePanel';

const tabs: { id: LeftPanelTab; icon: typeof ShieldAlert; label: string; tabLabel: string }[] = [
  { id: 'pictograms', icon: ShieldAlert, label: 'Pictograms', tabLabel: 'Signs' },
  { id: 'templates', icon: LayoutTemplate, label: 'Templates', tabLabel: 'Layout' },
  { id: 'borders', icon: Frame, label: 'Borders', tabLabel: 'Border' },
  { id: 'elements', icon: Shapes, label: 'Elements', tabLabel: 'Shapes' },
  { id: 'brand-kit', icon: Palette, label: 'Brand Kit', tabLabel: 'Brand' },
];

export default function LeftPanel() {
  const { leftPanelTab, setLeftPanelTab, setLeftPanelOpen } = useUIStore();

  return (
    <div
      className="flex h-full border-r"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Tab icons with labels */}
      <div
        className="w-14 flex flex-col items-center py-2 gap-0.5 border-r shrink-0"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {tabs.map(({ id, icon: Icon, label, tabLabel }) => (
          <button
            key={id}
            title={label}
            onClick={() => setLeftPanelTab(id)}
            className="w-[52px] py-1.5 flex flex-col items-center justify-center rounded transition-colors gap-0.5"
            style={{
              backgroundColor: leftPanelTab === id ? 'var(--color-surface-hover)' : 'transparent',
              color: leftPanelTab === id ? 'var(--color-text)' : 'var(--color-text-muted)',
            }}
          >
            <Icon size={16} />
            <span className="text-[9px] leading-tight font-medium">{tabLabel}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div
        className="w-64 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-medium">{tabs.find(t => t.id === leftPanelTab)?.label}</h3>
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors opacity-60 hover:opacity-100"
            style={{ color: 'var(--color-text-muted)' }}
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {leftPanelTab === 'pictograms' && <PictogramPanel />}
          {leftPanelTab === 'borders' && <BorderPanel />}
          {leftPanelTab === 'templates' && <TemplatePanel />}
          {leftPanelTab === 'elements' && <ElementsPanel />}
          {leftPanelTab === 'brand-kit' && <BrandKitPanel />}
        </div>
      </div>
    </div>
  );
}

function ElementsPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterDoc = usePosterStore((s) => s.document);

  const addImageToCanvas = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const maxW = dims.width * 0.6;
        const maxH = dims.height * 0.4;
        const scale = Math.min(maxW / img.width!, maxH / img.height!, 1);
        img.scaleX = scale;
        img.scaleY = scale;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      };
      imgEl.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addShape = (type: 'rect' | 'circle' | 'line' | 'arrow' | 'divider') => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
    const cx = dims.width / 2;
    const cy = dims.height / 2;

    let obj: fabric.FabricObject;
    switch (type) {
      case 'rect':
        obj = new fabric.Rect({
          left: cx, top: cy, width: mmToPx(60), height: mmToPx(40),
          fill: 'transparent', stroke: posterDoc.theme.primary, strokeWidth: 2,
          originX: 'center', originY: 'center',
        });
        break;
      case 'circle':
        obj = new fabric.Circle({
          left: cx, top: cy, radius: mmToPx(25),
          fill: 'transparent', stroke: posterDoc.theme.primary, strokeWidth: 2,
          originX: 'center', originY: 'center',
        });
        break;
      case 'line':
        obj = new fabric.Line([cx - mmToPx(40), cy, cx + mmToPx(40), cy], {
          stroke: posterDoc.theme.primary, strokeWidth: 2,
        });
        break;
      case 'divider':
        obj = new fabric.Rect({
          left: mmToPx(posterDoc.border.thickness + 4),
          top: cy,
          width: dims.width - 2 * mmToPx(posterDoc.border.thickness + 4),
          height: mmToPx(3),
          fill: posterDoc.theme.primary,
          originY: 'center',
        });
        break;
      case 'arrow':
        obj = new fabric.Line([cx - mmToPx(30), cy, cx + mmToPx(30), cy], {
          stroke: posterDoc.theme.primary, strokeWidth: 3,
        });
        break;
      default:
        return;
    }

    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Images
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2 p-3 rounded-lg text-sm transition-colors"
          style={{ border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <ImagePlus size={18} />
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={addImageToCanvas}
        />
        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          JPG, PNG, SVG. For print quality, use high-resolution images (300 DPI).
        </p>
      </div>

      {/* Shapes */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Shapes
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ShapeButton icon={RectangleHorizontal} label="Rectangle" onClick={() => addShape('rect')} />
          <ShapeButton icon={Circle} label="Circle" onClick={() => addShape('circle')} />
          <ShapeButton icon={Minus} label="Line" onClick={() => addShape('line')} />
          <ShapeButton icon={ArrowRight} label="Arrow" onClick={() => addShape('arrow')} />
        </div>
      </div>

      {/* Dividers */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Dividers
        </p>
        <button
          onClick={() => addShape('divider')}
          className="w-full p-2 rounded text-xs transition-colors flex items-center gap-2"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <div className="flex-1 h-1 rounded" style={{ backgroundColor: posterDoc.theme.primary }} />
          Section Divider
        </button>
      </div>
    </div>
  );
}

function ShapeButton({ icon: Icon, label, onClick }: { icon: typeof Shapes; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-3 rounded transition-colors"
      style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
    >
      <Icon size={20} />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

const BRAND_KIT_STORAGE_KEY = 'ehs-brand-kit';

/** Load brand kit from localStorage */
function loadBrandKit(): { logoUrl: string | null; brandColors: string[] } {
  try {
    const raw = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        logoUrl: data.logoUrl ?? null,
        brandColors: Array.isArray(data.brandColors) ? data.brandColors : [],
      };
    }
  } catch {
    // Corrupted data — ignore
  }
  return { logoUrl: null, brandColors: [] };
}

/** Save brand kit to localStorage */
function saveBrandKit(logoUrl: string | null, brandColors: string[]) {
  try {
    localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify({ logoUrl, brandColors }));
  } catch {
    // localStorage full — ignore silently
    console.warn('Brand kit save failed — localStorage may be full');
  }
}

function BrandKitPanel() {
  const posterDoc = usePosterStore((s) => s.document);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => loadBrandKit().logoUrl);
  const [brandColors, setBrandColors] = useState<string[]>(() => loadBrandKit().brandColors);
  const [newColor, setNewColor] = useState('#003DA5');

  // Persist to localStorage whenever logoUrl or brandColors change
  useEffect(() => {
    saveBrandKit(logoUrl, brandColors);
  }, [logoUrl, brandColors]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const addLogoToCanvas = useCallback(() => {
    if (!logoUrl) return;
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const imgEl = new Image();
    imgEl.onload = () => {
      const dims = getPosterDimensionsPx(posterDoc.size, posterDoc.orientation);
      const img = new fabric.FabricImage(imgEl, {
        left: dims.width / 2,
        top: dims.height * 0.5,
        originX: 'center',
        originY: 'center',
      });
      const maxW = dims.width * 0.3;
      const maxH = dims.height * 0.15;
      const scale = Math.min(maxW / img.width!, maxH / img.height!, 1);
      img.scaleX = scale;
      img.scaleY = scale;
      (img as any)._customId = '__brand_logo__';
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    };
    imgEl.src = logoUrl;
  }, [logoUrl, posterDoc]);

  const addBrandColor = useCallback(() => {
    if (brandColors.includes(newColor)) return;
    setBrandColors((prev) => [...prev, newColor]);
  }, [newColor, brandColors]);

  const removeBrandColor = useCallback((color: string) => {
    setBrandColors((prev) => prev.filter((c) => c !== color));
  }, []);

  const applyColorToSelected = useCallback((color: string) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    if ('set' in active) {
      if (active.type?.includes('text') || active.type?.includes('Text')) {
        active.set('fill', color);
      } else {
        active.set('fill', color);
      }
      canvas.requestRenderAll();
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* Logo */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Company Logo
        </p>
        {logoUrl ? (
          <div className="space-y-2">
            <div
              className="w-full rounded-lg p-3 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              <img src={logoUrl} alt="Logo" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addLogoToCanvas}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-mandatory, #003DA5)', color: '#fff' }}
              >
                <ImagePlus size={12} />
                Add to Poster
              </button>
              <button
                onClick={() => setLogoUrl(null)}
                className="w-8 flex items-center justify-center rounded transition-colors"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                title="Remove logo"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 p-4 rounded-lg text-xs transition-colors"
            style={{ border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <Upload size={20} />
            <span>Upload logo (PNG, SVG, JPG)</span>
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Brand Colors */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Brand Colors
        </p>
        <p className="text-[10px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Save your brand colors here. Click a swatch to apply it to a selected element.
        </p>

        {/* Saved colors grid */}
        {brandColors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {brandColors.map((color) => (
              <div key={color} className="relative group flex flex-col items-center gap-0.5">
                <button
                  onClick={() => applyColorToSelected(color)}
                  className="w-8 h-8 rounded border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: color, borderColor: 'var(--color-border)' }}
                  title={`Apply ${color} to selected object`}
                />
                <span className="text-[8px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {color.toUpperCase()}
                </span>
                <button
                  onClick={() => removeBrandColor(color)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full items-center justify-center text-white hidden group-hover:flex"
                  style={{ backgroundColor: '#C8102E', fontSize: '8px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add color */}
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            title="Pick a color"
          />
          <span className="text-xs font-mono flex-1" style={{ color: 'var(--color-text-muted)' }}>
            {newColor.toUpperCase()}
          </span>
          <button
            onClick={addBrandColor}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </div>

      {/* Theme Colors reference */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Active Theme
        </p>
        <div className="flex gap-2">
          {[
            { color: posterDoc.theme.primary, label: 'Primary' },
            { color: posterDoc.theme.secondary, label: 'Secondary' },
            { color: posterDoc.theme.accent, label: 'Accent' },
          ].map(({ color, label }) => (
            <button
              key={label}
              onClick={() => applyColorToSelected(color)}
              className="flex flex-col items-center gap-1"
              title={`Apply ${label} (${color}) to selected`}
            >
              <div
                className="w-7 h-7 rounded border transition-transform hover:scale-110"
                style={{ backgroundColor: color, borderColor: 'var(--color-border)' }}
              />
              <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font reference */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Fonts
        </p>
        <div className="space-y-1">
          {[
            { name: 'Inter', usage: 'Default UI / body text' },
            { name: 'Arial Black', usage: 'Headers / signal words' },
          ].map(({ name, usage }) => (
            <div
              key={name}
              className="flex items-center justify-between py-1.5 px-2 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg)' }}
            >
              <span className="font-medium" style={{ fontFamily: name }}>{name}</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{usage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
