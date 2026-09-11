"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dimensionShort,
  observationDimensionLabels,
  quadrantMeta,
} from "@/lib/format";
import type { GapDimension, Quadrant, TransferGap } from "@/lib/types";

/** Quadrant badge tones — one per quadrant, keyed by the tone the dataset
 * rows already carry (see quadrantMeta in lib/format.ts). Muted warm family:
 * sage / caramel / terracotta / olive, tuned for the cream surface: tinted
 * chip fills with deep same-hue text, never light-on-light. */
const toneClasses: Record<string, { chip: string; text: string }> = {
  emerald: {
    chip: "bg-primary/10 text-primary border-primary/25",
    text: "text-primary",
  },
  amber: {
    chip: "bg-[oklch(0.76_0.07_74)]/15 text-[oklch(0.45_0.07_72)] border-[oklch(0.76_0.07_74)]/30",
    text: "text-[oklch(0.45_0.07_72)]",
  },
  rose: {
    chip: "bg-[oklch(0.66_0.09_30)]/12 text-[oklch(0.45_0.08_30)] border-[oklch(0.66_0.09_30)]/30",
    text: "text-[oklch(0.45_0.08_30)]",
  },
  olive: {
    chip: "bg-[oklch(0.63_0.06_115)]/12 text-[oklch(0.43_0.06_115)] border-[oklch(0.63_0.06_115)]/30",
    text: "text-[oklch(0.43_0.06_115)]",
  },
};

/** Recalibrate arrives as "violet" in quadrantMeta while its badge renders
 * olive; unknown keys fall back to olive instead of breaking the rows. */
const toneFor = (tone: string) => toneClasses[tone] ?? toneClasses.olive;

/** One-line conclusion per quadrant for the top card. The four readings
 * follow the quadrant semantics the dataset rows already carry — the copy
 * stays fixed so the card reads the same way for every staff member. */
const conclusionLine: Record<Quadrant, string> = {
  blocked:
    "Practice is strong but the floor is not. This reads as a systems gap, not a skill gap.",
  skill_gap:
    "Floor trails practice. This reads as a coaching gap, not a policy gap.",
  competent: "Floor matches practice. No transfer gap on the scored dimensions.",
  recalibrate:
    "Floor runs ahead of practice. Worth checking the standard.",
};

/** One-line qualitative reading per quadrant for the dimension rows. The
 * rows carry the coaching recommendation, never the numbers behind it. */
const quadrantLine: Record<Quadrant, string> = {
  blocked: "Practice looks fine, the floor doesn't match.",
  skill_gap: "The floor is trailing practice.",
  competent: "Floor matches practice.",
  recalibrate: "The floor runs ahead of practice.",
};

/** The dimension that sets the page's overall reading: a blocked finding
 * outranks everything, then the largest practice→floor gap — the same
 * preference db.ts applies when it picks the primary gap for a
 * recommendation. The row order is frozen, so ties resolve deterministically. */
function overallReading(
  dimensions: TransferGap["dimensions"]
): GapDimension | undefined {
  if (dimensions.length === 0) return undefined;
  return [...dimensions].sort((a, b) => {
    const aBlocked = a.quadrant === "blocked" ? 0 : 1;
    const bBlocked = b.quadrant === "blocked" ? 0 : 1;
    if (aBlocked !== bBlocked) return aBlocked - bBlocked;
    return b.gap - a.gap;
  })[0];
}

export function GapQuadrant({
  gap,
  staffName,
}: {
  gap: TransferGap;
  staffName: string;
}) {
  const firstName = staffName.split(" ")[0];
  const lead = overallReading(gap.dimensions);
  // Biggest gap first: the row a manager should act on opens at the top, and
  // the evidence panel follows it rather than whatever the API listed first.
  const ordered = [...gap.dimensions].sort(
    (a, b) => Math.abs(b.gap) - Math.abs(a.gap)
  );
  const [selected, setSelected] = useState(ordered[0]?.dimension);
  const active = ordered.find((d) => d.dimension === selected) ?? ordered[0];
  const leadTone = lead ? toneFor(quadrantMeta[lead.quadrant].tone) : null;

  return (
    <div className="space-y-6">
      {/* Conclusion card: the reading a manager walks away with. The lead
          dimension picks the quadrant line; the opening stays fixed. */}
      <section className="rounded-xl border bg-card p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Practice shows what {firstName} can do. The floor shows what{" "}
          {firstName} actually did. When the floor falls behind, the answer
          usually isn&apos;t more training.
        </p>
        {lead && (
          <p
            className={`mt-3 text-base font-semibold leading-snug ${
              leadTone ? leadTone.text : "text-foreground"
            }`}
          >
            {conclusionLine[lead.quadrant]}
          </p>
        )}
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Scored dimensions</CardTitle>
          <p className="text-xs text-muted-foreground">
            One row per scored dimension, biggest gap first, with the coaching
            reading as the badge. Select a row for the evidence behind it.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordered.map((d) => (
            <button
              key={d.dimension}
              type="button"
              onClick={() => setSelected(d.dimension)}
              aria-pressed={selected === d.dimension}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selected === d.dimension
                  ? "border-primary bg-accent/30"
                  : "bg-card hover:bg-muted/40"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {dimensionShort[d.dimension]}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {quadrantLine[d.quadrant]}
                </span>
              </span>
              <Badge
                variant="outline"
                className={`shrink-0 ${toneFor(quadrantMeta[d.quadrant].tone).chip}`}
              >
                {quadrantMeta[d.quadrant].label}
              </Badge>
            </button>
          ))}

          {active && (
            <div
              key={active.dimension}
              className="msg-in rounded-xl border bg-muted/40 p-4"
            >
              <p className="text-sm font-semibold">
                {dimensionShort[active.dimension]} —{" "}
                <span
                  className={toneFor(quadrantMeta[active.quadrant].tone).text}
                >
                  {quadrantMeta[active.quadrant].label}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.reading}
              </p>
            </div>
          )}

          {gap.insufficient_evidence.length > 0 && (
            <p className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
              No floor observations yet for{" "}
              {gap.insufficient_evidence
                .map((d) => observationDimensionLabels[d])
                .join(", ")}{" "}
              — the gap is left unscored rather than guessed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
