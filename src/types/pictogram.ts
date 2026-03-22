export type PictogramCategory = 'prohibition' | 'warning' | 'mandatory' | 'safe-condition' | 'fire-equipment';

export interface PictogramEntry {
  id: string;           // e.g., "P001"
  category: PictogramCategory;
  label: string;        // "No smoking"
  keywords: string[];   // ["smoke", "cigarette", "tobacco", "fire"]
  svgPath: string;      // "/pictograms/prohibition/P001.svg"
  isoCode: string;      // "ISO 7010-P001"
}

export const PICTOGRAM_CATEGORY_LABELS: Record<PictogramCategory, string> = {
  'prohibition': 'Prohibition',
  'warning': 'Warning',
  'mandatory': 'Mandatory',
  'safe-condition': 'Safe Condition',
  'fire-equipment': 'Fire Equipment',
};

export const PICTOGRAM_CATEGORY_COLORS: Record<PictogramCategory, string> = {
  'prohibition': '#C8102E',
  'warning': '#FFD100',
  'mandatory': '#003DA5',
  'safe-condition': '#007A33',
  'fire-equipment': '#C8102E',
};
