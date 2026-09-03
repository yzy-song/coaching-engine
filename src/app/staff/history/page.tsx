import Link from "next/link";
import { ArrowRight, Eye, Lock } from "lucide-react";
import { diegoScoreResult } from "@/lib/mock/seed";
import { dimensionShort } from "@/lib/format";

const history = [
  {
    date: "Sep 2",
    title: "Late check-in complaint",
    id: "8a4e-diego",
    scores: diegoScoreResult.scores,
    managerViewed: true,
  },
  {
    date: "Aug 29",
    title: "The forgotten anniversary",
    id: "8a4e-diego",
    scores: [
      { dimension: "anticipation" as const, level: 3 },
      { dimension: "communication" as const, level: 3 },
      { dimension: "empathy" as const, level: 4 },
    ],
    managerViewed: true,
  },
  {
    date: "Aug 26",
    title: "Noise complaint at midnight",
    id: "8a4e-diego",
    scores: [
      { dimension: "composure" as const, level: 4 },
      { dimension: "communication" as const, level: 2 },
    ],
    managerViewed: false,
  },
];

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">My scores</h1>
        <p className="text-xs text-muted-foreground">
          Everything here is everything your manager can see — no hidden
          records, ever.
        </p>
      </div>

      <div className="space-y-3">
        {history.map((entry, i) => (
          <div key={i} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{entry.title}</p>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {entry.scores.map(({ dimension, level }) => (
                <span
                  key={dimension}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    level === null
                      ? "bg-muted text-muted-foreground"
                      : level >= 4
                        ? "bg-emerald-100 text-emerald-800"
                        : level === 3
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {dimensionShort[dimension]} · {level ?? "—"}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {entry.managerViewed ? (
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
