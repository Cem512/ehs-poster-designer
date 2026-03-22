import { useState } from 'react';
import { Shield, AlertTriangle, Heart, Flame, FlaskConical, Info, CheckCircle2 } from 'lucide-react';
import { usePosterStore } from '../../store/poster-store';
import { PAPER_SIZES } from '../../constants/paper-sizes';
import { SAFETY_THEMES, getDefaultThemeForPurpose } from '../../constants/safety-colors';
import { COMMON_DISTANCES } from '../../constants/readability-table';
import type { PaperSizeKey, Orientation, PosterPurpose, SafetyTheme } from '../../types/poster';

const PURPOSES: {
  id: PosterPurpose;
  icon: typeof Shield;
  label: string;
  desc: string;
  signalWord: string;
}[] = [
  { id: 'ppe', icon: Shield, label: 'PPE Required', desc: 'Personal protective equipment', signalWord: 'MANDATORY' },
  { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', desc: 'Hazardous area warnings', signalWord: 'DANGER' },
  { id: 'emergency', icon: Heart, label: 'Emergency', desc: 'Emergency procedures', signalWord: 'SAFETY' },
  { id: 'fire', icon: Flame, label: 'Fire Safety', desc: 'Fire equipment & evacuation', signalWord: 'DANGER' },
  { id: 'chemical', icon: FlaskConical, label: 'Chemical Hazard', desc: 'Chemical safety & GHS', signalWord: 'WARNING' },
  { id: 'general', icon: Info, label: 'General Safety', desc: 'General safety notices', signalWord: 'NOTICE' },
];

const FEATURES = [
  'ISO 7010 pictograms',
  '300 DPI print-ready',
  'PDF / PNG / SVG export',
];

const STEP_HINTS: Record<number, string> = {
  0: 'Choose the type of safety poster you need. Each purpose comes with a matching color theme and signal word.',
  1: 'Select the print size for your poster. A2 is the most common size for safety signage in workplaces.',
  2: 'Pick a color scheme. Colors follow the ISO 3864 standard used in safety signage worldwide.',
  3: 'Set the distance from which people will read this poster. This controls minimum font size recommendations.',
};

/** Real-world size comparisons for each paper size */
const SIZE_REFERENCES: Record<string, string> = {
  A0: 'Billboard-sized',
  A1: 'Flip chart',
  A2: 'Standard poster',
  A3: 'Tabloid / ledger',
  A4: 'Office paper',
};

/**
 * Height of each paper size in mm (portrait).
 * Person height reference: 1750mm (average adult).
 * Max visual height for the person: 180px → 1px ≈ 9.72mm
 */
const PERSON_HEIGHT_PX = 180;
const PERSON_HEIGHT_MM = 1750;
const SCALE = PERSON_HEIGHT_PX / PERSON_HEIGHT_MM;

function SizeComparisonVisual({
  sizeKey,
  orientation,
  theme,
}: {
  sizeKey: PaperSizeKey;
  orientation: Orientation;
  theme: SafetyTheme;
}) {
  if (sizeKey === 'CUSTOM') return null;
  const size = PAPER_SIZES[sizeKey as keyof typeof PAPER_SIZES];
  const w = orientation === 'landscape' ? size.height : size.width;
  const h = orientation === 'landscape' ? size.width : size.height;
  const posterW = Math.round(w * SCALE);
  const posterH = Math.round(h * SCALE);

  return (
    <div
      className="flex items-end gap-2 justify-center"
      style={{ height: PERSON_HEIGHT_PX + 16 }}
    >
      {/* Human silhouette */}
      <div className="flex flex-col items-center" style={{ height: PERSON_HEIGHT_PX }}>
        {/* Head */}
        <div
          className="rounded-full shrink-0"
          style={{
            width: 12,
            height: 12,
            backgroundColor: 'var(--color-text-muted)',
            opacity: 0.35,
          }}
        />
        {/* Body */}
        <div
          className="shrink-0 rounded-b-sm"
          style={{
            width: 16,
            height: PERSON_HEIGHT_PX * 0.33,
            backgroundColor: 'var(--color-text-muted)',
            opacity: 0.25,
            marginTop: 2,
            borderRadius: '3px 3px 0 0',
          }}
        />
        {/* Legs */}
        <div className="flex gap-[2px]" style={{ flexGrow: 1 }}>
          <div
            style={{
              width: 6,
              height: '100%',
              backgroundColor: 'var(--color-text-muted)',
              opacity: 0.2,
              borderRadius: '0 0 2px 2px',
            }}
          />
          <div
            style={{
              width: 6,
              height: '100%',
              backgroundColor: 'var(--color-text-muted)',
              opacity: 0.2,
              borderRadius: '0 0 2px 2px',
            }}
          />
        </div>
        <span className="text-[8px] mt-1 whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
          1.75 m
        </span>
      </div>

      {/* Poster rectangle (scaled) */}
      <div className="flex flex-col items-center" style={{ alignSelf: 'center' }}>
        <div
          className="rounded-sm overflow-hidden shrink-0 shadow-sm"
          style={{
            width: Math.max(posterW, 12),
            height: Math.max(posterH, 12),
            backgroundColor: theme.background,
            border: `1.5px solid ${theme.primary}`,
          }}
        >
          {/* Mini header band */}
          <div
            style={{
              width: '100%',
              height: '18%',
              backgroundColor: theme.primary,
            }}
          />
        </div>
        <span className="text-[8px] mt-1 font-medium whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
          {sizeKey}
        </span>
      </div>
    </div>
  );
}

/** Purpose-specific poster preview showing realistic layout structure */
function PurposePosterPreview({ purpose, theme, signalWord }: { purpose: PosterPurpose; theme: SafetyTheme; signalWord: string }) {
  const headerTextColor = theme.primary === '#FFD100' ? '#101820' : theme.background;
  const isDanger = purpose === 'danger' || purpose === 'fire';

  return (
    <div
      className="w-full rounded-sm overflow-hidden relative"
      style={{
        aspectRatio: '7/10',
        backgroundColor: theme.background,
        border: `2px solid ${theme.primary}`,
      }}
    >
      {/* Hazard stripe overlay for danger/fire */}
      {isDanger && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 3px,
              ${theme.primary}22 3px,
              ${theme.primary}22 6px
            )`,
          }}
        />
      )}

      {/* Header band */}
      <div
        className="w-full flex items-center justify-center relative"
        style={{
          height: '18%',
          backgroundColor: theme.primary,
        }}
      >
        <span
          className="text-[6px] sm:text-[7px] font-black tracking-wider"
          style={{ color: headerTextColor }}
        >
          {signalWord}
        </span>
      </div>

      {/* Content area — varies by purpose */}
      <div className="relative flex-1 px-[8%] py-[6%] flex flex-col" style={{ height: '72%' }}>
        {purpose === 'ppe' && (
          /* PPE: 2x2 grid of mandatory pictogram placeholders */
          <>
            <div className="grid grid-cols-2 gap-[6%] flex-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    aspectRatio: '1',
                    backgroundColor: theme.primary + '25',
                    border: `1px solid ${theme.primary}60`,
                  }}
                >
                  <div className="w-[40%] h-[40%] rounded-sm" style={{ backgroundColor: theme.primary + '50' }} />
                </div>
              ))}
            </div>
            <div className="mt-[6%] w-full h-[3px] rounded-full opacity-15" style={{ backgroundColor: theme.textColor }} />
          </>
        )}

        {purpose === 'danger' && (
          /* Danger: big warning icon + text area */
          <>
            <div className="flex justify-center mb-[6%]">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '40%',
                  aspectRatio: '1',
                  backgroundColor: theme.primary + '20',
                  border: `1.5px solid ${theme.primary}`,
                  borderRadius: '2px',
                }}
              >
                <span className="text-[8px] font-bold" style={{ color: theme.primary }}>⚠</span>
              </div>
            </div>
            <div className="space-y-[6%] flex-1">
              <div className="w-full h-[3px] rounded-full opacity-20" style={{ backgroundColor: theme.textColor }} />
              <div className="w-4/5 h-[3px] rounded-full opacity-12" style={{ backgroundColor: theme.textColor }} />
              <div className="w-3/5 h-[3px] rounded-full opacity-12" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}

        {purpose === 'emergency' && (
          /* Emergency: numbered steps (1-2-3) */
          <>
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-[6%] mb-[6%]">
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: '16%',
                    aspectRatio: '1',
                    backgroundColor: theme.primary,
                  }}
                >
                  <span className="text-[5px] font-bold" style={{ color: headerTextColor }}>{n}</span>
                </div>
                <div className="flex-1 space-y-[4px]">
                  <div className="w-full h-[2px] rounded-full opacity-15" style={{ backgroundColor: theme.textColor }} />
                  <div className="w-3/4 h-[2px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
                </div>
              </div>
            ))}
          </>
        )}

        {purpose === 'fire' && (
          /* Fire: extinguisher icon + exit icon side by side */
          <>
            <div className="flex gap-[8%] justify-center mb-[8%] flex-1">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-sm"
                  style={{
                    width: '35%',
                    aspectRatio: '1',
                    backgroundColor: theme.primary + '20',
                    border: `1px solid ${theme.primary}60`,
                  }}
                >
                  <div className="w-[35%] h-[50%] rounded-sm" style={{ backgroundColor: theme.primary + '50' }} />
                </div>
              ))}
            </div>
            <div className="space-y-[5%]">
              <div className="w-full h-[3px] rounded-full opacity-15" style={{ backgroundColor: theme.textColor }} />
              <div className="w-2/3 h-[3px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}

        {purpose === 'chemical' && (
          /* Chemical: GHS diamond + SDS info area */
          <>
            <div className="flex justify-center mb-[6%]">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '32%',
                  aspectRatio: '1',
                  backgroundColor: theme.primary + '30',
                  border: `1.5px solid ${theme.primary}`,
                  transform: 'rotate(45deg)',
                  borderRadius: '2px',
                }}
              >
                <span className="text-[6px]" style={{ transform: 'rotate(-45deg)', color: theme.primary }}>☠</span>
              </div>
            </div>
            <div
              className="rounded p-[6%] flex-1"
              style={{ border: `1px solid ${theme.primary}40`, backgroundColor: theme.primary + '08' }}
            >
              <div className="w-3/4 h-[2px] rounded-full opacity-20 mb-[8%]" style={{ backgroundColor: theme.textColor }} />
              <div className="w-full h-[2px] rounded-full opacity-10 mb-[6%]" style={{ backgroundColor: theme.textColor }} />
              <div className="w-5/6 h-[2px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}

        {purpose === 'general' && (
          /* General: clean multi-section layout */
          <>
            <div className="w-2/3 h-[3px] rounded-full opacity-20 mb-[8%]" style={{ backgroundColor: theme.textColor }} />
            <div className="flex gap-[6%] mb-[8%] flex-1">
              <div
                className="rounded-sm flex-1"
                style={{ backgroundColor: theme.primary + '12', border: `1px solid ${theme.primary}30` }}
              />
              <div
                className="rounded-sm flex-1"
                style={{ backgroundColor: theme.primary + '12', border: `1px solid ${theme.primary}30` }}
              />
            </div>
            <div className="space-y-[5%]">
              <div className="w-full h-[2px] rounded-full opacity-12" style={{ backgroundColor: theme.textColor }} />
              <div className="w-4/5 h-[2px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}
      </div>

      {/* Footer band */}
      <div
        className="w-full absolute bottom-0"
        style={{
          height: '10%',
          backgroundColor: theme.primary,
          opacity: 0.25,
        }}
      />
    </div>
  );
}

export default function PosterSetupDialog() {
  const { completeSetup } = usePosterStore();
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<PosterPurpose>('general');
  const [sizeKey, setSizeKey] = useState<PaperSizeKey>('A2');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [theme, setTheme] = useState<SafetyTheme>(SAFETY_THEMES[4]);
  const [viewingDistance, setViewingDistance] = useState(5);

  const handlePurposeSelect = (p: PosterPurpose) => {
    setPurpose(p);
    setTheme(getDefaultThemeForPurpose(p));
  };

  const handleComplete = () => {
    completeSetup({ purpose, sizeKey, orientation, theme, viewingDistance });
  };

  const steps = ['Purpose', 'Size', 'Theme', 'Viewing'];

  // Get the display label for purpose (for the summary)
  const purposeLabel = PURPOSES.find(p => p.id === purpose)?.label ?? purpose;

  return (
    <div className="h-full flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">EHS Poster Designer</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Design print-ready safety posters with internationally recognized pictograms
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {FEATURES.map((feat) => (
              <span key={feat} className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={12} style={{ color: '#007A33' }} />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-4 sm:px-8 flex gap-2 mb-2 sm:mb-3 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{
                  backgroundColor: i <= step ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)',
                  color: i <= step ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: i === step ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step hint */}
        <div className="px-4 sm:px-8 mb-3">
          <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {STEP_HINTS[step]}
          </p>
        </div>

        {/* Step content */}
        <div className="px-4 sm:px-8 pb-4 min-h-[200px] sm:min-h-[280px]">
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {PURPOSES.map(({ id, label, desc, signalWord: sw }) => {
                const t = getDefaultThemeForPurpose(id);
                return (
                  <button
                    key={id}
                    onClick={() => handlePurposeSelect(id)}
                    className="p-2 sm:p-3 rounded-lg text-left transition-all flex flex-col"
                    style={{
                      backgroundColor: purpose === id ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${purpose === id ? t.primary : 'var(--color-border)'}`,
                    }}
                  >
                    {/* Purpose-specific poster preview */}
                    <div className="w-full mb-2 px-[10%]">
                      <PurposePosterPreview purpose={id} theme={t} signalWord={sw} />
                    </div>
                    <div className="text-xs sm:text-sm font-medium">{label}</div>
                    <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4 sm:gap-6">
                {/* Left: size buttons + orientation */}
                <div className="flex-1 space-y-4">
                  {/* Paper size */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Paper Size</label>
                    <div className="space-y-1.5">
                      {(Object.keys(PAPER_SIZES) as Array<keyof typeof PAPER_SIZES>).map((key) => (
                        <button
                          key={key}
                          onClick={() => setSizeKey(key)}
                          className="w-full py-2 px-3 rounded-lg text-left transition-all flex items-center gap-3"
                          style={{
                            backgroundColor: sizeKey === key ? 'var(--color-surface-hover)' : 'transparent',
                            border: `2px solid ${sizeKey === key ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                          }}
                        >
                          <span className="text-sm font-bold w-7">{key}</span>
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            {PAPER_SIZES[key].width}×{PAPER_SIZES[key].height} mm
                          </span>
                          <span className="ml-auto text-[10px] italic" style={{ color: 'var(--color-text-muted)' }}>
                            {SIZE_REFERENCES[key]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Orientation</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrientation('portrait')}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg flex-1 transition-all"
                        style={{
                          backgroundColor: orientation === 'portrait' ? 'var(--color-surface-hover)' : 'transparent',
                          border: `2px solid ${orientation === 'portrait' ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div className="w-4 h-6 rounded-sm" style={{ border: '2px solid var(--color-text-muted)' }} />
                        <span className="text-xs">Portrait</span>
                      </button>
                      <button
                        onClick={() => setOrientation('landscape')}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg flex-1 transition-all"
                        style={{
                          backgroundColor: orientation === 'landscape' ? 'var(--color-surface-hover)' : 'transparent',
                          border: `2px solid ${orientation === 'landscape' ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div className="w-6 h-4 rounded-sm" style={{ border: '2px solid var(--color-text-muted)' }} />
                        <span className="text-xs">Landscape</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: visual scale comparison with human silhouette */}
                <div
                  className="hidden sm:flex flex-col items-center justify-end rounded-lg px-3 pt-2 pb-3"
                  style={{
                    width: 160,
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p className="text-[9px] font-medium mb-2 self-start" style={{ color: 'var(--color-text-muted)' }}>
                    Scale comparison
                  </p>
                  <SizeComparisonVisual
                    sizeKey={sizeKey}
                    orientation={orientation}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-sm font-medium mb-3 block">Color Theme</label>
              <div className="space-y-2">
                {SAFETY_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.id === t.id ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${theme.id === t.id ? t.primary : 'var(--color-border)'}`,
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: t.primary }} />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: t.secondary }} />
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: t.background, borderColor: 'var(--color-border)' }} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Signal word: {t.signalWord}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Intended Viewing Distance: <strong>{viewingDistance}m</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={viewingDistance}
                  onChange={(e) => setViewingDistance(Number(e.target.value))}
                  className="w-full accent-[#003DA5]"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span>1m</span>
                  <span>5m</span>
                  <span>10m</span>
                  <span>15m</span>
                  <span>20m</span>
                </div>
              </div>

              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-2">
                {COMMON_DISTANCES.slice(0, 6).map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setViewingDistance(value)}
                    className="py-2 px-3 rounded text-xs transition-all"
                    style={{
                      backgroundColor: viewingDistance === value ? 'var(--color-surface-hover)' : 'transparent',
                      border: `1px solid ${viewingDistance === value ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}
              >
                <h4 className="text-sm font-medium mb-2">Poster Summary</h4>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Purpose</span>
                  <span>{purposeLabel}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Size</span>
                  <span>{sizeKey} ({orientation})</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Theme</span>
                  <span>{theme.label}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Viewing Distance</span>
                  <span>{viewingDistance}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="px-4 sm:px-8 py-4 flex justify-between border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 rounded text-sm transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: step === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-mandatory, #003DA5)', color: '#fff' }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: '#007A33', color: '#fff' }}
            >
              Create Poster
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
