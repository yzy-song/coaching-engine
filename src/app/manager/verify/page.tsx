import { managerApi } from "@/features/manager-console/api/managerApi";
import {
  VerifyQueue,
  type VerifyQueueEntry,
} from "@/features/manager-console/components/verify-queue";
import { staffMembers } from "@/lib/mock/seed";
import type { Recommendation } from "@/lib/types";

export const metadata = { title: "Verify queue — Manager Console" };

export default async function VerifyQueuePage() {
  const recommendations = await managerApi.listRecommendations();
  const pending = recommendations.filter((r) => r.status === "pending_verify");
  const abstained = recommendations.filter((r) => r.status === "abstained");

  const toEntry = (rec: Recommendation): VerifyQueueEntry => ({
    recommendation: rec,
    staffName:
      staffMembers.find((s) => s.id === rec.staff_id)?.name ?? "Staff member",
  });

  return (
    <div className="space-y-6">
      <div className="msg-in">
        <h1 className="text-2xl font-semibold tracking-tight">Verify queue</h1>
        <p className="text-sm text-muted-foreground">
          The agent drafts with citations, then stops. Nothing routes until
          you confirm, correct or reject — and every verdict trains the
          calibration number.
        </p>
      </div>

      <VerifyQueue
        entries={[...pending.map(toEntry), ...abstained.map(toEntry)]}
      />
    </div>
  );
}
