import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { DebriefEntry } from "@/features/staff-pwa/components/debrief-entry";
import { diegoScoreResult } from "@/lib/mock/seed";
import { dimensionShort } from "@/lib/format";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Aug 30" from the result's ISO completed_at, read in UTC. */
function dayLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? isoDate.slice(0, 10)
    : `${MONTH_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export default function StaffHomePage() {
  const lastScore = diegoScoreResult;
  const lastRunDay = dayLabel(diegoScoreResult.completed_at);

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
                      ? "bg-[oklch(0.66_0.11_150)]/15 text-[oklch(0.78_0.1_150)]"
                      : "bg-amber-500/15 text-amber-200"
                }`}
              >
                {level ?? "—"}
              </span>
              <p className="flex-1 text-sm">{dimensionShort[dimension]}</p>
              <span className="text-xs text-muted-foreground">
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
            See what earned those scores
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Everything your manager sees about you, you see too. Nothing here is
        hidden, and nothing routes to a disciplinary path.
      </p>
    </div>
  );
}
