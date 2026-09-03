import Link from "next/link";
import { ArrowRight, ClipboardCheck, ListChecks, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { formatRate } from "@/lib/format";

export default async function ManagerOverviewPage() {
  const [recommendations, calibration, insights] = await Promise.all([
    managerApi.listRecommendations(),
    managerApi.getCalibration(),
    managerApi.getTeamInsights(),
  ]);

  const pending = recommendations.filter((r) => r.status === "pending_verify");
  const recovery = calibration.dimensions.find(
    (d) => d.dimension === "service_recovery"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Afternoon, Marta
          </h1>
          <p className="text-sm text-muted-foreground">
            {pending.length} recommendations are waiting on your read. Nothing
            routes anywhere until you verify.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/manager/observe" />}>
          <ClipboardCheck className="size-4" />
          Log an observation
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4 text-primary" />
              Verify queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">
              pending · oldest from yesterday
            </p>
            <Button
              variant="link"
              className="mt-1 h-auto p-0"
              nativeButton={false} render={<Link href="/manager/verify" />}
            >
              Open the queue <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              Calibration — service recovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {recovery ? formatRate(recovery.agreement_rate) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              agreement with managers · n = {recovery?.sample_size}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Moves live every time you verify.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-primary" />
              Team patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{insights.patterns.length}</p>
            <p className="text-xs text-muted-foreground">
              k-anonymised · {insights.suppressed.reduce((a, s) => a + s.count, 0)} suppressed
            </p>
            <Button
              variant="link"
              className="mt-1 h-auto p-0"
              nativeButton={false} render={<Link href="/manager/insights" />}
            >
              View insights <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Verify queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.map((rec) => (
            <Link
              key={rec.id}
              href={`/manager/verify/${rec.id}`}
              className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {rec.id.includes("diego") ? "DA" : rec.id.includes("ciaran") ? "CD" : "EW"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rec.headline}</p>
                <p className="text-xs text-muted-foreground">
                  {rec.citations.length} cited claims ·{" "}
                  {rec.classification}
                </p>
              </div>
              <Badge variant="outline">
                {rec.classification === "policy" ? "Policy" : "Behavioural"}
              </Badge>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <p className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">How it works:</span>{" "}
        your observation and the staff member's practice scores are two
        independent streams. The AI combines them into a transfer-gap reading,
        drafts a recommendation where every claim cites its source, and holds
        it here until you confirm, correct or reject it. Every verdict trains
        the calibration number shown above — that is the loop the system
        learns from.
      </p>
    </div>
  );
}
