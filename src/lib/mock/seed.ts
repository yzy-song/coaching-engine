import type {
  Calibration,
  Debrief,
  Observation,
  PracticeAttempt,
  Recommendation,
  Scenario,
  ScoreResult,
  StaffMember,
  TeamInsights,
  TransferGap,
} from "@/lib/types";

/** Demo cast: Marta (duty manager) is the console user; Diego is the story arc. */
export const staffMembers: StaffMember[] = [
  { id: "9f2c-diego", name: "Diego Alvarez", role: "Front Desk Agent", department: "Front Office", started_at: "2026-04-14" },
  { id: "a1b2-aoife", name: "Aoife Brennan", role: "Server", department: "F&B", started_at: "2025-11-03" },
  { id: "c3d4-ciaran", name: "Ciarán Doyle", role: "Bartender", department: "F&B", started_at: "2026-02-09" },
  { id: "e5f6-emma", name: "Emma Walsh", role: "Front Desk Agent", department: "Front Office", started_at: "2026-06-01" },
  { id: "g7h8-liam", name: "Liam O'Brien", role: "Concierge", department: "Front Office", started_at: "2025-08-18" },
  { id: "i9j0-niamh", name: "Niamh Kelly", role: "Server", department: "F&B", started_at: "2026-03-24" },
];

export const currentManager = {
  id: "mgr-marta",
  name: "Marta Murphy",
  role: "Duty Manager",
  property: "The Meridian, Dublin",
};

// ── Debrief (Diego's, already processed → hot debrief with SOP reference) ───

export const diegoDebrief: Debrief = {
  id: "d3b1-diego",
  status: "extracted",
  transcript:
    "A table waited about forty minutes for food and when it came the [GUEST] starter was missing. I apologised and offered a free dessert straight away but they were still annoyed.",
  incident: {
    situation_type: "service_delay_and_order_error",
    guest_emotion: "frustrated",
    staff_actions: ["apologised", "offered_compensation"],
    outcome: "unresolved",
    dimensions_touched: ["service_recovery", "empathy"],
  },
  standard: {
    chunk_id: "c7a2-4-2-3",
    document: "Service Recovery Standard v3",
    section_path: "4.2 > Service Recovery > Step 3",
    step_number: 3,
    excerpt:
      "Acknowledge the specific inconvenience the guest experienced before offering any form of compensation.",
    why_shown:
      "Your account describes offering compensation before acknowledging the specific problem.",
  },
  generated_scenario_id: "5e9d-personal",
};

// ── Scenarios ───────────────────────────────────────────────────────────────

export const scenarios: Scenario[] = [
  {
    id: "5e9d-personal",
    title: "The missing starter",
    description:
      "Generated from your Tuesday debrief. A table waited 40 minutes and the starter never arrived.",
    kind: "personal",
    source_debrief_id: "d3b1-diego",
    dimensions: ["service_recovery", "empathy", "composure"],
    duration_minutes: 3,
  },
  {
    id: "s1-starter",
    title: "Late check-in complaint",
    description:
      "Starter scenario. A guest arrives at 3pm and their room is not ready.",
    kind: "starter",
    source_debrief_id: null,
    dimensions: ["service_recovery", "empathy", "composure"],
    duration_minutes: 3,
  },
  {
    id: "s2-starter",
    title: "The forgotten anniversary",
    description:
      "Starter scenario. A couple mention their anniversary and nothing was arranged.",
    kind: "starter",
    source_debrief_id: null,
    dimensions: ["anticipation", "communication", "empathy"],
    duration_minutes: 3,
  },
  {
    id: "s3-starter",
    title: "Noise complaint at midnight",
    description:
      "Starter scenario. A guest calls reception about noise from the room above.",
    kind: "starter",
    source_debrief_id: null,
    dimensions: ["composure", "communication", "empathy"],
    duration_minutes: 3,
  },
];

// ── Practice: Diego's completed attempt (the 4/5) ───────────────────────────

