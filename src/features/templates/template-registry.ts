import type { TemplateDefinition } from '../../types/template';
import { lifeSavingRulesTemplate } from './life-saving-rules-template';
import { ppeRequiredTemplate } from './ppe-required-template';
import { dangerZoneTemplate } from './danger-zone-template';
import { emergencyProceduresTemplate } from './emergency-procedures-template';
import { chemicalHazardTemplate } from './chemical-hazard-template';
import { fireSafetyTemplate } from './fire-safety-template';

/** All available templates */
export const TEMPLATES: TemplateDefinition[] = [
  lifeSavingRulesTemplate,
  ppeRequiredTemplate,
  dangerZoneTemplate,
  emergencyProceduresTemplate,
  chemicalHazardTemplate,
  fireSafetyTemplate,
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
