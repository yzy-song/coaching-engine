"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { observationDimensionLabels } from "@/lib/format";
import type { ObservationDimension, StaffMember } from "@/lib/types";

const RATED_DIMENSIONS: Array<{
  dimension: ObservationDimension;
  prompt: string;
}> = [
  {
    dimension: "service_recovery",
    prompt: "Did they attempt recovery before escalating?",
  },
  {
    dimension: "empathy",
    prompt: "Did they validate what the guest actually said?",
  },
  {
    dimension: "confidence",
    prompt: "How sure did they seem under pressure?",
  },
];

export function ObservationForm({ staff }: { staff: StaffMember[] }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [context, setContext] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [ratings, setRatings] = useState<
    Record<string, number | null>
  >({
    service_recovery: null,
    empathy: null,
    confidence: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [result, setResult] = useState<{ recommendation_id: string } | null>(null);

  const canSubmit =
    staffId && whatHappened.trim().length > 0 && context.trim().length > 0;

  useEffect(() => {
    if (!unlocked) return;
    const t = window.setTimeout(() => {
      router.push(`/manager/gap?staff=${staffId}&fresh=1`);
    }, 2600);
    return () => window.clearTimeout(t);
  }, [unlocked, staffId, router]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: staffId,
          observed_at: new Date().toISOString(),
          context,
          what_happened: whatHappened,
          ratings: RATED_DIMENSIONS.map(({ dimension }) => ({
            dimension,
            level: ratings[dimension],
          })).concat([
            { dimension: "upselling", level: null },
          ]),
        }),
      });
      if (!res.ok) throw new Error("Failed to log observation");
      const data = await res.json();
      setResult(data);
      setUnlocked(true);
      toast.success("Observation logged — practice history unlocked");
    } catch {
      toast.error("Could not log the observation. Please retry.");
      setSubmitting(false);
    }
  };

  if (unlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <LockOpen className="size-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Your observation is in. Now the AI shows its hand.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice history unlocked — the transfer gap is computed from two
            independent streams.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/40 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Recommendation {result?.recommendation_id.slice(0, 8)}… is being
          drafted with citations
        </div>
        <div className="flex gap-1.5">
          <Lock className="size-4 animate-pulse text-emerald-600" />
          <span className="text-xs text-muted-foreground">
            Taking you to the gap…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-3">
        {staff.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setStaffId(member.id)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              staffId === member.id
                ? "border-primary bg-accent/30 ring-2 ring-primary/30"
                : "bg-card hover:bg-muted/40"
            }`}
          >
            <p className="text-sm font-semibold">{member.name}</p>
            <p className="text-xs text-muted-foreground">
              {member.role} · {member.department}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="context">The situation</Label>
          <Input
            id="context"
            placeholder="Guest complaint at front desk, room not ready at 3pm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="what">What happened</Label>
          <Textarea
            id="what"
            placeholder="Froze and escalated to me immediately…"
            className="min-h-[68px]"
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {RATED_DIMENSIONS.map(({ dimension, prompt }) => (
          <div
            key={dimension}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {observationDimensionLabels[dimension]}
              </p>
              <p className="text-xs text-muted-foreground">{prompt}</p>
            </div>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setRatings((r) => ({ ...r, [dimension]: level }))
                  }
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-bold transition-colors ${
                    ratings[dimension] === level
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          size="lg"
          className="w-full sm:w-auto sm:min-w-64"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Logging…" : "Log observation"}
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" />
          Practice scores stay hidden until your observation is in — your
          judgement first, the AI's read second.
        </p>
      </div>
    </div>
  );
}
