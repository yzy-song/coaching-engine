/**
 * Type definitions mirroring the frozen API contracts (LLD-B, v1.0, 30 Aug 2026).
 * Base path: /api/v1 · Auth: Bearer JWT · Errors: RFC 9457 problem+json.
 */

// ── BARS scoring ────────────────────────────────────────────────────────────

export type BarsDimension =
  | "empathy"
  | "anticipation"
  | "communication"
  | "composure"
  | "service_recovery";

/** Floor observation uses the same five BARS dimensions — one vocabulary, no drift. */
export type ObservationDimension = BarsDimension;

// ── People ───────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  started_at: string;
}

// ── Debrief (Master Doc steps 1–3) ──────────────────────────────────────────

export interface Incident {
  situation_type: string;
  guest_emotion: string;
  staff_actions: string[];
  outcome: string;
  dimensions_touched: BarsDimension[];
}

export interface StandardReference {
  chunk_id: string;
  document: string;
  section_path: string;
  step_number: number;
  excerpt: string;
  why_shown: string;
}

export interface Debrief {
  id: string;
  status: "uploaded" | "transcribing" | "extracted" | "failed";
  transcript: string | null;
  incident: Incident | null;
  standard: StandardReference | null;
  generated_scenario_id: string | null;
}

// ── Practice (Master Doc steps 4–5) ─────────────────────────────────────────

export interface Scenario {
  id: string;
  title: string;
  description: string;
  kind: "starter" | "personal";
  source_debrief_id: string | null;
  dimensions: BarsDimension[];
  duration_minutes: number;
}

export interface GuestTurn {
  content: string;
  mood: "neutral" | "frustrated" | "escalating" | "calming";
}

export interface TurnResponse {
  turn_index: number;
  guest: GuestTurn;
  turns_remaining: number;
  can_complete: boolean;
}

export interface EvidenceSpan {
  dimension: BarsDimension;
  quote: string;
  turn_index: number;
  explains: string;
}

export interface ScoreResult {
  attempt_id: string;
  scenario_id: string;
  completed_at: string;
  scores: Array<{ dimension: BarsDimension; level: number | null }>;
  evidence: EvidenceSpan[];
  overall_feedback: string;
}

export interface PracticeAttempt {
  id: string;
  scenario_id: string;
  status: "in_progress" | "completed";
  turns: TurnResponse[];
  result: ScoreResult | null;
}

// ── Observation (Master Doc step 6) ─────────────────────────────────────────

export interface ObservationRating {
  dimension: ObservationDimension;
  level: number | null;
}

export interface ObservationInput {
  staff_id: string;
  observed_at: string;
  context: string;
  what_happened: string;
  ratings: ObservationRating[];
}

export interface Observation extends ObservationInput {
  id: string;
  created_at: string;
}

export interface ObservationResponse {
  id: string;
  unlocked_practice_history: boolean;
  recommendation_id: string;
  recommendation_status: "generating" | "pending_verify" | "abstained";
}

// ── Transfer gap (Master Doc steps 9–10) ────────────────────────────────────

export type Quadrant = "competent" | "skill_gap" | "blocked" | "recalibrate";

export interface GapDimension {
  dimension: BarsDimension;
  practice_mean: number;
  practice_n: number;
  floor_mean: number;
  floor_n: number;
  gap: number;
  quadrant: Quadrant;
  reading: string;
  trend: Array<{ week: string; gap: number }>;
}

export interface TransferGap {
  staff_id: string;
  computed_at: string;
  dimensions: GapDimension[];
  insufficient_evidence: ObservationDimension[];
}

// ── Recommendation & verification (Master Doc steps 7–8, 12–14) ─────────────

export type Classification = "behavioural" | "process" | "policy";

export interface Citation {
  kind: "attempt_turn" | "observation" | "sop_chunk" | "metric";
  claim: string;
  source_ref: string;
  quoted_span?: string;
}

export interface CalibrationInfo {
  dimension: BarsDimension;
  agreement_rate: number;
  sample_size: number;
  advice: string;
}

export interface Recommendation {
  id: string;
  status: "pending_verify" | "confirmed" | "corrected" | "rejected" | "abstained";
  staff_id: string;
  classification: Classification;
  headline: string;
  body: string;
  suggested_action: string;
  calibration: CalibrationInfo;
  citations: Citation[];
  trace_id: string;
  created_at: string;
}

export interface AbstainReason {
  abstain_reason: string;
  what_would_help: Array<{ action: "log_observation" | "more_practice"; dimension: BarsDimension }>;
}

export interface VerifyInput {
  verdict: "confirmed" | "corrected" | "rejected";
  dimension_verdicts: Array<{ dimension: BarsDimension; manager_level: number }>;
  reason: string;
  seconds_to_decide: number;
}

export interface Escalation {
  id: string;
  route: "manager" | "ld" | "operations";
  severity: number;
  rule_id: string;
  summary: string;
}

export interface VerifyResponse {
  status: "confirmed" | "corrected" | "rejected";
  calibration_updated: {
    dimension: BarsDimension;
    agreement_rate_before: number;
    agreement_rate_after: number;
    sample_size: number;
  };
  escalation: Escalation | null;
}

// ── Calibration ──────────────────────────────────────────────────────────────

export interface CalibrationDimension {
  dimension: BarsDimension;
  agreement_rate: number;
  sample_size: number;
  wilson_low: number;
  wilson_high: number;
}

export interface Calibration {
  computed_at: string;
  dimensions: CalibrationDimension[];
}

// ── Insights (Master Doc steps 9–10) ────────────────────────────────────────

export interface TeamPattern {
  id: string;
  classification: Classification;
  staff_count: number;
  dimension: BarsDimension;
  description: string;
  suggested_action: string;
  route: "manager" | "ld" | "operations";
  detected_at: string;
}

export interface TeamInsights {
  window: { start: string; end: string };
  k_threshold: number;
  patterns: TeamPattern[];
  suppressed: Array<{ reason: string; count: number }>;
}
