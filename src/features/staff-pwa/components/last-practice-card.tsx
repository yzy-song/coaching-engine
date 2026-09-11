"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { http, isRealApi } from "@/lib/api/client";
import { LevelWord } from "@/features/staff-pwa/components/level-word";
import { diegoScoreResult } from "@/lib/mock/seed";
import { dimensionShort } from "@/lib/format";
import type { ScoresResponse } from "@/lib/types";

type CardState =
  | { kind: "loading" }
  | { kind: "ready"; scores: ScoresResponse }
  | { kind: "error"; message: string };

/** The staff home's last-practice card. In mock mode it narrates the seeded
 * run (and links to its seeded results); on the real API it reads the
 * actor's own practice stream in the browser — where the X-CE-Actor header
 * is Diego's — so the 409 sequencing gate never blocks the staff member's
 * own view. */
export function LastPracticeCard() {
  const [state, setState] = useState<CardState>({ kind: "loading" });

  useEffect(() => {
    if (!isRealApi()) return;
    let cancelled = false;
    http
      .get<ScoresResponse>("/staff/Diego/scores?source=practice")
      .then((scores) => {
        if (!cancelled) setState({ kind: "ready", scores });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ kind: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isRealApi()) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Your last practice</p>
          <Link
            href="/staff/history"
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            All practice <ArrowRight className="size-3" />
          </Link>
        </div>
        {state.kind === "loading" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Reading your last practice…
          </p>
        )}
        {state.kind === "error" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Your practice notes are not available yet — {state.message}
          </p>
        )}
        {state.kind === "ready" && (
          <>
            <div className="mt-3 space-y-2">
              {[...state.scores.scores]
                .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
                .slice(0, 3)
                .map(({ id, dimension, level, recorded_at }) => (
                  <div key={id} className="flex items-center gap-3">
                    <LevelWord level={level} />
                    <p className="min-w-0 flex-1 truncate text-sm">
                      {dimensionShort[dimension]}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {recorded_at.slice(0, 10)}
                    </span>
                  </div>
                ))}
            </div>
            <Link
              href="/staff/practice"
              className="mt-3 flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3 text-sm font-medium text-primary"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Practise again — a fresh replay is one tap away
              </span>
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    );
  }

  const lastRunDay = (() => {
    const d = new Date(diegoScoreResult.completed_at);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Number.isNaN(d.getTime())
      ? diegoScoreResult.completed_at.slice(0, 10)
      : `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  })();

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Your last practice</p>
        <Link
          href="/staff/history"
          className="flex items-center gap-1 text-xs font-medium text-primary"
        >
          All practice <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="mt-3 space-y-2">
        {diegoScoreResult.scores.slice(0, 3).map(({ dimension, level }) => (
          <div key={dimension} className="flex items-center gap-3">
            <LevelWord level={level} />
            <p className="min-w-0 flex-1 truncate text-sm">
              {dimensionShort[dimension]}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {lastRunDay}
            </span>
          </div>
        ))}
      </div>
      <Link
        href="/staff/results/8a4e-diego"
        className="mt-3 flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3 text-sm font-medium text-primary"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          See what earned those labels
        </span>
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
