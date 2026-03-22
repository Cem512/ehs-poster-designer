import { useState, useRef } from 'react';
import { X, FileDown, Image, FileCode, FileJson, Loader2, Check, Upload } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';
import { usePosterStore } from '../../store/poster-store';
import { getFabricCanvas } from '../../canvas/FabricCanvas';
import { exportPoster, loadFromJSON } from './export-utils';
import type { ExportFormat, ExportDPI } from './export-utils';

const FORMAT_OPTIONS: { id: ExportFormat; icon: typeof FileDown; label: string; desc: string }[] = [
  { id: 'pdf', icon: FileDown, label: 'PDF', desc: 'Print-ready document' },
  { id: 'png', icon: Image, label: 'PNG', desc: 'High-res raster image' },
  { id: 'svg', icon: FileCode, label: 'SVG', desc: 'Scalable vector graphic' },
  { id: 'json', icon: FileJson, label: 'Project', desc: 'Save for later editing' },
];

const DPI_OPTIONS: { value: ExportDPI; label: string; desc: string }[] = [
  { value: 150, label: '150 DPI', desc: 'Draft / review' },
  { value: 300, label: '300 DPI', desc: 'Production quality' },
];

export default function ExportDialog() {
  const { exportDialogOpen, setExportDialogOpen } = useUIStore();
  const posterDoc = usePosterStore((s) => s.document);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [dpi, setDpi] = useState<ExportDPI>(300);
  const [bleed, setBleed] = useState(false);
  const [cropMarks, setCropMarks] = useState(false);
  const [filename, setFilename] = useState(() => {
    // Generate a filesystem-friendly name from the poster name
    const name = posterDoc.name && posterDoc.name !== 'Untitled Poster'
      ? posterDoc.name
      : 'Safety-Poster';
    return name
      .replace(/\s*—\s*/g, '-')  // em-dash to hyphen
      .replace(/\s+/g, '-')       // spaces to hyphens
      .replace(/[^a-zA-Z0-9\-_]/g, ''); // strip special chars
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const loadInputRef = useRef<HTMLInputElement>(null);

  if (!exportDialogOpen) return null;

  const handleExport = async () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      await exportPoster(canvas, posterDoc, {
        format,
        dpi,
        bleed,
        cropMarks,
        filename: filename || 'safety-poster',
      }, setProgress);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setProgress(null);
      }, 2000);
    } catch (err) {
      console.error('Export error:', err);
      setError(String(err));
      setProgress(null);
    }
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = getFabricCanvas();
    if (!canvas) return;

    try {
      const docData = await loadFromJSON(canvas, file);
      if (docData) {
        // Update poster store with loaded data
        const store = usePosterStore.getState();
        store.setName(docData.name);
        setExportDialogOpen(false);
      }
    } catch (err) {
      setError(`Failed to load: ${err}`);
    }

    e.target.value = '';
  };

  const isExporting = progress !== null && !success;

  // Calculate estimated file size
  const { width, height } = posterDoc.size;
  const pxW = Math.round((width / 25.4) * dpi);
  const pxH = Math.round((height / 25.4) * dpi);
  const estimatedMB = format === 'png'
    ? ((pxW * pxH * 4) / 1024 / 1024).toFixed(1)
    : format === 'pdf'
      ? ((pxW * pxH * 3) / 1024 / 1024 * 0.3).toFixed(1)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isExporting) setExportDialogOpen(false); }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-bold">Export Poster</h2>
          <button
            onClick={() => !isExporting && setExportDialogOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Format selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  disabled={isExporting}
                  className="p-3 rounded-lg text-center transition-all"
                  style={{
                    backgroundColor: format === id ? 'var(--color-surface-hover)' : 'transparent',
                    border: `2px solid ${format === id ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                    opacity: isExporting ? 0.5 : 1,
                  }}
                >
                  <Icon size={20} className="mx-auto mb-1" style={{ color: format === id ? '#003DA5' : 'var(--color-text-muted)' }} />
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* DPI (only for PDF and PNG) */}
          {(format === 'pdf' || format === 'png') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Resolution</label>
              <div className="flex gap-2">
                {DPI_OPTIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setDpi(value)}
                    disabled={isExporting}
                    className="flex-1 py-2 px-3 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: dpi === value ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${dpi === value ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                      opacity: isExporting ? 0.5 : 1,
                    }}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{desc}</div>
                  </button>
                ))}
              </div>
              {estimatedMB && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Output: {pxW} × {pxH} px — Est. ~{estimatedMB} MB
                </p>
              )}
            </div>
          )}

          {/* PDF options */}
          {format === 'pdf' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={bleed}
                  onChange={(e) => setBleed(e.target.checked)}
                  disabled={isExporting}
                  className="accent-[#003DA5]"
                />
                3mm Bleed
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={cropMarks}
                  onChange={(e) => setCropMarks(e.target.checked)}
                  disabled={isExporting || !bleed}
                  className="accent-[#003DA5]"
                />
                Crop Marks
              </label>
            </div>
          )}

          {/* Filename */}
          <div>
            <label className="text-sm font-medium mb-1 block">Filename</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isExporting}
                className="flex-1 px-3 py-1.5 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                .{format === 'json' ? 'json' : format}
              </span>
            </div>
          </div>

          {/* Progress */}
          {progress !== null && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: success ? '#007A33' : '#003DA5',
                  }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                {success ? 'Export complete!' : `Exporting... ${progress}%`}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#C8102E20', color: '#C8102E', border: '1px solid #C8102E40' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => loadInputRef.current?.click()}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                opacity: isExporting ? 0.5 : 1,
              }}
            >
              <Upload size={14} />
              Load Project
            </button>
            <input
              ref={loadInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleLoad}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setExportDialogOpen(false)}
              disabled={isExporting}
              className="px-4 py-1.5 rounded text-sm transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: success ? '#007A33' : 'var(--color-mandatory, #003DA5)',
                color: '#fff',
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Exporting...
                </>
              ) : success ? (
                <>
                  <Check size={14} />
                  Done!
                </>
              ) : (
                <>
                  <FileDown size={14} />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
