import { z } from 'zod';
import { isValidPhMobile, type Occasion } from '@/core';

// Single source of truth for the occasion list — the picker and the validator
// both read this, so they can never drift.
const OCCASION_VALUES = [
  'birthday',
  'debut',
  'anniversary',
  'christening',
  'graduation',
  'despedida',
  'blowout',
  'other',
] as const;

export const OCCASIONS: readonly Occasion[] = OCCASION_VALUES;

export const bookingSchema = z.object({
  dateISO: z.string().min(1, 'Pick a date'),
  time: z.string().min(1, 'Pick a time'),
  partySize: z.number().int().min(1).max(16),
  name: z.string().trim().min(1, 'Please enter a name'),
  phone: z.string().refine(isValidPhMobile, 'Enter a valid PH mobile number'),
  occasion: z.enum(OCCASION_VALUES).optional(),
  notes: z.string(),
  // A guest must opt in before we book two tables pushed together.
  acceptedCombination: z.boolean(),
});

export type BookingForm = z.infer<typeof bookingSchema>;
