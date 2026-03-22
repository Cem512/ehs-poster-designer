import type { BorderConfig, BorderType } from '../types/poster';

export interface BorderPreset {
  type: BorderType;
  label: string;
  description: string;
}

export const BORDER_PRESETS: BorderPreset[] = [
  {
    type: 'hazard-stripe',
    label: 'Hazard Stripe',
    description: '45° alternating diagonal stripes — for danger/warning posters',
  },
  {
    type: 'solid-industrial',
    label: 'Solid Industrial',
    description: 'Thick outer border with thin inner rule — clean, authoritative',
  },
  {
    type: 'double-line',
    label: 'Double Line',
    description: 'Two parallel rectangles — formal safety notices',
  },
  {
    type: 'rounded-safety',
    label: 'Rounded Safety',
    description: 'Rounded corners — informational, less severe',
  },
  {
    type: 'color-banded',
    label: 'Color Banded',
    description: 'Top band in signal color — OSHA/ANSI header style',
  },
];

export function getDefaultBorder(primaryColor: string, secondaryColor: string): BorderConfig {
  return {
    type: 'solid-industrial',
    primaryColor,
    secondaryColor,
    thickness: 8, // mm
  };
}
