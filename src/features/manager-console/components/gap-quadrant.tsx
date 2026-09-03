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

const W = 340;
const H = 340;
const PAD = 36;
const PLOT = W - PAD * 2;
const MID = W / 2;
const px = (v: number) => PAD + (Math.min(Math.max(v, 0), 5) / 5) * PLOT;
const py = (v: number) => H - PAD - (Math.min(Math.max(v, 0), 5) / 5) * PLOT;

const dimCode: Record<string, string> = {
  service_recovery: "SR",
  empathy: "EMP",
  anticipation: "ANT",
  communication: "COM",
  composure: "CMP",
  confidence: "CONF",
  upselling: "UP",
};

const toneColor: Record<string, string> = {
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  violet: "#a78bfa",
};

const toneClasses: Record<string, { chip: string; ring: string; text: string }> = {
  emerald: {
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    ring: "ring-emerald-400",
    text: "text-emerald-300",
  },
  amber: {
    chip: "bg-amber-500/15 text-amber-200 border-amber-400/30",
    ring: "ring-amber-400",
    text: "text-amber-300",
  },
  rose: {
    chip: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    ring: "ring-rose-400",
    text: "text-rose-300",
  },
  violet: {
    chip: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    ring: "ring-violet-400",
    text: "text-violet-300",
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
            {quadrantOrder.map(({ key, x, y }) => {
              const meta = quadrantMeta[key];
              const tone = toneClasses[meta.tone];
              const isActive = active?.quadrant === key;
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
                  className={`absolute z-0 flex size-[calc(50%-10px)] flex-col rounded-xl border p-2.5 transition-all ${
                    x === "left"
                      ? "left-2 items-start text-left"
                      : "right-2 items-end text-right"
                  } ${y === "top" ? "top-2 justify-start" : "bottom-2 justify-end"} ${
                    isActive
                      ? `${tone.chip} ring-1 ${tone.ring}`
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-wide">
                    {meta.label}
                  </span>
                  <span className="hidden text-[10px] leading-tight opacity-70 sm:block">
                    {meta.headline}
                  </span>
                </button>
              );
            })}

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <line
                    x1={PAD}
                    y1={py(i)}
                    x2={W - PAD}
                    y2={py(i)}
                    stroke="oklch(1 0 0 / 5%)"
                  />
                  <line
                    x1={px(i)}
                    y1={PAD}
                    x2={px(i)}
                    y2={H - PAD}
                    stroke="oklch(1 0 0 / 5%)"
                  />
                </g>
              ))}
              <line
                x1={PAD}
                y1={py(2.5)}
                x2={W - PAD}
                y2={py(2.5)}
                stroke="oklch(1 0 0 / 10%)"
                strokeDasharray="4 4"
              />
              <line
                x1={px(2.5)}
                y1={PAD}
                x2={px(2.5)}
                y2={H - PAD}
                stroke="oklch(1 0 0 / 10%)"
                strokeDasharray="4 4"
              />

              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <text
                    x={px(i)}
                    y={H - PAD + 15}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--muted-foreground)"
                    opacity={0.7}
                  >
                    {i}
                  </text>
                  <text
                    x={PAD - 8}
                    y={py(i) + 3}
                    textAnchor="end"
                    fontSize={9}
                    fill="var(--muted-foreground)"
                    opacity={0.7}
                  >
                    {i}
                  </text>
                </g>
              ))}

              <polygon
                points={`${MID},${PAD - 7} ${MID - 4},${PAD} ${MID + 4},${PAD}`}
                fill="var(--muted-foreground)"
                opacity={0.7}
              />
              <polygon
                points={`${W - PAD + 7},${MID} ${W - PAD},${MID - 4} ${W - PAD},${MID + 4}`}
                fill="var(--muted-foreground)"
                opacity={0.7}
              />
              <text
                x={MID}
                y={H - 6}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="var(--muted-foreground)"
              >
                PRACTICE →
              </text>
              <text
                x={10}
                y={MID}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="var(--muted-foreground)"
                transform={`rotate(-90 10 ${MID})`}
              >
                FLOOR ↑
              </text>

              {gap.dimensions.map((d) => {
                const color = toneColor[quadrantMeta[d.quadrant].tone];
                const isSelected = selected === d.dimension;
                const cx = px(d.practice_mean);
                const cy = py(d.floor_mean);
                const anchor = cx > MID ? "end" : "start";
                const lx = cx + (cx > MID ? -11 : 11);
                const ly = cy + (cy < MID ? -11 : 15);
                return (
                  <g key={d.dimension}>
                    {isSelected && (
                      <circle cx={cx} cy={cy} r={13} fill={color} opacity={0.18} />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={12}
                      fill="transparent"
                      className="cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onClick={() => setSelected(d.dimension)}
                    >
                      <title>
                        {`${dimensionShort[d.dimension]} — practice ${d.practice_mean.toFixed(1)}, floor ${d.floor_mean.toFixed(1)}`}
                      </title>
                    </circle>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6.5 : 5}
                      fill={color}
                      stroke="var(--background)"
                      strokeWidth={2}
                      opacity={isSelected ? 1 : 0.75}
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={anchor}
                      fontSize={10}
                      fontWeight={600}
                      fill={color}
                      className="tabular-nums"
                    >
                      {dimCode[d.dimension] ?? dimensionShort[d.dimension]} ·{" "}
                      {d.practice_mean.toFixed(1)}/{d.floor_mean.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Each point is one scored dimension — practice / floor. Tap a point
            or a quadrant to inspect it.
          </p>

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
                  <ArrowUpRight className="size-3.5 text-rose-400" />
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
