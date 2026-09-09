"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FilterX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyQueueCard } from "./verify-queue-card";
import { dimensionShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BarsDimension, Recommendation } from "@/lib/types";

export interface VerifyQueueEntry {
  recommendation: Recommendation;
  staffName: string;
}

/** Chips follow the canonical BARS order, showing only dimensions that
 * actually appear in the queue. */
const DIMENSION_ORDER: BarsDimension[] = [
  "service_recovery",
  "empathy",
  "communication",
  "composure",
  "anticipation",
];

type QueueFilter =
  | { kind: "all" }
  | { kind: "abstained" }
  | { kind: "dimension"; dimension: BarsDimension };

const chipClasses = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
  );

/**
 * The interactive verify queue: filter chips on top, inline expansion per
 * card, and local removal once a verdict is recorded. All state updates are
 * immutable — rows are filtered into new arrays, never mutated in place.
 */
export function VerifyQueue({ entries }: { entries: VerifyQueueEntry[] }) {
  const [items, setItems] = useState<VerifyQueueEntry[]>(entries);
  const [filter, setFilter] = useState<QueueFilter>({ kind: "all" });
  const [openId, setOpenId] = useState<string | null>(null);

  const pending = items.filter(
    (entry) => entry.recommendation.status === "pending_verify"
  );
  const hasAbstained = items.some(
    (entry) => entry.recommendation.status === "abstained"
  );

  const dimensionChips = useMemo(() => {
    const present = new Set(
      items.map((entry) => entry.recommendation.calibration.dimension)
    );
    return DIMENSION_ORDER.filter((dimension) => present.has(dimension));
  }, [items]);

  const visible = useMemo(() => {
    if (filter.kind === "abstained") {
      return items.filter(
        (entry) => entry.recommendation.status === "abstained"
      );
    }
    if (filter.kind === "dimension") {
      return items.filter(
        (entry) =>
          entry.recommendation.calibration.dimension === filter.dimension
      );
    }
    return items;
  }, [items, filter]);

  const handleToggle = (id: string) => {
    setOpenId((open) => (open === id ? null : id));
  };

  const handleVerified = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.recommendation.id !== id));
    setOpenId((open) => (open === id ? null : open));
  };

  // "New" rides the first pending recommendation of the queue, regardless of
  // the active filter.
  const firstPendingId = pending[0]?.recommendation.id ?? null;

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-5 text-primary" />
            Queue clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Every recommendation has a verdict. New drafts appear here as
            observations come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div
        role="group"
        aria-label="Filter the queue"
        className="msg-in flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={filter.kind === "all"}
          className={chipClasses(filter.kind === "all")}
          onClick={() => setFilter({ kind: "all" })}
        >
          All
        </button>
        {dimensionChips.map((dimension) => {
          const active =
            filter.kind === "dimension" && filter.dimension === dimension;
          return (
            <button
              key={dimension}
              type="button"
              aria-pressed={active}
              className={chipClasses(active)}
              onClick={() => setFilter({ kind: "dimension", dimension })}
            >
              {dimensionShort[dimension]}
            </button>
          );
        })}
        {hasAbstained && (
          <button
            type="button"
            aria-pressed={filter.kind === "abstained"}
            className={chipClasses(filter.kind === "abstained")}
            onClick={() => setFilter({ kind: "abstained" })}
          >
            Abstained
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((entry, index) => (
          <VerifyQueueCard
            key={entry.recommendation.id}
            recommendation={entry.recommendation}
            staffName={entry.staffName}
            isNew={entry.recommendation.id === firstPendingId}
            expanded={openId === entry.recommendation.id}
            index={index}
            onToggle={() => handleToggle(entry.recommendation.id)}
            onVerified={() => handleVerified(entry.recommendation.id)}
          />
        ))}

        {visible.length === 0 && (
          <Card className="fade-up [animation-delay:120ms]">
            <CardContent className="flex items-center gap-3 p-4 md:p-5">
              <FilterX
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                No recommendations match this filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
