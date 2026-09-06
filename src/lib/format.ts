import type {
  BarsDimension,
  Classification,
  ObservationDimension,
  Quadrant,
} from "@/lib/types";

export const dimensionLabels: Record<BarsDimension, string> = {
  empathy: "Empathy & Active Listening",
  anticipation: "Guest Anticipation",
  communication: "Guest Communication",
  composure: "Composure & Professionalism",
  service_recovery: "Service Recovery",
};

export const observationDimensionLabels: Record<ObservationDimension, string> = {
  ...dimensionLabels,
};

export const dimensionShort: Record<BarsDimension, string> = {
  empathy: "Empathy",
  anticipation: "Anticipation",
  communication: "Communication",
  composure: "Composure",
  service_recovery: "Recovery",
};

export interface QuadrantMeta {
  label: string;
  headline: string;
  reading: string;
  tone: string;
}

export const quadrantMeta: Record<Quadrant, QuadrantMeta> = {
  competent: {
    label: "No gap",
    headline: "Strong in practice and on the floor.",
    reading: "Stretch them. Promote. Use as a peer coach.",
    tone: "emerald",
  },
  skill_gap: {
    label: "Needs practice",
    headline: "Weak in both.",
    reading:
      "Targeted practice — the only quadrant where a simulation is the right answer.",
    tone: "amber",
  },
  blocked: {
    label: "Blocked",
    headline: "Knows how, held back on the floor.",
    reading:
      "They know how. Something is stopping them: pressure, time, unclear authority. Do NOT send more training.",
    tone: "rose",
  },
  recalibrate: {
    label: "Check the standard",
    headline: "Strong floor, weak practice.",
    reading:
      "Rubric or scenario mismatch — or they compensate with charm. A signal about our scoring, not about them.",
    tone: "violet",
  },
};

export const classificationMeta: Record<
  Classification,
  { label: string; hint: string }
> = {
  behavioural: {
    label: "Behavioural",
    hint: "Individual coaching is the right route.",
  },
  process: {
    label: "Process",
    hint: "Individual coaching is suppressed — fix the workflow.",
  },
  policy: {
    label: "Policy",
    hint: "The rules, not the person, are the blocker.",
  },
};

export const citationKindLabel: Record<string, string> = {
  attempt_turn: "Practice turn",
  observation: "Floor observation",
  sop_chunk: "Hotel standard",
  metric: "Transfer-gap metric",
};

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatGap(gap: number): string {
  return gap > 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1);
}
