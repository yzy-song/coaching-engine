import { GapQuadrant } from "@/features/manager-console/components/gap-quadrant";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { staffMembers } from "@/lib/mock/seed";

export const metadata = { title: "Transfer gap — Manager Console" };

export default async function GapPage(
  props: PageProps<"/manager/gap">
) {
  const search = await props.searchParams;
  const staffId = typeof search.staff === "string" ? search.staff : "9f2c-diego";
  const gap = await managerApi.getGap(staffId);
  const staff = staffMembers.find((s) => s.id === staffId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Transfer gap — {staff?.name ?? staffId}
        </h1>
        <p className="text-sm text-muted-foreground">
          Practice performance vs what you actually saw on the floor. Two
          streams, one reading — computed only after your observation is in.
        </p>
      </div>

      {gap ? (
        <GapQuadrant gap={gap} staffName={staff?.name ?? "staff member"} />
      ) : (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          No gap data yet — log an observation for this staff member first.
        </p>
      )}
    </div>
  );
}
