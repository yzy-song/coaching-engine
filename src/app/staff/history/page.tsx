import Link from "next/link";
import { ArrowRight, Eye, Lock } from "lucide-react";
import { LevelWord } from "@/features/staff-pwa/components/level-word";
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
        <h1 className="text-lg font-semibold tracking-tight">My practice</h1>
        <p className="text-xs text-muted-foreground">
          This is your practice space — just for you. Your manager never sees
          your individual practice scores. They only get a coaching insight,
          and only after they&apos;ve logged their own observation of you.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {history.map((entry, index) => (
          <div key={entry.id} className={`p-4 ${index > 0 ? "border-t" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{entry.title}</p>
              <span className="text-xs text-muted-foreground">{entry.dateLabel}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {entry.scores.map(({ dimension, level }) => (
                <LevelWord
                  key={dimension}
                  level={level}
                  prefix={dimensionShort[dimension]}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {managerObserved ? (
                  <>
                    <Eye className="size-3.5" />
                    Your manager logged their own observation of you — that&apos;s
                    what turns your practice into a coaching insight.
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    Waiting on your manager&apos;s floor observation — until
                    then, this practice stays just yours.
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
