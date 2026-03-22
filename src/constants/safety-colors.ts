import type { SafetyTheme } from '../types/poster';

/** ISO 3864 safety colors */
export const ISO_COLORS = {
  prohibition: '#C8102E',
  warning: '#FFD100',
  mandatory: '#003DA5',
  safeCondition: '#007A33',
  fireEquipment: '#C8102E',
  black: '#101820',
  white: '#FFFFFF',
  darkGray: '#2D2D2D',
  lightGray: '#E8E8E8',
} as const;

export const SAFETY_THEMES: SafetyTheme[] = [
  {
    id: 'prohibition-red',
    label: 'Prohibition Red',
    primary: ISO_COLORS.prohibition,
    secondary: ISO_COLORS.black,
    accent: ISO_COLORS.white,
    background: ISO_COLORS.white,
    textColor: ISO_COLORS.black,
    signalWord: 'DANGER',
  },
  {
    id: 'warning-yellow',
    label: 'Warning Yellow',
    primary: ISO_COLORS.warning,
    secondary: ISO_COLORS.black,
    accent: ISO_COLORS.black,
    background: ISO_COLORS.white,
    textColor: ISO_COLORS.black,
    signalWord: 'WARNING',
  },
  {
    id: 'mandatory-blue',
    label: 'Mandatory Blue',
    primary: ISO_COLORS.mandatory,
    secondary: ISO_COLORS.white,
    accent: ISO_COLORS.white,
    background: ISO_COLORS.white,
    textColor: ISO_COLORS.black,
    signalWord: 'MANDATORY',
  },
  {
    id: 'safe-green',
    label: 'Safe Condition Green',
    primary: ISO_COLORS.safeCondition,
    secondary: ISO_COLORS.white,
    accent: ISO_COLORS.white,
    background: ISO_COLORS.white,
    textColor: ISO_COLORS.black,
    signalWord: 'SAFETY',
  },
  {
    id: 'neutral-industrial',
    label: 'Neutral Industrial',
    primary: ISO_COLORS.darkGray,
    secondary: ISO_COLORS.warning,
    accent: ISO_COLORS.warning,
    background: ISO_COLORS.white,
    textColor: ISO_COLORS.black,
    signalWord: 'NOTICE',
  },
  {
    id: 'ehs-teal',
    label: 'EHS Teal & Lime',
    primary: '#005E60',
    secondary: '#C7FF05',
    accent: '#C7FF05',
    background: '#FFFFFF',
    textColor: '#000000',
    signalWord: 'SAFETY FIRST',
  },
];

export function getDefaultThemeForPurpose(purpose: string): SafetyTheme {
  switch (purpose) {
    case 'ppe': return SAFETY_THEMES[2]; // mandatory blue
    case 'danger': return SAFETY_THEMES[0]; // prohibition red
    case 'emergency': return SAFETY_THEMES[3]; // safe green
    case 'fire': return SAFETY_THEMES[0]; // prohibition red
    case 'chemical': return SAFETY_THEMES[1]; // warning yellow
    default: return SAFETY_THEMES[4]; // neutral industrial
  }
}