export const diegoScoreResult: ScoreResult = {
  attempt_id: "8a4e-diego",
  scenario_id: "s1-starter",
  completed_at: "2026-09-02T14:12:00Z",
  scores: [
    { dimension: "service_recovery", level: 4 },
    { dimension: "empathy", level: 4 },
    { dimension: "composure", level: 5 },
    { dimension: "communication", level: 3 },
    { dimension: "anticipation", level: 3 },
  ],
  evidence: [
    {
      dimension: "service_recovery",
      quote:
        "I'm so sorry your starter never arrived after that wait — let me sort that first and then we'll make it right.",
      turn_index: 5,
      explains:
        "Resolved + Ownership: apologises with the specific problem, commits to fixing it, and adds a follow-through — but no gesture beyond the fix.",
    },
    {
      dimension: "empathy",
      quote:
        "So you were told twenty minutes, and it's been forty — I can hear how frustrating that is.",
      turn_index: 2,
      explains:
        "Specific Validation: repeats the concern back in your own words and acknowledges the feeling, without deflection.",
    },
  ],
  overall_feedback:
    "Strong recovery sequence: acknowledge first, then act. To reach a 5, add a gesture that acknowledges the inconvenience beyond the fix itself.",
};

export const completedAttempt: PracticeAttempt = {
  id: "8a4e-diego",
  scenario_id: "s1-starter",
  status: "completed",
  turns: [],
  result: diegoScoreResult,
};

// ── In-progress practice (what Diego opens in the demo) ─────────────────────

export const inProgressAttempt: PracticeAttempt = {
  id: "7b3c-diego",
  scenario_id: "5e9d-personal",
  status: "in_progress",
  turns: [
    {
      turn_index: 1,
      guest: {
        content:
          "We've been sitting here forty minutes. Where is our food? The table next to us arrived after us and they're already eating.",
        mood: "frustrated",
      },
      turns_remaining: 6,
      can_complete: false,
    },
  ],
  result: null,
};

// ── Observation (Marta logged it Tue; practice history unlocked) ────────────

export const diegoObservation: Observation = {
  id: "o55c-diego",
  staff_id: "9f2c-diego",
  observed_at: "2026-09-10T15:20:00Z",
  created_at: "2026-09-10T15:20:11Z",
  context: "Guest complaint at front desk, room not ready at 3pm",
  what_happened:
    "Froze and escalated to me immediately without attempting recovery herself.",
  ratings: [
    { dimension: "service_recovery", level: 2 },
    { dimension: "empathy", level: 3 },
    { dimension: "confidence", level: 2 },
    { dimension: "upselling", level: null },
  ],
};

// ── Transfer gap (Listing 6) ────────────────────────────────────────────────

export const diegoGap: TransferGap = {
  staff_id: "9f2c-diego",
  computed_at: "2026-09-10T15:20:11Z",
  dimensions: [
    {
      dimension: "service_recovery",
      practice_mean: 4.0,
      practice_n: 3,
      floor_mean: 2.0,
      floor_n: 2,
      gap: 2.0,
      quadrant: "blocked",
      reading: "Knows how. Something is preventing execution on the floor.",
      trend: [
        { week: "2026-W35", gap: 1.5 },
        { week: "2026-W36", gap: 1.7 },
        { week: "2026-W37", gap: 2.0 },
      ],
    },
    {
      dimension: "empathy",
      practice_mean: 3.3,
      practice_n: 3,
      floor_mean: 3.0,
      floor_n: 2,
      gap: 0.3,
      quadrant: "competent",
      reading: "Practice and floor performance align.",
      trend: [
        { week: "2026-W35", gap: 0.4 },
        { week: "2026-W36", gap: 0.5 },
        { week: "2026-W37", gap: 0.3 },
      ],
    },
    {
      dimension: "composure",
      practice_mean: 4.6,
      practice_n: 3,
      floor_mean: 2.0,
      floor_n: 1,
      gap: 2.6,
      quadrant: "blocked",
      reading:
        "Knows the words and cannot yet produce them under pressure.",
      trend: [
        { week: "2026-W36", gap: 2.2 },
        { week: "2026-W37", gap: 2.6 },
      ],
    },
  ],
  insufficient_evidence: ["upselling"],
};

// ── Recommendations ─────────────────────────────────────────────────────────

