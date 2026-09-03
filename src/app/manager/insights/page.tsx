import { EyeOff, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { classificationMeta, dimensionShort } from "@/lib/format";

export const metadata = { title: "Team insights — Manager Console" };

const routeLabel: Record<string, string> = {
  manager: "Duty manager",
  ld: "L&D",
  operations: "Operations / GM",
};

export default async function InsightsPage() {
  const insights = await managerApi.getTeamInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team insights</h1>
        <p className="text-sm text-muted-foreground">
          Patterns across the whole team, shown only when at least{" "}
          {insights.k_threshold} staff share them — so no individual can be
          singled out. Individual coaching is suppressed when the root cause
          is process or policy.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground">
          Window {insights.window.start} → {insights.window.end}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          k-anonymity threshold: {insights.k_threshold}
        </span>
      </div>

      <div className="space-y-4">
        {insights.patterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">
                  {pattern.staff_count} staff ·{" "}
                  {dimensionShort[pattern.dimension]} ·{" "}
                  {classificationMeta[pattern.classification].label}
                </CardTitle>
                <Badge className="ml-auto bg-primary text-primary-foreground">
                  → {routeLabel[pattern.route]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{pattern.description}</p>
              <div className="rounded-xl border border-primary/25 bg-accent/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Suggested action
                </p>
                <p className="mt-1 text-sm">{pattern.suggested_action}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {classificationMeta[pattern.classification].hint} Detected{" "}
                {pattern.detected_at.slice(0, 10)}.
              </p>
            </CardContent>
          </Card>
        ))}

        {insights.suppressed.map((s) => (
          <div
            key={s.reason}
            className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground"
          >
            <EyeOff className="size-4 shrink-0" />
            {s.count} pattern{s.count > 1 ? "s" : ""} hidden — group smaller
            than {insights.k_threshold} staff, so they can't be shown without
            identifying someone.
          </div>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
        <Users className="mt-0.5 size-4 shrink-0" />
        No individual staff surveillance: insights aggregate at team level,
        every flag explains why it was raised, and staff can see every record
        a manager can see about them.
      </p>
    </div>
  );
}
