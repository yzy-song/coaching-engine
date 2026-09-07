"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, MessageSquareQuote, Radar, ClipboardList, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { citationKindLabel, classificationMeta, formatRate } from "@/lib/format";
import type { Citation, Recommendation } from "@/lib/types";

const citationIcons: Record<Citation["kind"], typeof MessageSquareQuote> = {
  attempt_turn: MessageSquareQuote,
  observation: ClipboardList,
  sop_chunk: BookOpen,
  rubric_anchor: Target,
  metric: Radar,
};

/** Label fallback for kinds the shared formatter has not been taught yet. */
const citationKindFallback: Partial<Record<Citation["kind"], string>> = {
  rubric_anchor: "Rubric anchor",
};

const classificationTone: Record<string, string> = {
  behavioural: "bg-[oklch(0.76_0.07_74)]/15 text-[oklch(0.45_0.07_72)] border-[oklch(0.76_0.07_74)]/30",
  process: "bg-[oklch(0.63_0.06_115)]/12 text-[oklch(0.43_0.06_115)] border-[oklch(0.63_0.06_115)]/30",
  policy: "bg-[oklch(0.66_0.09_30)]/12 text-[oklch(0.45_0.08_30)] border-[oklch(0.66_0.09_30)]/30",
};

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const [openCitation, setOpenCitation] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={classificationTone[recommendation.classification]}
          >
            {classificationMeta[recommendation.classification].label}
          </Badge>
          {recommendation.citations.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {recommendation.citations.length} cited claims
            </span>
          )}
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {recommendation.trace_id}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold leading-snug md:text-xl">
            {recommendation.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {recommendation.body}
          </p>
        </div>

        {recommendation.suggested_action && (
          <div className="rounded-xl border border-primary/25 bg-accent/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Suggested action
            </p>
            <p className="mt-1 text-sm font-medium">
              {recommendation.suggested_action}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Evidence — every claim, checkable in one tap
          </p>
          {recommendation.citations.map((citation) => {
            const open = openCitation === citation.source_ref;
            const Icon = citationIcons[citation.kind];
            return (
              <div
                key={citation.source_ref}
                className={`rounded-xl border transition-colors ${
                  open ? "border-primary/40 bg-accent/20" : "bg-muted/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenCitation(open ? null : citation.source_ref)
                  }
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <Icon
                    className={`size-4 shrink-0 ${open ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="flex-1 text-sm font-medium">
                    {citation.claim}
                  </span>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {citationKindLabel[citation.kind] ??
                      citationKindFallback[citation.kind] ??
                      citation.kind.replace("_", " ")}
                  </Badge>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && citation.quoted_span && (
                  <div className="border-t px-3 py-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      “{citation.quoted_span}”
                    </p>
                    <p className="mt-1.5 text-xs tabular-nums text-muted-foreground/70">
                      {citation.source_ref}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/40 p-4 text-xs">
          <span className="text-muted-foreground">
            AI agreement on {recommendation.calibration.dimension.replace("_", " ")}:
          </span>
          <span className="text-sm font-bold">
            {formatRate(recommendation.calibration.agreement_rate)}
          </span>
          <span className="text-muted-foreground">
            (n = {recommendation.calibration.sample_size})
          </span>
          <p className="w-full text-muted-foreground">
            {recommendation.calibration.advice}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
