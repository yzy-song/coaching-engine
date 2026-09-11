import Link from "next/link";
import { Suspense } from "react";
import { GapQuadrant } from "@/features/manager-console/components/gap-quadrant";
import { LastScoresPanel } from "@/features/manager-console/components/last-scores-panel";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { RadarChart } from "@/components/ui/radar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { staffMembers } from "@/lib/mock/seed";
import { dimensionLabels } from "@/lib/format";
import type { BarsDimension } from "@/lib/types";

/** Rendered per request, never prerendered.
 *
 * Without this Next may statically render at build time and the page freezes
 * with whatever the database held during deployment. Everything here is live
 * operational data, and a manager acting on a stale queue is worse than a
 * manager waiting a moment for a fresh one.
 */
export const dynamic = "force-dynamic";

export const metadata = { title: "Transfer gap — Manager Console" };

const AXES = Object.keys(dimensionLabels) as BarsDimension[];

/** Sync shell: paints immediately. The heading carries the staff name and
 * the chip row needs the live roster, so both stream in with the panels
 * behind the skeleton instead of blocking first paint. */
export default function GapPage(props: PageProps<"/manager/gap">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<GapSkeleton />}>
        <GapPanels {...props} />
      </Suspense>
    </div>
  );
}

/** Mirrors what streams in: the title (staff name), the subtitle, the
 * roster chip row, then the reading card. */
function GapSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <div className="flex gap-2 overflow-hidden pb-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

async function GapPanels(props: PageProps<"/manager/gap">) {
  const search = await props.searchParams;
  // Real mode lists the live roster; mock mode falls back to the seed.
  const [roster, recommendations] = await Promise.all([
    managerApi.listStaff(),
    managerApi.listRecommendations().catch(() => []),
  ]);
  // Who needs looking at, not who exists. One request: a recommendation only
  // exists where a gap was found, so the pending count ranks the row without
  // the per-person fan-out that makes the overview slow.
  const openByStaff = new Map<string, number>();
  for (const r of recommendations) {
    if (r.status !== "pending_verify") continue;
    openByStaff.set(r.staff_id, (openByStaff.get(r.staff_id) ?? 0) + 1);
  }
  const switcher = roster
    .map((m) => ({ ...m, open: openByStaff.get(m.id) ?? 0 }))
    .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
  const staffId =
    typeof search.staff === "string" ? search.staff : (roster[0]?.id ?? "9f2c-diego");
  // A stale or unknown id must land on the empty state, never a 500.
  let gap: Awaited<ReturnType<typeof managerApi.getGap>> = undefined;
  try {
    gap = await managerApi.getGap(staffId);
  } catch {
    gap = undefined;
  }
  const staff =
    roster.find((s) => s.id === staffId) ??
    staffMembers.find((s) => s.id === staffId);

  const practiceValues: Partial<Record<BarsDimension, number | null>> = {};
  const floorValues: Partial<Record<BarsDimension, number | null>> = {};
  if (gap) {
    for (const d of gap.dimensions) {
      practiceValues[d.dimension] = d.practice_mean;
      floorValues[d.dimension] = d.floor_mean;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Transfer gap — {staff?.name ?? staffId}
        </h1>
        <p className="text-sm text-muted-foreground">
          Practice performance vs what you actually saw on the floor. Two
          streams, one reading — computed only after your observation is in.
        </p>
      </div>

      {/* Team switcher, ordered by who has reads waiting, scrolling
          horizontally on narrow screens. The badge is the count, so the row
          answers "who needs me" before it is scrolled. */}
      <nav aria-label="Team members" className="flex gap-2 overflow-x-auto pb-1">
        {switcher.map((member) => {
          const active = member.id === staffId;
          return (
            <Link
              key={member.id}
              href={`/manager/gap?staff=${member.id}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {member.name.split(" ")[0]}
              {member.open > 0 && (
                <span
                  title={`${member.open} waiting on your read`}
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                    active
                      ? "bg-primary-foreground/25"
                      : "bg-[oklch(0.76_0.07_74)]/25 text-[oklch(0.42_0.07_72)]"
                  }`}
                >
                  {member.open}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {gap ? (
        <>
          {/* The conclusion card and per-dimension badge rows carry the
              reading; the radar chart stays below as supporting evidence. */}
          <GapQuadrant gap={gap} staffName={staff?.name ?? "staff member"} />
          <LastScoresPanel key={staffId} staffId={staffId} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Practice vs floor radar —{" "}
                {(staff?.name ?? "staff member").split(" ")[0]}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Supporting chart — the scored dimensions at a glance. Solid =
                practice (simulation). Dashed = floor (observed). Where the
                dashed line falls inside the solid one, the floor is trailing
                practice — that is the transfer gap.
              </p>
            </CardHeader>
            <CardContent className="mx-auto w-full max-w-sm">
              <RadarChart
                axes={AXES}
                series={[
                  {
                    id: "practice",
                    label: "Practice mean",
                    values: practiceValues,
                    color: "var(--chart-1)",
                  },
                  {
                    id: "floor",
                    label: "Floor mean",
                    values: floorValues,
                    color: "var(--chart-2)",
                    dashed: true,
                  },
                ]}
                caption="Where the dashed line falls inside the solid one, the floor is trailing practice — unscored axes sit at the centre"
                showValues={false}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          No gap data yet for {staff ? staff.name.split(" ")[0] : "this staff member"}{" "}
          — log a floor observation first; the transfer gap appears once both
          streams have scores.
        </p>
      )}
    </div>
  );
}