/** Listing 7 — the star: Diego's policy finding, pending Marta's verify. */
export const diegoRecommendation: Recommendation = {
  id: "r91a-diego",
  status: "pending_verify",
  staff_id: "9f2c-diego",
  classification: "policy",
  headline:
    "This is not a training gap. She does not know what she is authorised to offer without approval.",
  body: "Diego scored 4/5 on service recovery in practice on 2 September, following the acknowledge-then-offer sequence correctly. On the floor on 10 September she escalated immediately without attempting recovery. The gap is 2.0 and widening. The behaviour she skipped is the one she demonstrated she can perform, which points at authority rather than skill: your Complaint Handling Policy sets no discretionary limit for front desk staff.",
  suggested_action:
    "Set and communicate a discretionary limit. Do not assign further service recovery practice.",
  calibration: {
    dimension: "service_recovery",
    agreement_rate: 0.84,
    sample_size: 25,
    advice:
      "This system has agreed with your managers 84% of the time on this dimension.",
  },
  citations: [
    {
      kind: "attempt_turn",
      claim: "scored 4/5 on service recovery in practice on 2 September",
      source_ref: "attempt:8a4e-diego:turn:5",
      quoted_span:
        "I'm so sorry your starter never arrived after that wait - let me sort that first and then we'll make it right.",
    },
    {
      kind: "observation",
      claim: "escalated immediately without attempting recovery",
      source_ref: "obs:o55c-diego:what_happened",
      quoted_span:
        "Froze and escalated to me immediately without attempting recovery herself.",
    },
    {
      kind: "sop_chunk",
      claim: "your Complaint Handling Policy sets no discretionary limit",
      source_ref: "sop:complaint_policy_v2:3.1",
      quoted_span: "Compensation above nominal value requires duty manager approval.",
    },
    {
      kind: "metric",
      claim: "The gap is 2.0 and widening",
      source_ref: "metric:gap:service_recovery",
    },
  ],
  trace_id: "01J9Z2K8QW3M",
  created_at: "2026-09-10T15:20:30Z",
};

/** Listing 8 — abstained recommendation (insufficient evidence). */
export const abstainedRecommendation: Recommendation = {
  id: "r7b2-abstain",
  status: "abstained",
  staff_id: "a1b2-aoife",
  classification: "behavioural",
  headline: "Not enough evidence yet to give you grounded coaching.",
  body: "Two practice attempts on empathy, no floor observation in the last 30 days. A transfer-gap reading needs both.",
  suggested_action: "",
  calibration: {
    dimension: "empathy",
    agreement_rate: 0.81,
    sample_size: 19,
    advice: "Agreement is lower on empathy than service recovery.",
  },
  citations: [],
  trace_id: "01J9Z2K8QW4N",
  created_at: "2026-09-10T09:05:00Z",
};

/** A behavioural finding in the verify queue. */
export const ciaranRecommendation: Recommendation = {
  id: "r88c-ciaran",
  status: "pending_verify",
  staff_id: "c3d4-ciaran",
  classification: "behavioural",
  headline:
    "Ciarán knows the recovery steps but skips the acknowledgement under time pressure.",
  body: "In practice he follows the acknowledge-then-offer sequence 4/5 times. On the floor last Friday he jumped straight to a replacement drink during a spilled-order complaint, and the guest left feeling unheard. Practice 4.0 vs floor 2.5 on service recovery — the sequence, not the knowledge, is the gap.",
  suggested_action:
    "One 5-minute roleplay focused on the first sentence of recovery, then observe again next shift.",
  calibration: {
    dimension: "service_recovery",
    agreement_rate: 0.84,
    sample_size: 25,
    advice:
      "This system has agreed with your managers 84% of the time on this dimension.",
  },
  citations: [
    {
      kind: "attempt_turn",
      claim: "follows acknowledge-then-offer in practice",
      source_ref: "attempt:3k2a-ciaran:turn:4",
      quoted_span:
        "I'm sorry that happened — let me replace it for you right away.",
    },
    {
      kind: "observation",
      claim: "jumped straight to the replacement drink",
      source_ref: "obs:o41m-ciaran:what_happened",
      quoted_span:
        "Replaced the drink immediately, no acknowledgement of the spill or the wait.",
    },
    {
      kind: "sop_chunk",
      claim: "the standard requires acknowledgement before remedy",
      source_ref: "sop:service_recovery_v3:4.2.3",
      quoted_span:
        "Acknowledge the specific inconvenience the guest experienced before offering any form of compensation.",
    },
  ],
  trace_id: "01J9Z2K8QW5P",
  created_at: "2026-09-11T08:40:00Z",
};

