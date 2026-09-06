import Link from "next/link";
import { ArrowRight, Ban, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { staffMembers } from "@/lib/mock/seed";

export const metadata = { title: "Verify queue — Manager Console" };

export default async function VerifyQueuePage() {
  const recommendations = await managerApi.listRecommendations();
  const pending = recommendations.filter((r) => r.status === "pending_verify");
  const abstained = recommendations.filter((r) => r.status === "abstained");

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

      <div className="space-y-3">
        {pending.map((rec, i) => {
          const staff = staffMembers.find((s) => s.id === rec.staff_id);
          return (
            <Link key={rec.id} href={`/manager/verify/${rec.id}`} className="block">
              <Card
                className="fade-up transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/30 hover:shadow-[0_10px_30px_-16px_var(--primary)]"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <CardContent className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                  {i === 0 && (
                    <Badge className="bg-primary text-primary-foreground">
                      New
                    </Badge>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {staff?.name ?? "Staff member"}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {rec.headline}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {abstained.map((rec) => (
          <Card key={rec.id} className="border-dashed">
            <CardContent className="flex items-center gap-3 p-4 md:p-5">
              <Ban className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{rec.headline}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {rec.body}
                </p>
              </div>
              <Badge variant="secondary">Abstained</Badge>
            </CardContent>
          </Card>
        ))}

        {pending.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-5 text-[oklch(0.7_0.11_150)]" />
                Queue clear
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every recommendation has a verdict. New drafts appear here as
                observations come in.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
