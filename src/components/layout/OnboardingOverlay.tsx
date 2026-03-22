import { useState, useEffect } from 'react';
import {
  MousePointer2, Type, PanelLeftOpen, PanelRightOpen,
  Download, Eye, ArrowRight, X, Lightbulb
} from 'lucide-react';

const ONBOARDING_KEY = 'ehs-poster-onboarding-seen';

interface TipItem {
  icon: typeof MousePointer2;
  title: string;
  description: string;
}

const TIPS: TipItem[] = [
  {
    icon: Type,
    title: 'Edit Header Text',
    description: 'Double-click the header or footer text on the canvas to edit it directly.',
  },
  {
    icon: PanelLeftOpen,
    title: 'Left Panel — Pictograms & More',
    description: 'Browse ISO 7010 pictograms, templates, borders, and shapes. Drag items onto the canvas.',
  },
  {
    icon: PanelRightOpen,
    title: 'Right Panel — Properties',
    description: 'Select any object, then use the right panel to adjust colors, position, and text styles.',
  },
  {
    icon: Eye,
    title: 'Readability Checker',
    description: 'The eye icon in the toolbar validates that your text is large enough for your set viewing distance.',
  },
  {
    icon: Download,
    title: 'Export When Ready',
    description: 'Click Export to download your poster as PDF, PNG, or SVG at print-ready quality.',
  },
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show if the user hasn't seen onboarding yet
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      // Small delay so the canvas has time to render first
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNext = () => {
    if (step < TIPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const tip = TIPS[step];
  const TipIcon = tip.icon;
  const isLast = step === TIPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
          }}
        >
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Quick Start Guide</h3>
              <p className="text-[11px] opacity-80">
                {step + 1} of {TIPS.length} tips
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-7 h-7 flex items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Skip onboarding"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="h-1 flex gap-0.5" style={{ backgroundColor: 'var(--color-border)' }}>
          {TIPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 transition-all duration-300"
              style={{
                backgroundColor: i <= step ? '#003DA5' : 'transparent',
              }}
            />
          ))}
        </div>

        {/* Tip content */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#003DA520' }}
            >
              <TipIcon size={22} style={{ color: '#003DA5' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">{tip.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {tip.description}
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint (show on first tip only) */}
        {step === 0 && (
          <div
            className="mx-5 mb-4 rounded-lg px-3 py-2.5 text-[11px]"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Keyboard shortcuts: </span>
            <strong>V</strong> Select · <strong>H</strong> Pan · <strong>T</strong> Text · <strong>G</strong> Grid · <strong>Ctrl+Z</strong> Undo · <strong>Ctrl+E</strong> Export
          </div>
        )}

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={dismiss}
            className="text-xs px-3 py-1.5 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Skip all
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs px-3 py-1.5 rounded transition-colors"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded font-medium transition-colors"
              style={{ backgroundColor: '#003DA5', color: '#fff' }}
            >
              {isLast ? 'Start Designing' : 'Next'}
              {!isLast && <ArrowRight size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
