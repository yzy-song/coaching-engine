"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  ShieldAlert,
  StickyNote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BarsLevelPicker } from "@/features/manager-console/components/bars-level-picker";
import { dimensionShort } from "@/lib/format";
import type {
  BarsDimension,
  CalibrationState,
  EscalationRoute,
  Recommendation,
  VerifyResponse,
} from "@/lib/types";

type Verdict = "confirmed" | "corrected" | "rejected";

/** Contract route names on screen — ld_hr reads as "LD/HR", never "LD_HR". */
const routeLabel: Record<EscalationRoute, string> = {
  manager: "Duty manager",
  ld_hr: "LD/HR",
  operations: "Operations / GM",
};

/** One plain sentence per calibration state — the fallback when the response
 * carries no advice of its own. */
const stateSentence: Record<CalibrationState, string> = {
  unmeasured: "Not measured yet on this dimension.",
  provisional: "Early days — only a handful of checks so far.",
  reliable: "Agreement is reliably high on this dimension.",
  uncertain: "Still settling — keep verifying on this dimension.",
  unreliable: "Treat this read with caution for now.",
};

/**
 * calibration_updated is the contract's Calibration row plus before/after.
 * Typed locally so this panel tracks the frozen contract while types.ts (owned
 * elsewhere) still mirrors the previous snapshot.
 */
interface CalibrationShiftData {
  dimension: BarsDimension;
  agreement_rate_before: number;
  agreement_rate_after: number;
  sample_size: number;
  lower?: number | null;
  upper?: number | null;
  state?: CalibrationState;
  advice?: string;
}

