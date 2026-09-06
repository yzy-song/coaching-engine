import Link from "next/link";
import { ArrowRight, Eye, Lock } from "lucide-react";
import {
  completedAttempt,
  diegoObservation,
  historyAug26Attempt,
  historyAug29Attempt,
  scenarios,
} from "@/lib/mock/seed";
import { dimensionShort } from "@/lib/format";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Aug 30" from a result's ISO completed_at, read in UTC. */
function dayLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? isoDate.slice(0, 10)
    : `${MONTH_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

const scenarioTitles = new Map(scenarios.map((s) => [s.id, s.title]));

// Rows are the seed's completed practice runs (the actor's real attempts),
// newest first. Title and date come from each attempt's scenario + result —
// no invented titles, dates or scores on this page.
const history = [
  completedAttempt,
  historyAug29Attempt,
  historyAug26Attempt,
]
  .flatMap((attempt) => {
    const result = attempt.result;
    if (!result) return [];
    return [
      {
        id: attempt.id,
        title: scenarioTitles.get(result.scenario_id) ?? "Practice run",
        dateLabel: dayLabel(result.completed_at),
        completedAt: result.completed_at,
        scores: result.scores.filter((s) => s.level !== null),
      },
    ];
  })
  .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

// The mock sequencing gate: a manager observation unlocks the actor's
// practice history. Diego's obs-001 exists, so every run below is compared
// against the floor stream.
const managerObserved = diegoObservation.staff_id === "9f2c-diego";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">My scores</h1>
        <p className="text-xs text-muted-foreground">
          Everything here is everything your manager can see — no hidden
          records, ever.
        </p>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{entry.title}</p>
              <span className="text-xs text-muted-foreground">{entry.dateLabel}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {entry.scores.map(({ dimension, level }) => (
                <span
                  key={dimension}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    level === null
                      ? "bg-muted text-muted-foreground"
                      : level >= 4
                        ? "bg-[oklch(0.66_0.11_150)]/15 text-[oklch(0.78_0.1_150)]"
                        : level === 3
                          ? "bg-amber-500/15 text-amber-200"
                          : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {dimensionShort[dimension]} · {level ?? "—"}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {managerObserved ? (
                  <>
                    <Eye className="size-3.5" />
                    Your manager logged their own observation — this score was
                    part of a transfer-gap reading.
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    Waiting on your manager's floor observation before it's
                    compared.
                  </>
                )}
              </span>
              <Link
                href={`/staff/results/${entry.id}`}
                className="flex shrink-0 items-center gap-1 font-medium text-primary"
              >
                Details <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
