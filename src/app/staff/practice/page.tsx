import Link from "next/link";
import { Play, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { dimensionShort } from "@/lib/format";

export default async function PracticeListPage() {
  const scenarios = await staffApi.listScenarios();
  const personal = scenarios.filter((s) => s.kind === "personal");
  const starters = scenarios.filter((s) => s.kind === "starter");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Practice</h1>
        <p className="text-xs text-muted-foreground">
          3 minutes each. Scored once at the end — with the exact words that
          earned each score.
        </p>
      </div>

      {personal.map((scenario) => (
        <Link
          key={scenario.id}
          href={`/staff/practice/${scenario.id}`}
          className="block rounded-2xl bg-primary p-4 text-primary-foreground"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Built from your shift
            </p>
            <Badge className="ml-auto bg-white/20 text-primary-foreground">
              {scenario.duration_minutes} min
            </Badge>
          </div>
          <p className="mt-2 text-base font-semibold">{scenario.title}</p>
          <p className="mt-0.5 text-xs opacity-80">{scenario.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
            <Play className="size-3.5" />
            Practise it now while it's fresh
          </div>
        </Link>
      ))}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Starter scenarios
        </p>
        <div className="mt-2 space-y-2">
          {starters.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/staff/practice/${scenario.id}`}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                <Star className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{scenario.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {scenario.dimensions.map((d) => dimensionShort[d]).join(" · ")}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {scenario.duration_minutes} min
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
