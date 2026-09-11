import { Suspense } from "react";
import { managerApi } from "@/features/manager-console/api/managerApi";
import {
  VerifyQueue,
  type VerifyQueueEntry,
} from "@/features/manager-console/components/verify-queue";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { staffMembers } from "@/lib/mock/seed";
import type { Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Verify queue — Manager Console" };

/** Sync shell: the header copy is static, so it paints immediately; only
 * the queue itself waits on the recommendation fetch. */
export default function VerifyQueuePage() {
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

      <Suspense fallback={<VerifySkeleton />}>
        <VerifyPanels />
      </Suspense>
    </div>
  );
}

/** Mirrors the queue that streams in: a title bar, the filter-chip row,
 * then the recommendation cards. */
function VerifySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function VerifyPanels() {
  const recommendations = await managerApi.listRecommendations();
  const pending = recommendations.filter((r) => r.status === "pending_verify");
  const abstained = recommendations.filter((r) => r.status === "abstained");

  const toEntry = (rec: Recommendation): VerifyQueueEntry => ({
    recommendation: rec,
    // Server first, roster second. Real rows carry database ids the mock
    // roster cannot resolve; mock rows carry no staff_name.
    staffName:
      rec.staff_name ??
      staffMembers.find((s) => s.id === rec.staff_id)?.name ??
      "Staff member",
  });

  return (
    <VerifyQueue
      entries={[...pending.map(toEntry), ...abstained.map(toEntry)]}
    />
  );
}
