"use client";

import { useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dimensionShort,
  formatGap,
  observationDimensionLabels,
  quadrantMeta,
} from "@/lib/format";
import type { GapDimension, Quadrant, TransferGap } from "@/lib/types";

/** Quadrant badge tones — one per quadrant, keyed by the tone the dataset
 * rows already carry (see quadrantMeta in lib/format.ts). */
const toneClasses: Record<string, { chip: string; text: string }> = {
  emerald: {
    chip: "bg-[oklch(0.66_0.11_150)]/15 text-[oklch(0.78_0.1_150)] border-[oklch(0.66_0.11_150)]/30",
    text: "text-[oklch(0.78_0.1_150)]",
  },
  amber: {
    chip: "bg-[oklch(0.79_0.12_80)]/15 text-[oklch(0.84_0.11_85)] border-[oklch(0.79_0.12_80)]/30",
    text: "text-[oklch(0.84_0.11_85)]",
  },
  rose: {
    chip: "bg-[oklch(0.69_0.13_35)]/15 text-[oklch(0.78_0.11_35)] border-[oklch(0.69_0.13_35)]/30",
    text: "text-[oklch(0.78_0.11_35)]",
  },
  violet: {
    chip: "bg-[oklch(0.64_0.07_340)]/15 text-[oklch(0.76_0.07_340)] border-[oklch(0.64_0.07_340)]/30",
    text: "text-[oklch(0.76_0.07_340)]",
  },
};

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
  const [selected, setSelected] = useState(gap.dimensions[0]?.dimension);
  const active =
    gap.dimensions.find((d) => d.dimension === selected) ?? gap.dimensions[0];
  const leadTone = lead ? toneClasses[quadrantMeta[lead.quadrant].tone] : null;

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
            One row per scored dimension: practice mean → floor mean, with the
            quadrant reading as the badge. Select a row for the evidence
            behind it.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {gap.dimensions.map((d) => (
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
                <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                  practice {d.practice_mean.toFixed(1)} → floor{" "}
                  {d.floor_mean.toFixed(1)}
                </span>
              </span>
              <Badge
                variant="outline"
                className={`shrink-0 ${toneClasses[quadrantMeta[d.quadrant].tone].chip}`}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {dimensionShort[active.dimension]} —{" "}
                  <span
                    className={
                      toneClasses[quadrantMeta[active.quadrant].tone].text
                    }
                  >
                    {quadrantMeta[active.quadrant].label}
                  </span>
                </p>
                <Badge variant="outline" className="shrink-0">
                  gap {formatGap(active.gap)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.reading}
              </p>
              <div className="mt-3 flex items-end gap-6 text-xs">
                <div>
                  <p className="text-muted-foreground">Practice</p>
                  <p className="text-lg font-bold">
                    {active.practice_mean.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground">
                    n = {active.practice_n}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Floor</p>
                  <p className="text-lg font-bold">
                    {active.floor_mean.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground">n = {active.floor_n}</p>
                </div>
                {/* A slope is only claimed from ≥ 3 weekly points (LLD-D §4.4);
                    fewer than that and the trend label is withheld. */}
                {active.trend.length >= 3 && (
                  <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="size-3.5" />
                    {active.trend.map((t) => t.gap).join(" → ")}
                    <ArrowUpRight className="size-3.5 text-rose-400" />
                  </div>
                )}
              </div>
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
