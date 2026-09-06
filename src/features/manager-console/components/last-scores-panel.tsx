"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { ContractError } from "@/lib/api/client";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { dimensionShort } from "@/lib/format";
import type { ScoresResponse, StaffScoreRow } from "@/lib/types";

/**
 * HLD §6.1/§10: the last-three-scores panel. Reads the staff member's two
 * evidence streams (practice and floor) in parallel. Practice history is
 * gated by the frozen contract: until the manager has logged their own floor
 * observation of this person, `source=practice` answers 409 — the panel then
 * shows the unlock hint instead of the numbers.
 */

type StreamState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "locked" }
  | { kind: "ready"; rows: StaffScoreRow[] };

function resolveStream(
  result: PromiseSettledResult<ScoresResponse>
): StreamState {
  if (result.status === "fulfilled") {
    const rows = [...result.value.scores].sort((a, b) =>
      b.recorded_at.localeCompare(a.recorded_at)
    );
    return { kind: "ready", rows };
  }
  if (
    result.reason instanceof ContractError &&
    result.reason.problem.status === 409
  ) {
    return { kind: "locked" };
  }
  return { kind: "error" };
}

const RECENT_LIMIT = 3;

const AMBER_TEXT = "text-[oklch(0.84_0.11_85)]";
const ROSE_TEXT = "text-[oklch(0.78_0.11_35)]";
const AMBER_PILL =
  "bg-[oklch(0.79_0.12_80)]/15 text-[oklch(0.84_0.11_85)] border-[oklch(0.79_0.12_80)]/30";
const ROSE_PILL =
  "bg-[oklch(0.69_0.13_35)]/15 text-[oklch(0.78_0.11_35)] border-[oklch(0.69_0.13_35)]/30";

export function LastScoresPanel({ staffId }: { staffId: string }) {
  const [practice, setPractice] = useState<StreamState>({ kind: "loading" });
  const [floor, setFloor] = useState<StreamState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setPractice({ kind: "loading" });
    setFloor({ kind: "loading" });
    Promise.allSettled([
      managerApi.getScores(staffId, "practice"),
      managerApi.getScores(staffId, "floor"),
    ]).then(([practiceResult, floorResult]) => {
      if (cancelled) return;
      setPractice(resolveStream(practiceResult));
      setFloor(resolveStream(floorResult));
    });
    return () => {
      cancelled = true;
    };
  }, [staffId]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StreamCard
        title="Practice history"
        dotClass={AMBER_TEXT}
        pillClass={AMBER_PILL}
        state={practice}
        empty="No practice scores yet — the first completed scenario appears here."
      />
      <StreamCard
        title="Floor history"
        dotClass={ROSE_TEXT}
        pillClass={ROSE_PILL}
        state={floor}
        empty="No floor scores yet — they fill in once an observation is logged."
      />
    </div>
  );
}

function StreamCard({
  title,
  dotClass,
  pillClass,
  state,
  empty,
}: {
  title: string;
  dotClass: string;
  pillClass: string;
  state: StreamState;
  empty: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`size-2 rounded-full bg-current ${dotClass}`}
        />
        <p className="text-sm font-semibold">{title}</p>
        {state.kind === "ready" && state.rows.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {state.rows.length > RECENT_LIMIT
              ? `last ${RECENT_LIMIT} of ${state.rows.length}`
              : `last ${state.rows.length}`}{" "}
            · newest first
          </span>
        )}
      </div>

      {state.kind === "loading" && (
        <p className="mt-3 text-xs text-muted-foreground">Reading scores…</p>
      )}

      {state.kind === "error" && (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          Could not read scores right now — refresh to retry.
        </p>
      )}

      {state.kind === "locked" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-amber-400/40 bg-amber-500/10 p-3">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
          <p className="text-xs leading-relaxed text-amber-200/90">
            Log a floor observation first — practice history unlocks after.
          </p>
        </div>
      )}

      {state.kind === "ready" && state.rows.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          {empty}
        </p>
      )}

      {state.kind === "ready" && state.rows.length > 0 && (
        <ul className="mt-3 space-y-2">
          {state.rows.slice(0, RECENT_LIMIT).map((row) => (
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
                    : pillClass
                }`}
              >
                {row.level ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
