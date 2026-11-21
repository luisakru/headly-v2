import type { Symptom } from '../domain/types';
import type { Dictionary } from './locales/en';

export function symptomName(symptom: Symptom, t: Dictionary): string {
  return symptom.name || (symptom.builtIn ? t.symptoms.builtIn[symptom.builtIn] : '');
}
