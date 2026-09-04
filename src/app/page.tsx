import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  Eye,
  Gauge,
  GraduationCap,
  MessageSquareQuote,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { ScrollProgress } from "@/components/scroll-progress";

const loopSteps = [
  {
    icon: MonitorSmartphone,
    title: "Observe",
    text: "Staff practise AI-scored scenarios; managers log 20-second floor observations. Two streams, never one.",
  },
  {
    icon: BrainCircuit,
    title: "Reason",
    text: "The agent combines both streams into one reading of the transfer gap — where practice and floor diverge.",
  },
  {
    icon: BookOpen,
    title: "Remember",
    text: "Every claim carries its source: the SOP clause, the staff member's own turn, the observation that saw it.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    text: "Nothing routes on AI output alone. A manager confirms, corrects or rejects every draft.",
  },
  {
    icon: Gauge,
    title: "Calibrate",
    text: "Every verdict trains the agreement metric — the number you can watch move, live.",
  },
];

const stats: { value: number | string; suffix?: string; label: string }[] = [
  { value: 2, label: "independent data streams — practice and floor" },
  { value: 0, label: "actions route without a human verdict" },
  { value: 100, suffix: "%", label: "of claims cite a source you can open" },
  { value: "k ≥ 3", label: "anonymity on every team insight" },
];

