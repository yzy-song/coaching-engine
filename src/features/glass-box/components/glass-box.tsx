"use client";

import { useState } from "react";
import { Check, Play, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/lib/api/client";
import type { GateReport, RlsReport, StepActor, TraceRun } from "../types";

/* Who made each decision. The colour is the argument: if the timeline is
 * mostly one colour, the panel makes the case on its own. */
const ACTOR_STYLE: Record<StepActor, { label: string; className: string }> = {
  code: {
    label: "code",
    className: "bg-emerald-500/12 text-emerald-700",
  },
  model: {
    label: "model",
    className: "bg-violet-500/12 text-violet-700",
  },
  database: {
    label: "database",
    className: "bg-sky-500/12 text-sky-700",
  },
};

const STAFF = [
  { id: "staff-001", name: "Diego", hint: "blocked, knows it, cannot do it" },
  { id: "staff-002", name: "Niamh", hint: "a genuine skill gap" },
  { id: "staff-013", name: "Bogdan", hint: "scores higher on the floor" },
  { id: "staff-008", name: "Priya", hint: "usually abstains" },
];

function Pill({ actor }: { actor: StepActor }) {
  const s = ACTOR_STYLE[actor];
  return (
    <span
      className={`inline-flex w-[4.5rem] shrink-0 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}
    >
      {s.label}
    </span>
  );
}

/** Renders the interesting fields of a step without dumping raw JSON at
 * someone standing three metres from a screen. */
function StepDetail({ detail }: { detail: Record<string, unknown> }) {
  const note = typeof detail.note === "string" ? detail.note : null;
  const rows: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(detail)) {
    if (key === "note" || key === "decisive" || value == null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      rows.push([
        key.replace(/_/g, " "),
        value
          .map((v) =>
            typeof v === "object" && v !== null
              ? Object.values(v as Record<string, unknown>).join(" · ")
              : String(v)
          )
          .join(", "),
      ]);
    } else if (typeof value !== "object") {
      rows.push([key.replace(/_/g, " "), String(value)]);
    }
  }

  if (!note && rows.length === 0) return null;
  return (
    <div className="mt-1.5 space-y-1">
      {rows.map(([k, v]) => (
        <p key={k} className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{k}:</span>{" "}
          <span className="break-words">{v}</span>
        </p>
      ))}
      {note ? <p className="text-xs italic text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function GlassBox() {
  const [run, setRun] = useState<TraceRun | null>(null);
  const [gate, setGate] = useState<GateReport | null>(null);
  const [rls, setRls] = useState<RlsReport | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go<T>(key: string, fn: () => Promise<T>, set: (v: T) => void) {
    setBusy(key);
    setError(null);
    try {
      set(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  const codeShare = run
    ? Math.round(
        (run.trace.decisions_by_code /
          Math.max(
            1,
            run.trace.decisions_by_code + run.trace.decisions_by_model
          )) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* ── 1. where the reasoning lives ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            1. &ldquo;It is a wrapper around a language model&rdquo;
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Run the agent on someone and watch every step declare who made it.
            The model drafts and classifies. Code decides what may be said, who
            hears about it, and whether it ships at all.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STAFF.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  go(
                    s.id,
                    () => http.post<TraceRun>(`/demo/trace/${s.id}`, {}),
                    setRun
                  )
                }
              >
                <Play className="size-3.5" />
                {busy === s.id ? "Running…" : s.name}
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {s.hint}
                </span>
              </Button>
            ))}
          </div>

          {run ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                  <span>
                    <strong className="tabular-nums">
                      {run.trace.decisions_by_code}
                    </strong>{" "}
                    decisions by code
                  </span>
                  <span>
                    <strong className="tabular-nums">
                      {run.trace.decisions_by_model}
                    </strong>{" "}
                    by the model
                  </span>
                  <span className="text-muted-foreground">
                    {run.trace.total_ms}ms · {run.trace.total_tokens} tokens ·{" "}
                    {run.trace.calls.length} model calls
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-500/25">
                  <div
                    className="h-full rounded-full bg-emerald-500/70"
                    style={{ width: `${codeShare}%` }}
                  />
                </div>
              </div>

              <ol className="space-y-2">
                {run.trace.steps.map((step) => (
                  <li key={step.seq} className="flex gap-3">
                    <Pill actor={step.actor} />
                    <div className="min-w-0 flex-1 border-l pl-3 pb-1">
                      <p className="text-sm font-medium">{step.label}</p>
                      <StepDetail detail={step.detail} />
                    </div>
                  </li>
                ))}
              </ol>

              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Outcome
                </p>
                <p className="mt-1 text-sm">
                  {run.outcome.headline ?? run.outcome.abstain_reason}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {run.outcome.status}
                  {run.outcome.classification
                    ? ` · ${run.outcome.classification}`
                    : ""}
                  {run.outcome.escalation
                    ? ` · ${run.outcome.escalation.rule_id} → ${run.outcome.escalation.route}`
                    : ""}
                  {` · ${run.outcome.citations} citations`}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ── 2. the cite gate ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            2. &ldquo;It will still make things up&rdquo;
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Five claims go through the gate the live agent uses. One is honest.
            Four are the failure modes that matter, written the way a real model
            failure looks: a confident sentence citing something real and saying
            something it does not say.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() =>
              go("gate", () => http.get<GateReport>("/demo/gate"), setGate)
            }
          >
            <ShieldCheck className="size-3.5" />
            {busy === "gate" ? "Running…" : "Try to get a lie past it"}
          </Button>

          {gate ? (
            <div className="space-y-2">
              {gate.probes.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    {p.passed ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{p.title}</p>
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        &ldquo;{p.claim}&rdquo;, cites {p.cited.join(", ")}
                      </p>
                      {p.failures.map((f) => (
                        <p key={f} className="mt-1 text-xs text-destructive">
                          rejected: {f}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">{gate.note} Source:{" "}
                <code className="text-xs">{gate.source}</code>.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ── 3. row level security ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            3. &ldquo;Staff data will leak between roles&rdquo;
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            One question, asked by three people. The SQL never changes: the
            filtering happens inside Postgres, so a bug in our API cannot return
            a row the policy forbids.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() =>
              go("rls", () => http.get<RlsReport>("/demo/rls"), setRls)
            }
          >
            <ShieldCheck className="size-3.5" />
            {busy === "rls" ? "Running…" : "Ask as three different people"}
          </Button>

          {rls ? (
            <div className="space-y-3">
              <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
                {rls.query}
              </pre>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-1.5 pr-3 font-medium">Asked by</th>
                      <th className="py-1.5 pr-3 text-right font-medium">
                        Practice
                      </th>
                      <th className="py-1.5 pr-3 text-right font-medium">
                        Floor
                      </th>
                      <th className="py-1.5 font-medium">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rls.viewers.map((v) => (
                      <tr key={v.viewer} className="border-b last:border-0">
                        <td className="py-2 pr-3">
                          <span className="font-medium">{v.viewer}</span>
                          <span className="block text-xs text-muted-foreground">
                            {v.who}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {v.practice_rows}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {v.floor_rows}
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {v.expected}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">{rls.note}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
