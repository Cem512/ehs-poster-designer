import { useState } from 'react';
import { CheckCircle2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n/i18n';
import { usePosterStore } from '../../store/poster-store';
import { PAPER_SIZES } from '../../constants/paper-sizes';
import { SAFETY_THEMES, getDefaultThemeForPurpose } from '../../constants/safety-colors';
import { COMMON_DISTANCES } from '../../constants/readability-table';
import type { PaperSizeKey, Orientation, PosterPurpose, SafetyTheme } from '../../types/poster';

const PURPOSE_IDS: PosterPurpose[] = ['ppe', 'danger', 'emergency', 'fire', 'chemical', 'general'];

/** Signal words shown on poster preview thumbnails (not translated — these are ISO standard) */
const SIGNAL_WORDS: Record<PosterPurpose, string> = {
  ppe: 'MANDATORY',
  danger: 'DANGER',
  emergency: 'SAFETY',
  fire: 'FIRE',
  chemical: 'WARNING',
  general: 'NOTICE',
};

const FEATURE_KEYS = ['features.iso', 'features.dpi', 'features.export'] as const;

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
        <div className="rounded-full shrink-0" style={{ width: 12, height: 12, backgroundColor: 'var(--color-text-muted)', opacity: 0.35 }} />
        <div className="shrink-0 rounded-b-sm" style={{ width: 16, height: PERSON_HEIGHT_PX * 0.33, backgroundColor: 'var(--color-text-muted)', opacity: 0.25, marginTop: 2, borderRadius: '3px 3px 0 0' }} />
        <div className="flex gap-[2px]" style={{ flexGrow: 1 }}>
          <div style={{ width: 6, height: '100%', backgroundColor: 'var(--color-text-muted)', opacity: 0.2, borderRadius: '0 0 2px 2px' }} />
          <div style={{ width: 6, height: '100%', backgroundColor: 'var(--color-text-muted)', opacity: 0.2, borderRadius: '0 0 2px 2px' }} />
        </div>
        <span className="text-[8px] mt-1 whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>1.75 m</span>
      </div>
      {/* Poster rectangle (scaled) */}
      <div className="flex flex-col items-center" style={{ alignSelf: 'center' }}>
        <div className="rounded-sm overflow-hidden shrink-0 shadow-sm" style={{ width: Math.max(posterW, 12), height: Math.max(posterH, 12), backgroundColor: theme.background, border: `1.5px solid ${theme.primary}` }}>
          <div style={{ width: '100%', height: '18%', backgroundColor: theme.primary }} />
        </div>
        <span className="text-[8px] mt-1 font-medium whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{sizeKey}</span>
      </div>
    </div>
  );
}

