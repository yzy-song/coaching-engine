"use client";

import { useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dimensionShort,
  formatGap,
  observationDimensionLabels,
  quadrantMeta,
} from "@/lib/format";
import type { TransferGap } from "@/lib/types";

const quadrantOrder = [
  { key: "recalibrate", x: "left", y: "top" },
  { key: "competent", x: "right", y: "top" },
  { key: "skill_gap", x: "left", y: "bottom" },
  { key: "blocked", x: "right", y: "bottom" },
] as const;

const toneClasses: Record<string, { chip: string; ring: string; text: string }> = {
  emerald: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-500",
    text: "text-emerald-700",
  },
  amber: {
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    ring: "ring-amber-500",
    text: "text-amber-700",
  },
  rose: {
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    ring: "ring-rose-500",
    text: "text-rose-700",
  },
  violet: {
    chip: "bg-violet-100 text-violet-800 border-violet-200",
    ring: "ring-violet-500",
    text: "text-violet-700",
  },
};

export function GapQuadrant({
  gap,
  staffName,
}: {
  gap: TransferGap;
  staffName: string;
}) {
  const [selected, setSelected] = useState(gap.dimensions[0]?.dimension);
  const active = gap.dimensions.find((d) => d.dimension === selected) ?? gap.dimensions[0];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Practice vs floor — where {staffName.split(" ")[0]} sits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto aspect-square max-w-sm">
            {/* axes */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              FLOOR
            </span>
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 rotate-90 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              PRACTICE
            </span>

            {quadrantOrder.map(({ key, x, y }) => {
              const meta = quadrantMeta[key];
              const tone = toneClasses[meta.tone];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setSelected(
                      gap.dimensions.find((d) => d.quadrant === key)?.dimension ??
                        selected
                    )
                  }
                  className={`absolute flex size-[calc(50%-14px)] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-all ${
                    x === "left" ? "left-2" : "right-2"
                  } ${y === "top" ? "top-2" : "bottom-2"} ${
                    active?.quadrant === key
                      ? `${tone.chip} ring-2 ${tone.ring}`
                      : "border-dashed bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-wide">
                    {meta.label}
                  </span>
                  <span className="hidden text-[10px] leading-tight sm:block">
                    {meta.headline}
                  </span>
                </button>
              );
            })}

            {active && (
              <span
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background text-sm font-bold shadow-lg ring-2 ${
                  toneClasses[quadrantMeta[active.quadrant].tone].ring
                } ${
                  active.quadrant === "blocked" || active.quadrant === "competent"
                    ? "left-[75%]"
                    : "left-[25%]"
                } ${
                  active.quadrant === "competent" || active.quadrant === "recalibrate"
                    ? "top-[25%]"
                    : "top-[75%]"
                }`}
              >
                {active.practice_mean.toFixed(1)}
              </span>
            )}
          </div>

          {active && (
            <div className="mt-4 rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {dimensionShort[active.dimension]} —{" "}
                  <span className={toneClasses[quadrantMeta[active.quadrant].tone].text}>
                    {quadrantMeta[active.quadrant].label}
                  </span>
                </p>
                <Badge variant="outline" className="shrink-0">
                  gap {formatGap(active.gap)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.reading}
              </p>
              <div className="mt-3 flex items-end gap-6 text-xs">
                <div>
                  <p className="text-muted-foreground">Practice</p>
                  <p className="text-lg font-bold">{active.practice_mean.toFixed(1)}</p>
                  <p className="text-muted-foreground">n = {active.practice_n}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Floor</p>
                  <p className="text-lg font-bold">{active.floor_mean.toFixed(1)}</p>
                  <p className="text-muted-foreground">n = {active.floor_n}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  {active.trend.map((t) => t.gap).join(" → ")}
                  <ArrowUpRight className="size-3.5 text-rose-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        {gap.dimensions.map((d) => (
          <button
            key={d.dimension}
            type="button"
            onClick={() => setSelected(d.dimension)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              selected === d.dimension
                ? "border-primary bg-accent/30"
                : "bg-card hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{dimensionShort[d.dimension]}</p>
              <Badge
                variant="outline"
                className={toneClasses[quadrantMeta[d.quadrant].tone].chip}
              >
                {quadrantMeta[d.quadrant].label}
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              <Bar label="Practice" value={d.practice_mean} />
              <Bar label="Floor" value={d.floor_mean} muted />
              <div className="flex justify-between pt-1 text-xs text-muted-foreground">
                <span>Transfer gap</span>
                <span className="font-bold text-foreground">
                  {formatGap(d.gap)}
                </span>
              </div>
            </div>
          </button>
        ))}
        {gap.insufficient_evidence.length > 0 && (
          <p className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
            No floor observations yet for{" "}
            {gap.insufficient_evidence.map((d) => observationDimensionLabels[d]).join(", ")} —
            the gap is left unscored rather than guessed.
          </p>
        )}
      </div>
    </div>
  );
}

function Bar({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${muted ? "bg-muted-foreground/50" : "bg-primary"}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
