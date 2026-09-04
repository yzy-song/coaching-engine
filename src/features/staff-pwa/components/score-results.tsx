"use client";

import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dimensionLabels, dimensionShort } from "@/lib/format";
import type { ScoreResult } from "@/lib/types";

export function ScoreResults({ result }: { result: ScoreResult }) {
  const [openDim, setOpenDim] = useState<string | null>(
    result.evidence[0]?.dimension ?? null
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Overall
        </p>
        <p className="mt-1 text-sm leading-relaxed">{result.overall_feedback}</p>
      </div>

      {result.scores.map(({ dimension, level }) => {
        const evidence = result.evidence.filter(
          (e) => e.dimension === dimension
        );
        const open = openDim === dimension;
        return (
          <div key={dimension} className="rounded-2xl border bg-card p-4">
            <button
              type="button"
              onClick={() => setOpenDim(open ? null : dimension)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-bold ${
                  level === null
                    ? "bg-muted text-muted-foreground"
                    : level >= 4
                      ? "bg-[oklch(0.66_0.11_150)]/15 text-[oklch(0.78_0.1_150)]"
                      : level === 3
                        ? "bg-amber-500/15 text-amber-200"
                        : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {level ?? "—"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {dimensionLabels[dimension]}
                </p>
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 w-6 rounded-full ${
                        level !== null && n <= level
                          ? level >= 4
                            ? "bg-[oklch(0.66_0.11_150)]"
                            : level === 3
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && evidence.length > 0 && (
              <div className="mt-3 space-y-2 border-t pt-3">
                {evidence.map((ev) => (
                  <div key={ev.turn_index} className="rounded-xl bg-muted/40 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold">
                      <Quote className="size-3.5 text-primary" />
                      What earned the {level} — your own words
                    </p>
                    <p className="mt-1.5 font-mono text-xs italic leading-relaxed text-muted-foreground">
                      “{ev.quote}”
                    </p>
                    <p className="mt-2 text-xs leading-relaxed">
                      {ev.explains}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {open && evidence.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No evidence span captured — this dimension stays unscored
                rather than guessed.
              </p>
            )}
          </div>
        );
      })}

      <div className="rounded-2xl border border-dashed p-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="shrink-0">
            {dimensionShort[result.scores[0].dimension]} · practice
          </Badge>
          Your manager can see this score only after logging their own floor
          observation — the two views stay independent, so the comparison is
          real.
        </p>
      </div>
    </div>
  );
}
