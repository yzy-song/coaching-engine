import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VerifyPanel } from "@/features/manager-console/components/verify-panel";
import { WhyExplainer } from "@/features/manager-console/components/why-explainer";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { staffMembers } from "@/lib/mock/seed";

export const metadata = { title: "Verify — Manager Console" };

export default async function VerifyDetailPage(
  props: PageProps<"/manager/verify/[id]">
) {
  const { id } = await props.params;
  const recommendation = await managerApi.getRecommendation(id);
  if (!recommendation) notFound();

  const staff = staffMembers.find((s) => s.id === recommendation.staff_id);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false} render={<Link href="/manager/verify" />}
      >
        <ArrowLeft className="size-4" />
        Back to queue
      </Button>

      <div className="msg-in flex flex-wrap items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
          {staff?.name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{staff?.name}</h1>
          <p className="text-xs text-muted-foreground">
            {staff?.role} · {staff?.department} · {staff?.started_at}
          </p>
        </div>
      </div>

      <div className="fade-up [animation-delay:120ms]">
        <p className="text-lg font-medium leading-snug md:text-xl">
          {recommendation.headline}
        </p>
      </div>

      {recommendation.status === "pending_verify" ? (
        <div className="fade-up [animation-delay:240ms] space-y-4">
          <VerifyPanel recommendation={recommendation} />
          <WhyExplainer recommendation={recommendation} />
        </div>
      ) : (
        <p className="rounded-xl border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          This recommendation was {recommendation.status}. Refresh the queue
          to see the latest state.
        </p>
      )}
    </div>
  );
}
