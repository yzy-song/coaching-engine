import { levelWord } from "@/lib/format";

/** Staff-facing level chip: renders the qualitative word, never the numeric
 * level — numbers are manager-side vocabulary. Tier tones reuse the palette
 * the numeric chips used, so an unscored dimension stays muted and scored
 * levels keep their green/amber/rose weight without a digit in sight. */
export function LevelWord({
  level,
  prefix,
}: {
  level: number | null;
  prefix?: string;
}) {
  const word = levelWord(level) ?? "—";
  const tone =
    level === null
      ? "bg-muted text-muted-foreground"
      : level >= 4
        ? "bg-[oklch(0.68_0.06_150)]/15 text-[oklch(0.8_0.07_150)]"
        : level === 3
          ? "bg-[oklch(0.7_0.08_70)]/15 text-[oklch(0.89_0.05_76)]"
          : "bg-[oklch(0.62_0.09_30)]/15 text-[oklch(0.8_0.08_30)]";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}
    >
      {prefix ? `${prefix} · ${word}` : word}
    </span>
  );
}
