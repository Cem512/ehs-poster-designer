export interface FontPreset {
  family: string;
  label: string;
  category: 'safety' | 'general';
  description: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    family: 'Inter',
    label: 'Inter',
    category: 'safety',
    description: 'Modern, high-legibility sans-serif (recommended)',
  },
  {
    family: 'Arial',
    label: 'Arial',
    category: 'safety',
    description: 'Universal sans-serif fallback',
  },
  {
    family: 'Helvetica',
    label: 'Helvetica',
    category: 'safety',
    description: 'Classic industrial sans-serif',
  },
  {
    family: 'Roboto Condensed',
    label: 'Roboto Condensed',
    category: 'safety',
    description: 'Condensed for tight spaces',
  },
];

export const SIGNAL_WORD_FONT = 'Inter';
export const DEFAULT_BODY_FONT = 'Inter';
