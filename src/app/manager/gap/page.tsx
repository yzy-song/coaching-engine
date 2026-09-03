import { GapQuadrant } from "@/features/manager-console/components/gap-quadrant";
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

      {gap ? (
        <>
          <GapQuadrant gap={gap} staffName={staff?.name ?? "staff member"} />

          <Card className="surface-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Practice vs floor radar —{" "}
                {(staff?.name ?? "staff member").split(" ")[0]}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Every scored dimension on one chart. Dashed is the floor you
                observed; solid is practice performance.
              </p>
            </CardHeader>
            <CardContent className="mx-auto w-full max-w-md">
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
          No gap data yet — log an observation for this staff member first.
        </p>
      )}
    </div>
  );
}
