import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreResults } from "@/features/staff-pwa/components/score-results";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { diegoScoreResult } from "@/lib/mock/seed";

export default async function ResultsPage(
  props: PageProps<"/staff/results/[id]">
) {
  const { id } = await props.params;
  const attempt = await staffApi.getAttempt(id);
  const result =
    attempt?.result ?? (id === "8a4e-diego" ? diegoScoreResult : null);

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
          <p className="text-sm font-semibold">Your score</p>
          <p className="text-[11px] text-muted-foreground">
            Scored once, over the whole conversation — each level points to
            your own words.
          </p>
        </div>
      </div>

      {result ? (
        <ScoreResults result={result} />
      ) : (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          This attempt is still in progress — finish the conversation to get
          scored.
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
