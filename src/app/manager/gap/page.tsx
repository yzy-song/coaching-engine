import Link from "next/link";
import { GapQuadrant } from "@/features/manager-console/components/gap-quadrant";
import { LastScoresPanel } from "@/features/manager-console/components/last-scores-panel";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { RadarChart } from "@/components/ui/radar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staffMembers } from "@/lib/mock/seed";
import { dimensionLabels } from "@/lib/format";
import type { BarsDimension } from "@/lib/types";

export const metadata = { title: "Transfer gap — Manager Console" };

const AXES = Object.keys(dimensionLabels) as BarsDimension[];

export default async function GapPage(
  props: PageProps<"/manager/gap">
) {
  const search = await props.searchParams;
  const staffId = typeof search.staff === "string" ? search.staff : "9f2c-diego";
  const gap = await managerApi.getGap(staffId);
  const staff = staffMembers.find((s) => s.id === staffId);

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

      {/* Team switcher: one chip per roster member, scrolling horizontally
          on narrow screens. Active staff gets the primary accent. */}
      <nav aria-label="Team members" className="flex gap-2 overflow-x-auto pb-1">
        {staffMembers.map((member) => {
          const active = member.id === staffId;
          return (
            <Link
              key={member.id}
              href={`/manager/gap?staff=${member.id}`}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {member.name.split(" ")[0]}
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
                caption={`Scale 0–5 · ${gap.dimensions.length} of ${AXES.length} dimensions scored — unscored axes sit at the centre`}
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
