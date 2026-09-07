import { ArrowDownRight, ArrowUpRight, EyeOff, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { classificationMeta, dimensionShort } from "@/lib/format";
import type { EscalationRoute, TeamPattern } from "@/lib/types";

export const metadata = { title: "Team insights — Manager Console" };

const routeLabel: Record<EscalationRoute, string> = {
  manager: "Duty manager",
  ld_hr: "LD/HR",
  operations: "Operations / GM",
};

/**
 * Trend data is not part of the frozen TeamPattern yet — the cohort service
 * may attach it later. When it does, it arrives in the same weekly-gap shape
 * the transfer-gap dimensions use (seed.ts), so derive up/down from the first
 * and last points. Anything unrecognised renders nothing rather than guessing.
 */
interface TrendReading {
  direction: "up" | "down";
  span: string | null;
}

function readTrend(pattern: TeamPattern): TrendReading | null {
  const raw = (pattern as TeamPattern & { trend?: unknown }).trend;
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "string") {
    const direction =
      raw === "rising" || raw === "up" || raw === "worsening"
        ? "up"
        : raw === "falling" || raw === "down" || raw === "improving"
          ? "down"
          : null;
    return direction ? { direction, span: null } : null;
  }
  if (typeof raw !== "object") return null;
  const direction =
    "direction" in raw &&
    (raw.direction === "up" || raw.direction === "down")
      ? raw.direction
      : null;
  if (direction) return { direction, span: null };
  if (Array.isArray(raw) && raw.length >= 2) {
    const points = raw as Array<{ week?: unknown; gap?: unknown }>;
    const firstGap = points[0]?.gap;
    const lastGap = points[points.length - 1]?.gap;
    if (typeof firstGap !== "number" || typeof lastGap !== "number") {
      return null;
    }
    const direction =
      lastGap > firstGap + 0.0001
        ? "up"
        : lastGap < firstGap - 0.0001
          ? "down"
          : null;
    if (!direction) return null;
    const weeks = points
      .map((p) => p.week)
      .filter((w): w is string => typeof w === "string");
    return {
      direction,
      span:
        weeks.length >= 2 ? `${weeks[0]}–${weeks[weeks.length - 1]}` : null,
    };
  }
  return null;
}

export default async function InsightsPage() {
  const insights = await managerApi.getTeamInsights();

  return (
    <div className="space-y-6">
      <div className="msg-in">
        <h1 className="text-2xl font-semibold tracking-tight">Team insights</h1>
        <p className="text-sm text-muted-foreground">
          Patterns across the whole team, shown only when at least{" "}
          {insights.k_threshold} staff share them — so no individual can be
          singled out. Individual coaching is suppressed when the root cause
          is process or policy.
        </p>
      </div>

      <div className="fade-up [animation-delay:100ms] flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground">
          Window {insights.window.start} → {insights.window.end}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          k-anonymity threshold: {insights.k_threshold}
        </span>
      </div>

      <div className="space-y-4">
        {insights.patterns.map((pattern, i) => {
          const trend = readTrend(pattern);
          return (
            <Card
              key={pattern.id}
              className="fade-up transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <CardContent className="space-y-4 p-5">
                {/* Action comes first, not the chart (team decision): the
                    manager leaves with the one thing to do. */}
                <div className="rounded-2xl border bg-card p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <span aria-hidden className="size-2 shrink-0 rounded-sm bg-primary" />
                    Suggested action
                  </p>
                  <p className="mt-1.5 text-base font-semibold leading-snug">
                    {pattern.suggested_action}
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    {dimensionShort[pattern.dimension]} ·{" "}
                    {classificationMeta[pattern.classification].label}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {pattern.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
                    <Users className="size-3.5" />
                    {pattern.staff_count} staff
                  </span>
                  {trend && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
                        trend.direction === "up"
                          ? "bg-[oklch(0.66_0.09_30)]/12 text-[oklch(0.45_0.08_30)]"
                          : "bg-[oklch(0.76_0.07_74)]/15 text-[oklch(0.45_0.07_72)]"
                      }`}
                    >
                      {trend.direction === "up" ? (
                        <ArrowUpRight className="size-3.5" />
                      ) : (
                        <ArrowDownRight className="size-3.5" />
                      )}
                      {trend.direction === "up"
                        ? "Trending up"
                        : "Trending down"}
                      {trend.span ? ` · ${trend.span}` : ""}
                    </span>
                  )}
                  <Badge className="ml-auto bg-primary text-primary-foreground">
                    → {routeLabel[pattern.route]}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {classificationMeta[pattern.classification].hint} Detected{" "}
                  {pattern.detected_at.slice(0, 10)}.
                </p>
              </CardContent>
            </Card>
          );
        })}

        {insights.suppressed.map((s) => (
          <div
            key={s.reason}
            className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground"
          >
            <EyeOff className="size-4 shrink-0" />
            {s.count} pattern{s.count > 1 ? "s" : ""} hidden — group smaller
            than {insights.k_threshold} staff, so they can&apos;t be shown
            without identifying someone.
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