/** A skill-gap finding in the verify queue. */
export const emmaRecommendation: Recommendation = {
  id: "r77e-emma",
  status: "pending_verify",
  staff_id: "e5f6-emma",
  classification: "behavioural",
  headline:
    "Emma is early-tenure: practice and floor both show the same weak spots.",
  body: "Joined in June. Practice mean 2.3 and floor mean 2.0 on guest communication — the gap is small because neither stream shows the skill yet. This is the one case where practice is the right answer: repeat the starter scenarios with the communication anchors visible.",
  suggested_action:
    "Assign two starter communication scenarios this week and review the evidence spans together.",
  calibration: {
    dimension: "communication",
    agreement_rate: 0.77,
    sample_size: 14,
    advice:
      "Communication has the lowest agreement — treat these readings with care.",
  },
  citations: [
    {
      kind: "attempt_turn",
      claim: "practice shows the same weak spots",
      source_ref: "attempt:9h2b-emma:turn:3",
      quoted_span: "Yeah no problem, your room is 412.",
    },
    {
      kind: "observation",
      claim: "floor shows the same pattern",
      source_ref: "obs:o52n-emma:what_happened",
      quoted_span:
        "Checked in a guest with one-word answers, no greeting, no offer of help.",
    },
    {
      kind: "metric",
      claim: "gap is small: 0.3",
      source_ref: "metric:gap:communication",
    },
  ],
  trace_id: "01J9Z2K8QW6Q",
  created_at: "2026-09-11T10:15:00Z",
};

export const recommendations: Recommendation[] = [
  diegoRecommendation,
  abstainedRecommendation,
  ciaranRecommendation,
  emmaRecommendation,
];

// ── Calibration (moves visibly on verify — the demo beat) ───────────────────

export const calibration: Calibration = {
  computed_at: "2026-09-11T11:00:00Z",
  dimensions: [
    { dimension: "service_recovery", agreement_rate: 0.84, sample_size: 25, wilson_low: 0.68, wilson_high: 0.93 },
    { dimension: "empathy", agreement_rate: 0.81, sample_size: 19, wilson_low: 0.62, wilson_high: 0.92 },
    { dimension: "communication", agreement_rate: 0.77, sample_size: 14, wilson_low: 0.54, wilson_high: 0.9 },
    { dimension: "composure", agreement_rate: 0.86, sample_size: 21, wilson_low: 0.7, wilson_high: 0.94 },
    { dimension: "anticipation", agreement_rate: 0.72, sample_size: 12, wilson_low: 0.46, wilson_high: 0.88 },
  ],
};

// ── Team insights (Listing 10 — the "zoom out" demo beat) ───────────────────

export const teamInsights: TeamInsights = {
  window: { start: "2026-09-08", end: "2026-09-14" },
  k_threshold: 5,
  patterns: [
    {
      id: "cp01-rooms",
      classification: "process",
      staff_count: 9,
      dimension: "service_recovery",
      description:
        "Nine staff logged the same breakdown: rooms not ready at 3pm check-in, guests complaining, staff unclear what they may offer.",
      suggested_action:
        "Run a 10-minute briefing on service recovery and confirm what staff may offer without approval.",
      route: "operations",
      detected_at: "2026-09-11T09:30:00Z",
    },
    {
      id: "cp02-bar",
      classification: "process",
      staff_count: 6,
      dimension: "communication",
      description:
        "Six F&B staff reported the same friction: the new bar POS slows drink orders at peak, and guests are told 'the system is slow'.",
      suggested_action:
        "Review POS workflow with the bar team; add a holding line for guests while orders process.",
      route: "operations",
      detected_at: "2026-09-10T18:00:00Z",
    },
  ],
  suppressed: [{ reason: "below_k_threshold", count: 2 }],
};

// ── Escalation (returned by the verify call — Listing 9) ────────────────────

export const diegoEscalation = {
  id: "e12f-diego",
  route: "operations" as const,
  severity: 2,
  rule_id: "RC-POLICY-COHORT-3",
  summary:
    "Nine staff hit the same authority ambiguity this week. Routed to the GM as a policy gap, not nine coaching sessions.",
};

export const verifyCalibrationUpdate = {
  dimension: "service_recovery" as const,
  agreement_rate_before: 0.84,
  agreement_rate_after: 0.846,
  sample_size: 26,
};
