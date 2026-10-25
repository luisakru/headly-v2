import { format, parse } from 'date-fns';
import { DomainError } from '../../data/db';
import type { Dictionary } from '../../i18n/locales/en';

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

/** Value for a `datetime-local` input. */
export function toInputValue(time: number): string {
  return format(time, INPUT_FORMAT);
}

/** NaN when the input is empty or incomplete. */
export function fromInputValue(value: string): number {
  return parse(value, INPUT_FORMAT, new Date()).getTime();
}

type AttackErrors = Dictionary['errors']['attack'];

export function errorMessage(error: unknown, messages: AttackErrors): string {
  if (error instanceof DomainError && error.code in messages) {
    return messages[error.code as keyof AttackErrors];
  }
  throw error;
}
