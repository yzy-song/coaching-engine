import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreResults } from "@/features/staff-pwa/components/score-results";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { diegoScoreResult, scenarios } from "@/lib/mock/seed";

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

export default async function ResultsPage(
  props: PageProps<"/staff/results/[id]">
) {
  const { id } = await props.params;
  const attempt = await staffApi.getAttempt(id);
  const result =
    attempt?.result ?? (id === "8a4e-diego" ? diegoScoreResult : null);
  const scenarioId = attempt?.scenario_id ?? result?.scenario_id ?? null;
  const scenario = scenarioId
    ? scenarios.find((s) => s.id === scenarioId)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          nativeButton={false} render={<Link href="/staff/practice" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-sm font-semibold">Your practice notes</p>
          <p className="text-xs text-muted-foreground">
            One read of the whole conversation — every label points back to
            your own words.
          </p>
          {result && (
            <p className="mt-0.5 text-xs font-medium text-primary">
              {scenario?.title ?? "Practice run"} ·{" "}
              {dayLabel(result.completed_at)}
            </p>
          )}
        </div>
      </div>

      {result ? (
        <ScoreResults result={result} />
      ) : (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          This practice is still in progress — finish the conversation to see
          your notes.
        </p>
      )}

      <Button
        variant="outline"
        className="w-full"
        nativeButton={false} render={<Link href="/staff/practice" />}
      >
        Back to scenarios <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