const narrative = [
  "One shift, one gap, one verdict",
  "Marta logs a 20-second observation",
  "The agent drafts — cited, not guessed",
  "Nothing routes without a human verdict",
  "Calibration moves with every confirm",
  "Staff see every record about them",
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <ScrollProgress />
      <Background />

      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3.5">
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
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex">
              TechIreland AI Challenge 2026
            </Badge>
            <Link
              href="/manager"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
            >
              Open the demo
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ── Hero ── */}
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-20 text-center md:pt-28">
          <div className="hero-enter" style={{ animationDelay: "0ms" }}>
            <Badge className="bg-accent text-accent-foreground">
              <Sparkles className="size-3" />
              Demo build — seeded with the Diego story
            </Badge>
          </div>
          <h1
            className="hero-enter mt-6 text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Training shows completion.
            <br />
            <span className="gradient-x bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
              This shows what changed on the floor.
            </span>
          </h1>
          <p
            className="hero-enter mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
            style={{ animationDelay: "180ms" }}
          >
            Staff practise AI-scored scenarios. Managers log 20-second floor
            observations. The agent combines both streams into a cited,
            checkable coaching recommendation — and holds it until a human
            verifies it.
          </p>
          <div
            className="hero-enter mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "270ms" }}
          >
            <Link
              href="/manager"
              className="glow-pulse inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <MonitorSmartphone className="size-4" />
              Open as Marta, Duty Manager
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/staff"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-muted/40 sm:w-auto"
            >
              <Smartphone className="size-4" />
              Open as Diego, Front Desk
            </Link>
          </div>
          <div
            className="hero-enter mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            style={{ animationDelay: "360ms" }}
          >
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="size-3.5" />
              Observe → Reason → Remember → Verify → Calibrate
            </span>
            <span>BARS-scored practice</span>
            <span>Cited recommendations</span>
            <span>Human-in-the-loop verification</span>
            <span>k-anonymised team insights</span>
          </div>
        </section>

        {/* ── Narrative band ── */}
        <section className="border-y border-border/60 bg-card/40 py-4">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="marquee flex w-max shrink-0 items-center">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex items-center"
                >
                  {narrative.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-6 pr-6 text-[13px] font-medium text-muted-foreground"
                    >
                      {item}
                      <span className="size-1 rounded-full bg-primary" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80} className="bg-card">
                <div className="p-6">
                  <p className="font-mono text-3xl font-bold tabular-nums text-primary">
                    {typeof stat.value === "number" ? (
                      <CountUp value={stat.value} />
                    ) : (
                      stat.value
                    )}
                    {stat.suffix}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── The loop ── */}
        <section className="mx-auto max-w-5xl px-4 pt-24">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              The loop
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Observe → Reason → Remember → Verify → Calibrate
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Not a static training tool — an agentic loop where the system
              gets sharper with every verdict a manager gives.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-3 md:grid-cols-5">
            {loopSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="group h-full rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_44px_-18px_var(--primary)]">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary/15">
                      <step.icon className="size-4 text-primary" />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{step.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Bento grid ── */}
        <section className="mx-auto max-w-5xl px-4 pt-24">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why it's different
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Evidence you can open, verdicts that train
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-6">
            <Reveal className="md:col-span-4">
              <div className="h-full rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold">
                  Two streams, one reading
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Practice proves what staff can do in a simulation. Only the
                  floor proves what they do under pressure.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="size-4 text-chart-1" />
                      <p className="text-xs font-semibold">
                        Practice stream
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      Diego's scored scenarios — his own words, rated on the
                      BARS framework.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="size-4 text-chart-2" />
                      <p className="text-xs font-semibold">Floor stream</p>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      Marta's 20-second observation — what she personally saw
                      on shift.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-accent/25 p-3.5">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-xs font-semibold text-primary">
                    Cited coaching recommendation — held until a human
                    verifies it
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90} className="md:col-span-2">
              <div className="h-full rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold">Every claim cites its source</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Open any citation and see the exact evidence behind it.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: BookOpen, text: "SOP · complaint_policy_v2 §3.1" },
                    { icon: MessageSquareQuote, text: "Practice · Diego's turn 5" },
                    { icon: Eye, text: "Observation · Sep 2, Marta" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <Icon className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="md:col-span-2">
              <div className="h-full rounded-2xl border bg-card p-6">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.66_0.11_150)]/15">
                  <ShieldCheck className="size-4 text-[oklch(0.78_0.1_150)]" />
                </div>
                <p className="mt-3 text-sm font-semibold">Human-in-the-loop</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  Nothing routes on AI output alone. Confirm, correct or
                  reject — and nothing about a staff member is acted on
                  without their visibility.
                </p>
              </div>
            </Reveal>

            <Reveal delay={90} className="md:col-span-2">
              <div className="h-full rounded-2xl border bg-card p-6">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
                  <Gauge className="size-4 text-primary" />
                </div>
                <p className="mt-3 text-sm font-semibold">Calibration you can watch</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  The agreement between the agent's read and the manager's
                  verdict — updated with every decision.
                </p>
                <p className="mt-4 font-mono text-2xl font-bold tabular-nums text-primary">
                  0.840 <ArrowRight className="inline size-4 text-muted-foreground" /> 0.846
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[86%] rounded-full bg-primary" />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  service recovery · n = 41 after one confirm
                </p>
              </div>
            </Reveal>

            <Reveal delay={180} className="md:col-span-2">
              <div className="flex h-full flex-col rounded-2xl border bg-card p-6">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.64_0.07_340)]/15">
                  <GraduationCap className="size-4 text-[oklch(0.76_0.07_340)]" />
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Where research stops, we start
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  Cornell's AI hospitality training built the simulation —
                  guest, coach and report agents grounded in hotel SOPs. It
                  stopped at practice. We close the loop on the floor.
                </p>
                <Link
                  href="https://innovationhub.ai.cornell.edu/articles/training-the-next-generation-of-hotel-staff-an-ai-powered-approach-to-hospitality-education/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-primary hover:underline"
                >
                  Read the Cornell project
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mx-auto max-w-5xl px-4 pb-24 pt-24">
          <Reveal>
            <div className="conic-border relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
              <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
              <h2 className="relative text-2xl font-semibold tracking-tight md:text-4xl">
                Walk the demo in five minutes
              </h2>
              <p className="relative mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                One shift, one gap, one verdict — and a calibration number
                that moves before your eyes.
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/manager"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-12px_var(--primary)] transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  Start with the manager <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/staff"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-background/40 px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted/40 sm:w-auto"
                >
                  Or live a shift as Diego
                </Link>
              </div>
              <p className="relative mt-5 text-[11px] text-muted-foreground">
                Seeded demo data · no login needed · nothing routes anywhere
              </p>
            </div>
          </Reveal>
        </section>

        <footer className="border-t">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
            <p>The Coaching Engine — TechIreland National AI Challenge 2026</p>
            <p>k-anonymised insights · no disciplinary routing · every record visible to staff</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/4%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/4%)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent)]" />
      <div className="aurora-drift absolute -top-32 left-1/4 size-[26rem] rounded-full bg-primary/25 opacity-60 blur-3xl dark:opacity-100" />
      <div
        className="aurora-drift absolute -top-20 right-[12%] size-96 rounded-full opacity-50 blur-3xl dark:opacity-90"
        style={{
          backgroundColor: "oklch(0.63 0.11 45 / 0.5)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="aurora-drift absolute top-[42rem] -left-32 size-[30rem] rounded-full opacity-40 blur-3xl dark:opacity-70"
        style={{
          backgroundColor: "oklch(0.79 0.12 80 / 0.4)",
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}