/** Purpose-specific poster preview showing realistic layout structure */
function PurposePosterPreview({ purpose, theme, signalWord }: { purpose: PosterPurpose; theme: SafetyTheme; signalWord: string }) {
  const headerTextColor = theme.primary === '#FFD100' ? '#101820' : theme.background;
  const isDanger = purpose === 'danger' || purpose === 'fire';

  return (
    <div className="w-full rounded-sm overflow-hidden relative" style={{ aspectRatio: '3/4', backgroundColor: theme.background, border: `2px solid ${theme.primary}` }}>
      {isDanger && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(-45deg, transparent, transparent 3px, ${theme.primary}22 3px, ${theme.primary}22 6px)` }} />
      )}
      <div className="w-full flex items-center justify-center relative" style={{ height: '18%', backgroundColor: theme.primary }}>
        <span className="text-[10px] sm:text-[13px] lg:text-[16px] font-black tracking-wider" style={{ color: headerTextColor }}>{signalWord}</span>
      </div>
      <div className="relative flex-1 px-[8%] py-[6%] flex flex-col" style={{ height: '72%' }}>
        {purpose === 'ppe' && (
          <>
            <div className="grid grid-cols-2 gap-[6%] flex-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-full flex items-center justify-center" style={{ aspectRatio: '1', backgroundColor: theme.primary + '25', border: `1px solid ${theme.primary}60` }}>
                  <div className="w-[40%] h-[40%] rounded-sm" style={{ backgroundColor: theme.primary + '50' }} />
                </div>
              ))}
            </div>
            <div className="mt-[6%] w-full h-[3px] rounded-full opacity-15" style={{ backgroundColor: theme.textColor }} />
          </>
        )}
        {purpose === 'danger' && (
          <>
            <div className="flex justify-center mb-[6%]">
              <div className="flex items-center justify-center" style={{ width: '40%', aspectRatio: '1', backgroundColor: theme.primary + '20', border: `1.5px solid ${theme.primary}`, borderRadius: '2px' }}>
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
          <>
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-[6%] mb-[6%]">
                <div className="shrink-0 rounded-full flex items-center justify-center" style={{ width: '16%', aspectRatio: '1', backgroundColor: theme.primary }}>
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
          <>
            <div className="flex gap-[8%] justify-center mb-[8%] flex-1">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center justify-center rounded-sm" style={{ width: '35%', aspectRatio: '1', backgroundColor: theme.primary + '20', border: `1px solid ${theme.primary}60` }}>
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
          <>
            <div className="flex justify-center mb-[6%]">
              <div className="flex items-center justify-center" style={{ width: '32%', aspectRatio: '1', backgroundColor: theme.primary + '30', border: `1.5px solid ${theme.primary}`, transform: 'rotate(45deg)', borderRadius: '2px' }}>
                <span className="text-[6px]" style={{ transform: 'rotate(-45deg)', color: theme.primary }}>☠</span>
              </div>
            </div>
            <div className="rounded p-[6%] flex-1" style={{ border: `1px solid ${theme.primary}40`, backgroundColor: theme.primary + '08' }}>
              <div className="w-3/4 h-[2px] rounded-full opacity-20 mb-[8%]" style={{ backgroundColor: theme.textColor }} />
              <div className="w-full h-[2px] rounded-full opacity-10 mb-[6%]" style={{ backgroundColor: theme.textColor }} />
              <div className="w-5/6 h-[2px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}
        {purpose === 'general' && (
          <>
            <div className="w-2/3 h-[3px] rounded-full opacity-20 mb-[8%]" style={{ backgroundColor: theme.textColor }} />
            <div className="flex gap-[6%] mb-[8%] flex-1">
              <div className="rounded-sm flex-1" style={{ backgroundColor: theme.primary + '12', border: `1px solid ${theme.primary}30` }} />
              <div className="rounded-sm flex-1" style={{ backgroundColor: theme.primary + '12', border: `1px solid ${theme.primary}30` }} />
            </div>
            <div className="space-y-[5%]">
              <div className="w-full h-[2px] rounded-full opacity-12" style={{ backgroundColor: theme.textColor }} />
              <div className="w-4/5 h-[2px] rounded-full opacity-10" style={{ backgroundColor: theme.textColor }} />
            </div>
          </>
        )}
      </div>
      <div className="w-full absolute bottom-0" style={{ height: '10%', backgroundColor: theme.primary, opacity: 0.25 }} />
    </div>
  );
}

export default function PosterSetupDialog() {
  const { t, i18n } = useTranslation();
  const { completeSetup } = usePosterStore();
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<PosterPurpose | null>(null);
  const [sizeKey, setSizeKey] = useState<PaperSizeKey>('A2');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [theme, setTheme] = useState<SafetyTheme>(SAFETY_THEMES[4]);
  const [viewingDistance, setViewingDistance] = useState(5);

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
  };

  const handlePurposeSelect = (p: PosterPurpose) => {
    setPurpose(p);
    setTheme(getDefaultThemeForPurpose(p));
  };

  const handleComplete = () => {
    completeSetup({ purpose: purpose!, sizeKey, orientation, theme, viewingDistance });
  };

  const STEP_KEYS = ['language', 'purpose', 'size', 'theme', 'viewing'] as const;
  const steps = STEP_KEYS.map((key) => t(`wizard.steps.${key}`));

  // Get the display label for purpose (for the summary)
  const purposeLabel = purpose ? t(`wizard.purpose.${purpose}.label`) : '—';

  // Disable Next on step 1 (purpose) if no purpose selected
  const canProceed = step !== 1 || purpose !== null;

  return (
    <div className="h-full flex items-center justify-center p-4 lg:p-8 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-3xl lg:max-w-5xl xl:max-w-[85vw] 2xl:max-w-[1600px] max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-4rem)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 lg:pt-10 pb-3 lg:pb-4 shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 lg:mb-2">{t('app.title')}</h1>
          <p className="text-sm sm:text-base lg:text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {t('app.subtitle')}
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap gap-x-4 lg:gap-x-6 gap-y-1 mt-3 lg:mt-4">
            {FEATURE_KEYS.map((key) => (
              <span key={key} className="flex items-center gap-1.5 text-xs sm:text-sm lg:text-base" style={{ color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={14} className="lg:!w-[18px] lg:!h-[18px]" style={{ color: '#007A33' }} />
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-4 sm:px-8 lg:px-12 flex gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4 overflow-x-auto shrink-0">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 lg:gap-3">
              <div
                className="w-7 h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-sm lg:text-base font-semibold shrink-0"
                style={{
                  backgroundColor: i <= step ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)',
                  color: i <= step ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {i === 0 ? <Globe size={14} /> : i}
              </div>
              <span className="text-sm lg:text-base whitespace-nowrap font-medium" style={{ color: i === step ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 lg:w-12 h-px shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step hint */}
        <div className="px-4 sm:px-8 lg:px-12 mb-3 lg:mb-4 shrink-0">
          <p className="text-xs sm:text-sm lg:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {t(`wizard.hints.${STEP_KEYS[step]}`)}
          </p>
        </div>

        {/* Step content */}
        <div className="px-4 sm:px-8 lg:px-12 pb-4 lg:pb-6 min-h-[200px] sm:min-h-[280px] overflow-y-auto flex-1">

          {/* Step 0: Language Selection */}
          {step === 0 && (
            <div>
              <label className="text-sm lg:text-base font-medium mb-3 lg:mb-4 block">{t('wizard.language.label')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="py-3 lg:py-4 px-4 lg:px-5 rounded-lg text-left transition-all flex items-center gap-3 lg:gap-4"
                    style={{
                      backgroundColor: i18n.language === lang.code ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${i18n.language === lang.code ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                    }}
                  >
                    <span className="text-xl lg:text-2xl">{lang.flag}</span>
                    <div>
                      <div className="text-sm lg:text-base font-semibold">{lang.label}</div>
                    </div>
                    {i18n.language === lang.code && (
                      <CheckCircle2 size={18} className="ml-auto" style={{ color: 'var(--color-mandatory, #003DA5)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {PURPOSE_IDS.map((id) => {
                const thm = getDefaultThemeForPurpose(id);
                return (
                  <button
                    key={id}
                    onClick={() => handlePurposeSelect(id)}
                    className="p-2 sm:p-3 lg:p-4 rounded-lg text-left transition-all flex flex-col"
                    style={{
                      backgroundColor: purpose === id ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${purpose === id ? thm.primary : 'var(--color-border)'}`,
                      opacity: purpose === null || purpose === id ? 1 : 0.7,
                    }}
                  >
                    <div className="w-full mb-2 px-[10%] lg:px-[15%]">
                      <PurposePosterPreview purpose={id} theme={thm} signalWord={SIGNAL_WORDS[id]} />
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-semibold">{t(`wizard.purpose.${id}.label`)}</div>
                    <div className="text-xs sm:text-sm lg:text-base mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t(`wizard.purpose.${id}.desc`)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Size */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-4 sm:gap-6 lg:gap-8">
                <div className="flex-1 space-y-4 lg:space-y-5">
                  <div>
                    <label className="text-sm lg:text-base font-medium mb-2 lg:mb-3 block">{t('wizard.size.paperSize')}</label>
                    <div className="space-y-1.5 lg:space-y-2">
                      {(Object.keys(PAPER_SIZES) as Array<keyof typeof PAPER_SIZES>).map((key) => (
                        <button
                          key={key}
                          onClick={() => setSizeKey(key)}
                          className="w-full py-2 lg:py-3 px-3 lg:px-4 rounded-lg text-left transition-all flex items-center gap-3"
                          style={{
                            backgroundColor: sizeKey === key ? 'var(--color-surface-hover)' : 'transparent',
                            border: `2px solid ${sizeKey === key ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                          }}
                        >
                          <span className="text-sm lg:text-base font-bold w-7 lg:w-8">{key}</span>
                          <span className="text-[10px] lg:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {PAPER_SIZES[key].width}×{PAPER_SIZES[key].height} mm
                          </span>
                          <span className="ml-auto text-[10px] lg:text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                            {t(`wizard.size.sizeRef.${key}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm lg:text-base font-medium mb-2 lg:mb-3 block">{t('wizard.size.orientation')}</label>
                    <div className="flex gap-2 lg:gap-3">
                      <button
                        onClick={() => setOrientation('portrait')}
                        className="flex items-center gap-2 py-2 lg:py-3 px-3 lg:px-4 rounded-lg flex-1 transition-all"
                        style={{
                          backgroundColor: orientation === 'portrait' ? 'var(--color-surface-hover)' : 'transparent',
                          border: `2px solid ${orientation === 'portrait' ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div className="w-4 h-6 rounded-sm" style={{ border: '2px solid var(--color-text-muted)' }} />
                        <span className="text-xs lg:text-sm">{t('wizard.size.portrait')}</span>
                      </button>
                      <button
                        onClick={() => setOrientation('landscape')}
                        className="flex items-center gap-2 py-2 lg:py-3 px-3 lg:px-4 rounded-lg flex-1 transition-all"
                        style={{
                          backgroundColor: orientation === 'landscape' ? 'var(--color-surface-hover)' : 'transparent',
                          border: `2px solid ${orientation === 'landscape' ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div className="w-6 h-4 rounded-sm" style={{ border: '2px solid var(--color-text-muted)' }} />
                        <span className="text-xs lg:text-sm">{t('wizard.size.landscape')}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden sm:flex flex-col items-center justify-end rounded-lg px-3 lg:px-4 pt-2 pb-3"
                  style={{ width: 180, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <p className="text-[9px] font-medium mb-2 self-start" style={{ color: 'var(--color-text-muted)' }}>
                    {t('wizard.size.scaleComparison')}
                  </p>
                  <SizeComparisonVisual sizeKey={sizeKey} orientation={orientation} theme={theme} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Theme */}
          {step === 3 && (
            <div>
              <label className="text-sm lg:text-base font-medium mb-3 block">{t('wizard.theme.label')}</label>
              <div className="space-y-2 lg:space-y-3">
                {SAFETY_THEMES.map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => setTheme(thm)}
                    className="w-full flex items-center gap-3 lg:gap-4 py-3 lg:py-4 px-4 lg:px-5 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.id === thm.id ? 'var(--color-surface-hover)' : 'transparent',
                      border: `2px solid ${theme.id === thm.id ? thm.primary : 'var(--color-border)'}`,
                    }}
                  >
                    <div className="flex gap-1 lg:gap-1.5">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded" style={{ backgroundColor: thm.primary }} />
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded" style={{ backgroundColor: thm.secondary }} />
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded border" style={{ backgroundColor: thm.background, borderColor: 'var(--color-border)' }} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm lg:text-base font-medium">{t(`wizard.theme.themes.${thm.id}`)}</div>
                      <div className="text-xs lg:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {t('wizard.theme.signalWord')}: {thm.signalWord}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Viewing Distance */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm lg:text-base font-medium mb-2 lg:mb-3 block">
                  {t('wizard.viewing.label')}: <strong>{viewingDistance}m</strong>
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
                <div className="flex justify-between text-xs lg:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span>1m</span><span>5m</span><span>10m</span><span>15m</span><span>20m</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {COMMON_DISTANCES.slice(0, 6).map(({ value }) => (
                  <button
                    key={value}
                    onClick={() => setViewingDistance(value)}
                    className="py-2 lg:py-3 px-3 lg:px-4 rounded lg:rounded-lg text-xs lg:text-sm transition-all"
                    style={{
                      backgroundColor: viewingDistance === value ? 'var(--color-surface-hover)' : 'transparent',
                      border: `1px solid ${viewingDistance === value ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)'}`,
                    }}
                  >
                    {t(`wizard.viewing.distances.${value}`)}
                  </button>
                ))}
              </div>

              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}
              >
                <h4 className="text-sm lg:text-base font-medium mb-2">{t('wizard.viewing.summary')}</h4>
                <div className="grid grid-cols-2 gap-y-1 lg:gap-y-2 text-xs lg:text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('wizard.viewing.summaryFields.purpose')}</span>
                  <span>{purposeLabel}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('wizard.viewing.summaryFields.size')}</span>
                  <span>{sizeKey} ({orientation === 'portrait' ? t('wizard.size.portrait') : t('wizard.size.landscape')})</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('wizard.viewing.summaryFields.theme')}</span>
                  <span>{t(`wizard.theme.themes.${theme.id}`)}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('wizard.viewing.summaryFields.viewingDistance')}</span>
                  <span>{viewingDistance}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="px-4 sm:px-8 lg:px-12 py-4 lg:py-5 flex justify-between border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 lg:px-6 py-2 lg:py-2.5 rounded lg:rounded-lg text-sm lg:text-base transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: step === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {t('wizard.nav.back')}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => canProceed && setStep(step + 1)}
              disabled={!canProceed}
              className="px-6 lg:px-8 py-2 lg:py-2.5 rounded lg:rounded-lg text-sm lg:text-base font-medium transition-colors"
              style={{
                backgroundColor: canProceed ? 'var(--color-mandatory, #003DA5)' : 'var(--color-border)',
                color: canProceed ? '#fff' : 'var(--color-text-muted)',
                cursor: canProceed ? 'pointer' : 'not-allowed',
              }}
            >
              {step === 1 && !canProceed ? t('wizard.nav.selectPurpose') : t('wizard.nav.next')}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 lg:px-8 py-2 lg:py-2.5 rounded lg:rounded-lg text-sm lg:text-base font-medium transition-colors"
              style={{ backgroundColor: '#007A33', color: '#fff' }}
            >
              {t('wizard.nav.createPoster')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
