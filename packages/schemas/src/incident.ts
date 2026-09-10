import { z } from "zod";
import { TaxonomyCategoryId } from "./taxonomy";

export const VerificationStatus = z.enum(["verified", "disputed", "unverified"]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

/**
 * How an incident's dollar amount should be treated when aggregating totals.
 * Different incidents report fundamentally different kinds of numbers
 * (principal still locked, cascading liquidation losses, a post-unlock theft
 * allegation) — collapsing them into one undifferentiated sum would be
 * misleading, so every amount is tagged with what it actually measures.
 */
export const AmountCategory = z.enum([
  "locked-principal",
  "liquidation-impact",
  "post-recovery-allegation",
  "unverified",
]);
export type AmountCategory = z.infer<typeof AmountCategory>;

export const IncidentSource = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
});
export type IncidentSource = z.infer<typeof IncidentSource>;

export const IncidentAmount = z.object({
  valueUsd: z.number().nonnegative().nullable(),
  displayLabel: z.string(),
  category: AmountCategory,
  asOf: z.string().nullable(),
  note: z.string().optional(),
});
export type IncidentAmount = z.infer<typeof IncidentAmount>;

export const Incident = z.object({
  id: z.string(),
  name: z.string(),
  ecosystem: z.string(),
  year: z.number().int(),
  architecture: z.string(),
  rootCause: z.string(),
  fundLockMechanism: z.string(),
  taxonomy: z.array(TaxonomyCategoryId).min(1),
  amount: IncidentAmount,
  amountVerificationStatus: VerificationStatus,
  recoveryAttempts: z.string(),
  primarySources: z.array(IncidentSource),
  limitations: z.string(),
  disputedNotes: z.string().optional(),
});
export type Incident = z.infer<typeof Incident>;
