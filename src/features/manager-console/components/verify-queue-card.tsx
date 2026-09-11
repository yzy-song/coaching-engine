"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { Ban, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerifyPanel } from "./verify-panel";
import { WhyExplainer } from "./why-explainer";
import { classificationMeta, dimensionShort, primaryCalibration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

/** "2d" or "5h". A queue with no age has no order to work in. */
function ageLabel(iso: string | undefined): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Muted, not loud. The classification steers what a manager does about the
 * read, so it earns a place in the row — but loud coloured chips down a page
 * are noise rather than signal. */
const TYPE_TONE: Record<string, string> = {
  behavioural: "text-[oklch(0.45_0.07_72)]",
  process: "text-[oklch(0.43_0.06_115)]",
  policy: "text-[oklch(0.45_0.08_30)]",
};

/**
 * One row of the /manager/verify queue.
 *
 * Anchor invariant (QA): every pending card keeps exactly ONE anchor to its
 * detail page — the staff-name/headline block — and no other anchor to
 * /manager/verify/ exists anywhere on the page. The chevron (and the card face
 * outside the link) toggles the verification UI in place instead.
 */
export function VerifyQueueCard({
  recommendation,
  staffName,
  isNew,
  expanded,
  index,
  onToggle,
  onVerified,
}: {
  recommendation: Recommendation;
  staffName: string;
  isNew: boolean;
  expanded: boolean;
  index: number;
  onToggle: () => void;
  onVerified: () => void;
}) {
  const pending = recommendation.status === "pending_verify";
  const panelId = `verify-panel-${recommendation.id}`;
  // Array from the API, object from the mock. Undefined here silently
  // labelled every queue row "undefined" rather than failing loudly.
  const calibrationDimension = primaryCalibration(
    recommendation.calibration
  )?.dimension;
  const dimensionLabel = calibrationDimension
    ? dimensionShort[calibrationDimension]
    : null;
  const typeLabel = recommendation.classification
    ? classificationMeta[recommendation.classification]?.label
    : null;
  const age = ageLabel(recommendation.created_at);

  /** Blank space on the pending header expands in place; clicks on the detail
   * link or the chevron are left to their own behaviour. */
  const handleHeaderClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target || target.closest("a, button")) return;
    onToggle();
  };

  const chevron = (
    <ChevronDown
      className={cn(
        "size-4 shrink-0 transition-transform",
        expanded && "rotate-180"
      )}
      aria-hidden
    />
  );

  return (
    <Card
      data-status={recommendation.status}
      className={cn(
        "fade-up transition-all duration-200",
        pending
          ? "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
          : "border-dashed",
        expanded && "shadow-sm ring-primary/40"
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <CardContent className="p-4 md:p-5">
        {pending ? (
          <>
            <div className="flex items-start gap-3" onClick={handleHeaderClick}>
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-controls={panelId}
                aria-label="Review this recommendation in place"
                className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {chevron}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {isNew && (
                    <Badge className="bg-primary text-primary-foreground">
                      New
                    </Badge>
                  )}
                  {typeLabel ? (
                    <span
                      className={`rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium ${
                        TYPE_TONE[recommendation.classification ?? ""] ??
                        "text-muted-foreground"
                      }`}
                    >
                      {typeLabel}
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {dimensionLabel}
                    </span>
                  )}
                  {age && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {age}
                    </span>
                  )}
                </div>
                <Link
                  href={`/manager/verify/${recommendation.id}`}
                  className="group/link mt-1 block rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <p className="text-sm font-semibold leading-snug transition-colors group-hover/link:text-primary">
                    {staffName}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                    {recommendation.headline}
                  </p>
                </Link>
              </div>
            </div>

            {expanded && (
              <div id={panelId} className="mt-4 space-y-4 border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Verify the read
                </p>
                <VerifyPanel
                  recommendation={recommendation}
                  onSettled={onVerified}
                />
                <WhyExplainer recommendation={recommendation} />
              </div>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={
                expanded
                  ? "Collapse the abstained recommendation"
                  : "See why the agent abstained"
              }
              className="flex w-full items-start gap-3 text-left"
            >
              <Ban
                className="mt-1.5 size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug">
                  {staffName}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                  {recommendation.headline}
                </span>
              </span>
              <span className="mt-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {dimensionLabel}
              </span>
              <Badge variant="secondary" className="mt-1.5">
                Abstained
              </Badge>
              {age && (
                <span className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {age}
                </span>
              )}
              <span className="mt-1.5 shrink-0">{chevron}</span>
            </button>

            {expanded && (
              <div id={panelId} className="mt-4 space-y-3 border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why the agent abstained
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {recommendation.body}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
