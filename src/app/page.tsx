import Link from "next/link";
import { ArrowRight, BrainCircuit, MonitorSmartphone, Smartphone, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-2.5 px-4 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_18px_-6px_var(--primary)]">
            C
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">The Coaching Engine</p>
            <p className="text-[11px] text-muted-foreground">
              Frontline coaching that closes the gap between training and the
              floor
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            TechIreland AI Challenge 2026
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-12">
        <div className="mx-auto max-w-xl text-center">
          <Badge className="bg-accent text-accent-foreground">
            <Sparkles className="size-3" />
            Demo build — seeded with the Diego story
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Training shows completion.{" "}
            <span className="text-primary">
              This shows what changed on the floor.
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Staff practise AI-scored scenarios. Managers log 20-second floor
            observations. The agent combines both streams into a cited,
            checkable coaching recommendation — and holds it until a human
            verifies it. Nothing routes on AI output alone. Practice-only
            training is where Cornell's AI hospitality research stops — we
            close the loop on the floor.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/manager" className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-[0_16px_44px_-18px_var(--primary)]">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <MonitorSmartphone className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Manager Console</CardTitle>
                <CardDescription>
                  Log observations, read the transfer gap, verify the agent's
                  citations, watch the calibration number move.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open as Marta, Duty Manager
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff" className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-[0_16px_44px_-18px_var(--primary)]">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Smartphone className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Staff PWA</CardTitle>
                <CardDescription>
                  Debrief your shift, get your hotel's own standard back
                  instantly, practise a 3-minute replay, see exactly what
                  earned each score.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open as Diego, Front Desk
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BrainCircuit className="size-3.5" />
            Observe → Act → Remember → Verify → Escalate
          </span>
          <span>BARS-scored practice</span>
          <span>Cited recommendations</span>
          <span>Human-in-the-loop verification</span>
          <span>k-anonymised team insights</span>
        </div>
      </main>
    </div>
  );
}
