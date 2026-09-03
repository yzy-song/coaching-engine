"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, ShieldAlert, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dimensionShort } from "@/lib/format";
import type {
  Recommendation,
  VerifyResponse,
} from "@/lib/types";

type Verdict = "confirmed" | "corrected" | "rejected";

const verdictCopy: Record<Verdict, { label: string; hint: string }> = {
  confirmed: {
    label: "Confirm",
    hint: "The read matches what I saw.",
  },
  corrected: {
    label: "Correct",
    hint: "Close, but the level or the reason needs adjusting.",
  },
  rejected: {
    label: "Reject",
    hint: "This read does not match the floor.",
  },
};

export function VerifyPanel({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const [seconds, setSeconds] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [managerLevel, setManagerLevel] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<VerifyResponse | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(
      () => setSeconds((s) => s + 1),
      1000
    );
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    if (!verdict) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/recommendations/${recommendation.id}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verdict,
            dimension_verdicts: [
              {
                dimension: recommendation.calibration.dimension,
                manager_level: managerLevel ?? 2,
              },
            ],
            reason,
            seconds_to_decide: seconds,
          }),
        }
      );
      if (!res.ok) throw new Error("Verify failed");
      const data = (await res.json()) as VerifyResponse;
      setResponse(data);
      toast.success(
        data.escalation
          ? "Confirmed — routed to operations"
          : `Marked ${verdict}. Calibration updated.`
      );
    } catch {
      toast.error("Could not record your verdict. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (response) {
    return <VerifyResultPanel verdict={response.status} data={response} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Timer className="size-4" />
          Decision time
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums">
          {seconds}s
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Your verdict"
        className="grid gap-2 sm:grid-cols-3"
      >
        {(Object.keys(verdictCopy) as Verdict[]).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={verdict === v}
            onClick={() => setVerdict(v)}
            className={`rounded-xl border p-3 text-left transition-all ${
              verdict === v
                ? v === "confirmed"
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                  : v === "corrected"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                    : "border-rose-500 bg-rose-50 ring-2 ring-rose-200"
                : "bg-card hover:bg-muted/40"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              {v === "confirmed" && <Check className="size-4 text-emerald-600" />}
              {v === "corrected" && <RotateCcw className="size-4 text-amber-600" />}
              {v === "rejected" && <X className="size-4 text-rose-600" />}
              {verdictCopy[v].label}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              {verdictCopy[v].hint}
            </p>
          </button>
        ))}
      </div>

      {verdict === "corrected" && (
        <div className="rounded-xl border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your level for {dimensionShort[recommendation.calibration.dimension]} on the floor
          </p>
          <div
            role="radiogroup"
            aria-label="Floor level"
            className="mt-2 flex gap-2"
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={managerLevel === level}
                onClick={() => setManagerLevel(level)}
                className={`size-10 rounded-lg border text-sm font-bold transition-colors ${
                  managerLevel === level
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          {managerLevel === null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Pick the level you actually saw before submitting.
            </p>
          )}
        </div>
      )}

      <Textarea
        placeholder={
          verdict === "rejected"
            ? "What did you actually see? This becomes a labelled example for calibration."
            : "Optional — one line on why (this trains the calibration)."
        }
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="min-h-20"
      />

      <Button
        onClick={handleSubmit}
        disabled={
          !verdict ||
          (verdict === "corrected" && managerLevel === null) ||
          submitting
        }
        size="lg"
        className="w-full"
      >
        {submitting ? "Recording…" : "Submit verdict"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No coaching action is taken on AI output alone — your verdict is
        required before anything routes anywhere.
      </p>
    </div>
  );
}

function VerifyResultPanel({
  verdict,
  data,
}: {
  verdict: Verdict;
  data: VerifyResponse;
}) {
  return (
    <div className="space-y-4" aria-live="polite">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          verdict === "confirmed"
            ? "border-emerald-300 bg-emerald-50"
            : verdict === "corrected"
              ? "border-amber-300 bg-amber-50"
              : "border-rose-300 bg-rose-50"
        }`}
      >
        {verdict === "confirmed" && (
          <Check className="size-6 text-emerald-600" />
        )}
        {verdict === "corrected" && (
          <RotateCcw className="size-6 text-amber-600" />
        )}
        {verdict === "rejected" && <X className="size-6 text-rose-600" />}
        <div>
          <p className="font-semibold">
            {verdict === "confirmed"
              ? "Verified — this read matches the floor."
              : verdict === "corrected"
                ? "Corrected — the AI's read has been adjusted."
                : "Rejected — recorded as a labelled example."}
          </p>
          <p className="text-xs text-muted-foreground">
            Stored with your reason. The calibration set now includes this
            decision.
          </p>
        </div>
      </div>

      <CalibrationShift data={data} />

      {data.escalation && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-rose-600" />
            <p className="text-sm font-semibold text-rose-800">
              Escalated — {data.escalation.route.toUpperCase()} · rule{" "}
              {data.escalation.rule_id}
            </p>
            <Badge variant="outline" className="ml-auto border-rose-300 text-rose-700">
              severity {data.escalation.severity}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-rose-900/80">
            {data.escalation.summary}
          </p>
        </div>
      )}
    </div>
  );
}

function CalibrationShift({ data }: { data: VerifyResponse }) {
  const [display, setDisplay] = useState(data.calibration_updated.agreement_rate_before);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const from = data.calibration_updated.agreement_rate_before;
    const to = data.calibration_updated.agreement_rate_after;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [data]);

  const pct = Math.round(
    ((display - data.calibration_updated.agreement_rate_before) /
      (data.calibration_updated.agreement_rate_after -
        data.calibration_updated.agreement_rate_before)) *
      100
  );

  return (
    <div className="rounded-xl border bg-card p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Manager agreement on{" "}
        {dimensionShort[data.calibration_updated.dimension]} — live
      </p>
      <p
        aria-live="off"
        className="mt-2 font-mono text-4xl font-bold tabular-nums text-primary"
      >
        {display.toFixed(3)}
      </p>
      <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {data.calibration_updated.agreement_rate_before.toFixed(3)} →{" "}
        {data.calibration_updated.agreement_rate_after.toFixed(3)} · sample
        grew to n = {data.calibration_updated.sample_size}
      </p>
    </div>
  );
}
