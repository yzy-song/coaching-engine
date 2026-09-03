import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { DebriefEntry } from "@/features/staff-pwa/components/debrief-entry";
import { diegoScoreResult } from "@/lib/mock/seed";
import { dimensionShort } from "@/lib/format";

export default function StaffHomePage() {
  const lastScore = diegoScoreResult;

  return (
    <div className="space-y-5">
      <DebriefEntry />

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Your last practice</p>
          <Link
            href="/staff/history"
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            All scores <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {lastScore.scores.slice(0, 3).map(({ dimension, level }) => (
            <div key={dimension} className="flex items-center gap-3">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  level === null
                    ? "bg-muted text-muted-foreground"
                    : level >= 4
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-200"
                }`}
              >
                {level ?? "—"}
              </span>
              <p className="flex-1 text-sm">{dimensionShort[dimension]}</p>
              <span className="text-xs text-muted-foreground">
                Sep 2
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
            See what earned those scores
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        You can see every record a manager can see about you. Nothing here is
        hidden, and nothing routes to a disciplinary path.
      </p>
    </div>
  );
}
