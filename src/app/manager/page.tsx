import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  ListChecks,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart } from "@/components/ui/radar-chart";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { staffMembers } from "@/lib/mock/seed";
import { dimensionLabels, dimensionShort, formatRate } from "@/lib/format";
import type { BarsDimension, TransferGap } from "@/lib/types";

const AXES = Object.keys(dimensionLabels) as BarsDimension[];

export default async function ManagerOverviewPage() {
  const [recommendations, calibration, insights, gaps] = await Promise.all([
    managerApi.listRecommendations(),
    managerApi.getCalibration(),
    managerApi.getTeamInsights(),
    Promise.all(staffMembers.map((s) => managerApi.getGap(s.id))),
  ]);

  const pending = recommendations.filter(
    (r) => r.status === "pending_verify"
  );
  const recovery = calibration.dimensions.find(
    (d) => d.dimension === "service_recovery"
  );

  const teamGaps = gaps.filter((g): g is TransferGap => g !== undefined);
  const teamPractice: Partial<Record<BarsDimension, number | null>> = {};
  const teamFloor: Partial<Record<BarsDimension, number | null>> = {};
  for (const dim of AXES) {
    const rows = teamGaps.flatMap((g) =>
      g.dimensions.filter((d) => d.dimension === dim)
    );
    if (rows.length === 0) {
      teamPractice[dim] = null;
      teamFloor[dim] = null;
      continue;
    }
    teamPractice[dim] =
      rows.reduce((sum, r) => sum + r.practice_mean, 0) / rows.length;
    teamFloor[dim] =
      rows.reduce((sum, r) => sum + r.floor_mean, 0) / rows.length;
  }
  const emptyDims = AXES.filter((a) => teamPractice[a] == null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="surface-glow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Team transfer-gap radar
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Practice mean vs what you saw on the floor, per dimension. Where
              the polygon shrinks, the floor is the problem.
            </p>
          </CardHeader>
          <CardContent>
            <RadarChart
              axes={AXES}
              series={[
                {
                  id: "practice",
                  label: "Practice mean",
                  values: teamPractice,
                  color: "var(--chart-1)",
                },
                {
                  id: "floor",
                  label: "Floor mean",
                  values: teamFloor,
                  color: "var(--chart-2)",
                  dashed: true,
                },
              ]}
              caption={`Scale 0–5 · means across ${teamGaps.length} staff${
                emptyDims.length > 0
                  ? ` · no transfer-gap evidence yet for ${emptyDims
                      .map((d) => dimensionShort[d])
                      .join(" and ")}`
                  : ""
              }`}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ListChecks className="size-4 text-primary" />
                Verify queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">
                {pending.length}
              </p>
              <p className="text-xs text-muted-foreground">
                pending · oldest from yesterday
              </p>
              <Button
                variant="link"
                className="mt-1 h-auto p-0"
                nativeButton={false}
                render={<Link href="/manager/verify" />}
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
              <p className="text-3xl font-bold tabular-nums">
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
              <p className="text-3xl font-bold tabular-nums">
                {insights.patterns.length}
              </p>
              <p className="text-xs text-muted-foreground">
                k-anonymised ·{" "}
                {insights.suppressed.reduce((a, s) => a + s.count, 0)}{" "}
                suppressed
              </p>
              <Button
                variant="link"
                className="mt-1 h-auto p-0"
                nativeButton={false}
                render={<Link href="/manager/insights" />}
              >
                View insights <ArrowRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
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
                {rec.id.includes("diego")
                  ? "DA"
                  : rec.id.includes("ciaran")
                    ? "CD"
                    : "EW"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rec.headline}</p>
                <p className="text-xs text-muted-foreground">
                  {rec.citations.length} cited claims · {rec.classification}
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

      <p className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">How it works:</span>{" "}
        your observation and the staff member's practice scores are two
        independent streams. The AI combines them into a transfer-gap reading,
        drafts a recommendation where every claim cites its source, and holds
        it here until you confirm, correct or reject it. Every verdict trains
        the calibration number shown above — that is the loop the system
        learns from. Simulations only prove what staff can do in practice —
        Cornell's own AI-training research stops there. The floor is where it
        counts.
      </p>
    </div>
  );
}
