"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { dimensionShort, observationDimensionLabels } from "@/lib/format";
import type {
  ObservationDimension,
  StaffMember,
  StaffScoreRow,
} from "@/lib/types";

/**
 * The manager's observe surface, redesigned as a quick capture with a record
 * anchor: one card on top to log a staff member's floor moment (staff chip,
 * dimension, BARS level, optional one-line note), and the tapped staff
 * member's existing floor observations beside it — so the manager sees what
 * is already on the record before their judgement lands.
 *
 * Submission keeps the observation route contract: one rated dimension per
 * capture, an Idempotency-Key on the write (double tap on hotel wifi cannot
 * log twice), and the page's own feedback line instead of a redirect — the
 * manager can keep capturing for the rest of the shift.
 */

const CAPTURE_DIMENSIONS: ObservationDimension[] = [
  "service_recovery",
  "empathy",
  "communication",
  "composure",
  "anticipation",
];

const LEVELS = [1, 2, 3, 4, 5] as const;

const FLOOR_DOT = "text-[oklch(0.78_0.11_35)]";
const FLOOR_PILL =
  "bg-[oklch(0.69_0.13_35)]/15 text-[oklch(0.78_0.11_35)] border-[oklch(0.69_0.13_35)]/30";

type RecordState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; rows: StaffScoreRow[] };

const CHIP_SELECTED =
  "border-primary bg-primary text-primary-foreground";
const CHIP_IDLE = "border bg-card text-foreground hover:bg-muted/40";

export function ObservationForm({ staff }: { staff: StaffMember[] }) {
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [dimension, setDimension] = useState<ObservationDimension | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loggedName, setLoggedName] = useState<string | null>(null);
  const [anchorVersion, setAnchorVersion] = useState(0);
  const [record, setRecord] = useState<RecordState>({ kind: "loading" });

  const member = staff.find((s) => s.id === staffId) ?? staff[0];
  const selectedName = member?.name ?? "";

  // The record anchors follow the tapped chip and refresh after each submit.
  useEffect(() => {
    let cancelled = false;
    setRecord({ kind: "loading" });
    managerApi
      .getScores(staffId, "floor")
      .then((res) => {
        if (cancelled) return;
        const rows = [...res.scores].sort((a, b) =>
          b.recorded_at.localeCompare(a.recorded_at)
        );
        setRecord({ kind: "ready", rows });
      })
      .catch(() => {
        if (!cancelled) setRecord({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [staffId, anchorVersion]);

  const beginCapture = () => {
    if (loggedName !== null) setLoggedName(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!dimension || level === null) {
      toast.warning(
        "Choose the dimension, then tap the level you saw — the note is optional."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          staff_id: staffId,
          observed_at: new Date().toISOString(),
          context: "Quick floor capture",
          what_happened: note.trim(),
          ratings: [{ dimension, level }],
        }),
      });
      if (!res.ok) throw new Error("Failed to log observation");
      await res.json();
      setLoggedName(selectedName);
      setDimension(null);
      setLevel(null);
      setNote("");
      setAnchorVersion((v) => v + 1);
    } catch {
      toast.error("Could not log the observation. Please retry.");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log a floor observation
            </h1>
            <p className="text-sm text-muted-foreground">
              Twenty seconds after the moment, while it&apos;s still yours.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Timer className="size-3.5" />
            ~20s
          </div>
        </div>

        <div className="mt-5 space-y-5 border-t pt-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Who did you observe?
            </p>
            <div className="flex flex-wrap gap-2">
              {staff.map((s) => {
                const selected = s.id === staffId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setStaffId(s.id);
                      beginCapture();
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-left transition-colors ${
                      selected ? CHIP_SELECTED : CHIP_IDLE
                    }`}
                  >
                    <span className="block text-sm font-semibold leading-tight">
                      {s.name}
                    </span>
                    <span
                      className={`block text-[10px] leading-tight ${
                        selected
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.role} · {s.department}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Which dimension?
            </p>
            <div className="flex flex-wrap gap-2">
              {CAPTURE_DIMENSIONS.map((d) => {
                const selected = dimension === d;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setDimension(d);
                      beginCapture();
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected ? CHIP_SELECTED : CHIP_IDLE
                    }`}
                  >
                    {observationDimensionLabels[d]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Level — how well they handled it
              </p>
              <p className="text-[10px] text-muted-foreground/70">BARS 1–5</p>
            </div>
            <div
              role="radiogroup"
              aria-label="Level"
              className="grid grid-cols-5 gap-2"
            >
              {LEVELS.map((value) => {
                const selected = level === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setLevel(value);
                      beginCapture();
                    }}
                    className={`rounded-lg border py-2.5 text-sm font-bold transition-colors ${
                      selected ? CHIP_SELECTED : CHIP_IDLE
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Note (optional)
            </p>
            <Input
              placeholder="One line on what you saw"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                beginCapture();
              }}
            />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex justify-center">
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto sm:min-w-64"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Logging…" : "Log observation"}
              </Button>
            </div>
            {loggedName !== null ? (
              <div
                role="status"
                className="flex items-start justify-center gap-2 rounded-xl border border-primary/25 bg-accent/40 px-4 py-3 text-center"
              >
                <LockOpen className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-primary">
                  Logging unlocks {loggedName}&apos;s practice history — your
                  judgement lands first, the AI&apos;s read second.
                </p>
              </div>
            ) : (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <Lock className="size-3 shrink-0" />
                Practice scores stay hidden until your observation is in — your
                judgement first, the AI&apos;s read second.
              </p>
            )}
          </div>
        </div>
      </div>

      <RecordAnchors name={selectedName} record={record} />
    </div>
  );
}

/** The tapped staff member's existing floor observations — date, dimension,
 * level — so a manager sees what is already logged before judging again. */
function RecordAnchors({
  name,
  record,
}: {
  name: string;
  record: RecordState;
}) {
  return (
    <aside className="rounded-2xl border bg-card p-4 sm:p-5 lg:sticky lg:top-6">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`size-2 rounded-full bg-current ${FLOOR_DOT}`}
        />
        <p className="text-sm font-semibold">{name}&apos;s floor record</p>
        {record.kind === "ready" && record.rows.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {record.rows.length} logged · newest first
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Every rated moment already on the record.
      </p>

      {record.kind === "loading" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Reading {name}&apos;s record…
        </p>
      )}

      {record.kind === "error" && (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          Could not read the record right now — refresh to retry.
        </p>
      )}

      {record.kind === "ready" && record.rows.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          Nothing on the record for {name} yet — your first capture lands
          here.
        </p>
      )}

      {record.kind === "ready" && record.rows.length > 0 && (
        <ul className="mt-3 space-y-2">
          {record.rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {dimensionShort[row.dimension]}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {row.recorded_at.slice(0, 10)}
                </p>
              </div>
              <span
                className={`rounded-md border px-2 py-0.5 text-sm font-bold tabular-nums ${
                  row.level === null
                    ? "border-transparent bg-muted text-muted-foreground"
                    : FLOOR_PILL
                }`}
              >
                {row.level ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