/** One plain word per verdict — the three choices, no sub-copy. */
const verdictLabel: Record<Verdict, string> = {
  confirmed: "Confirm",
  corrected: "Correct",
  rejected: "Reject",
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
  const [noteOpen, setNoteOpen] = useState(false);
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

  useEffect(() => {
    if (response && timerRef.current) window.clearInterval(timerRef.current);
  }, [response]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!verdict) {
      toast.warning("Pick a verdict first — Confirm, Correct or Reject.");
      return;
    }
    if (verdict === "corrected" && managerLevel === null) {
      toast.warning("Pick the description that matches what you saw before submitting.");
      return;
    }
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
          ? `Confirmed — routed to ${routeLabel[data.escalation.route].toLowerCase()}`
          : `Marked ${verdict}. Calibration updated.`
      );
    } catch {
      toast.error("Could not record your verdict. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (response) {
    return <VerifyResultPanel verdict={response.status} data={response} seconds={seconds} />;
  }

  return (
    <div className="space-y-4">
      <div
        role="radiogroup"
        aria-label="Your verdict"
        className="grid gap-2 sm:grid-cols-3"
      >
        {(Object.keys(verdictLabel) as Verdict[]).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={verdict === v}
            onClick={() => setVerdict(v)}
            className={`rounded-xl border p-4 text-left transition-all ${
              verdict === v
                ? v === "confirmed"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : v === "corrected"
                    ? "border-[oklch(0.75_0.07_74)] bg-[oklch(0.75_0.07_74)]/12 ring-2 ring-[oklch(0.75_0.07_74)]/25"
                    : "border-[oklch(0.66_0.09_30)] bg-[oklch(0.66_0.09_30)]/12 ring-2 ring-[oklch(0.66_0.09_30)]/25"
                : "bg-card hover:bg-muted/40"
            }`}
          >
            <span className="flex items-center gap-2 text-lg font-semibold">
              {v === "confirmed" && <Check className="size-5 text-primary" />}
              {v === "corrected" && <RotateCcw className="size-5 text-[oklch(0.45_0.07_72)]" />}
              {v === "rejected" && <X className="size-5 text-[oklch(0.45_0.08_30)]" />}
              {verdictLabel[v]}
            </span>
          </button>
        ))}
      </div>

      {verdict === "corrected" && (
        <div className="rounded-xl border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your level for {dimensionShort[recommendation.calibration.dimension]} on the floor
          </p>
          <div className="mt-2">
            <BarsLevelPicker
              dimension={recommendation.calibration.dimension}
              value={managerLevel}
              onChange={setManagerLevel}
              label="Floor level"
            />
          </div>
          {managerLevel === null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Pick the description that matches what you saw before submitting.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        aria-expanded={noteOpen}
        aria-controls="verdict-note"
        onClick={() => setNoteOpen((o) => !o)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <StickyNote className="size-4" />
        Add a note (optional)
        <ChevronDown
          className={`size-4 transition-transform ${noteOpen ? "rotate-180" : ""}`}
        />
      </button>
      {noteOpen && (
        <Textarea
          id="verdict-note"
          placeholder={
            verdict === "rejected"
              ? "What did you actually see? This becomes a labelled example for calibration."
              : "Optional — one line on why. It feeds the calibration."
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-20"
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? "Recording…" : "Submit verdict"}
      </Button>
    </div>
  );
}

function VerifyResultPanel({
  verdict,
  data,
  seconds,
}: {
  verdict: Verdict;
  data: VerifyResponse;
  seconds: number;
}) {
  return (
    <div className="space-y-4" aria-live="polite">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          verdict === "confirmed"
            ? "border-primary/40 bg-primary/10"
            : verdict === "corrected"
              ? "border-[oklch(0.75_0.07_74)]/40 bg-[oklch(0.75_0.07_74)]/12"
              : "border-[oklch(0.66_0.09_30)]/40 bg-[oklch(0.66_0.09_30)]/12"
        }`}
      >
        {verdict === "confirmed" && (
          <Check className="size-6 text-primary" />
        )}
        {verdict === "corrected" && (
          <RotateCcw className="size-6 text-[oklch(0.45_0.07_72)]" />
        )}
        {verdict === "rejected" && <X className="size-6 text-[oklch(0.45_0.08_30)]" />}
        <div>
          <p className="font-semibold">
            {verdict === "confirmed"
              ? "Verified — this read matches the floor."
              : verdict === "corrected"
                ? "Corrected — the AI's read has been adjusted."
                : "Rejected — recorded as a labelled example."}
          </p>
          <p className="text-xs text-muted-foreground">
            Stored with your reason. This decision now counts toward the
            calibration. Decided in {seconds}s.
          </p>
        </div>
      </div>

      <CalibrationShift data={data} />

      {data.escalation && (
        <div className="rounded-xl border border-[oklch(0.66_0.09_30)]/30 bg-[oklch(0.66_0.09_30)]/10 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-[oklch(0.45_0.08_30)]" />
            <p className="text-sm font-semibold text-[oklch(0.45_0.08_30)]">
              Escalated — {routeLabel[data.escalation.route]} · rule{" "}
              {data.escalation.rule_id}
            </p>
            <Badge variant="outline" className="ml-auto border-[oklch(0.66_0.09_30)]/30 text-[oklch(0.45_0.08_30)]">
              severity {data.escalation.severity}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[oklch(0.45_0.08_30)]/80">
            {data.escalation.summary}
          </p>
        </div>
      )}

      <Link
        href="/manager"
        className="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium text-primary transition-colors hover:bg-muted/40"
      >
        Back to dashboard — see the calibration move
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function CalibrationShift({ data }: { data: VerifyResponse }) {
  const shift: CalibrationShiftData = data.calibration_updated;
  const fromPct = shift.agreement_rate_before * 100;
  const toPct = shift.agreement_rate_after * 100;
  const [displayPct, setDisplayPct] = useState(fromPct);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPct(fromPct + (toPct - fromPct) * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [fromPct, toPct]);

  // Fill of the progress bar tracks travel from before → after; when the rate
  // is unchanged the bar simply sits full.
  const travel =
    fromPct === toPct
      ? 100
      : Math.min(
          Math.max(((displayPct - fromPct) / (toPct - fromPct)) * 100, 0),
          100
        );

  const hasInterval =
    typeof shift.lower === "number" && typeof shift.upper === "number";
  const stateNote =
    shift.advice ??
    (shift.state && shift.state !== "unmeasured"
      ? stateSentence[shift.state]
      : null);

  return (
    <div className="rounded-xl border bg-card p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Manager agreement on {dimensionShort[shift.dimension]} — live
      </p>
      <p
        aria-live="off"
        className="mt-2 text-4xl font-bold tabular-nums text-primary"
      >
        {displayPct.toFixed(1)}%
      </p>
      <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${Math.max(travel, 6)}%` }}
        />
      </div>
      {hasInterval && (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          95% CI {((shift.lower ?? 0) * 100).toFixed(1)}%–
          {((shift.upper ?? 0) * 100).toFixed(1)}%
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {fromPct.toFixed(1)}% → {toPct.toFixed(1)}% · sample grew to n ={" "}
        {shift.sample_size}
      </p>
      {stateNote && (
        <p className="mt-2 text-xs font-medium text-primary">{stateNote}</p>
      )}
    </div>
  );
}
