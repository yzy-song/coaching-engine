"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Debrief } from "@/lib/types";

export function DebriefEntry() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Debrief | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/debriefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Debrief failed");
      const data = await res.json();
      setResult(data.debrief as Debrief);
      toast.success("Got it — here's what your standard says");
    } catch {
      toast.error("Could not save that. Please try again.");
      setSubmitting(false);
    }
  };

  if (result?.standard) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="size-4 text-emerald-700" />
            </div>
            <p className="text-sm font-semibold">
              Your hotel's own standard — straight after your shift
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.transcript}
          </p>
        </div>

        <div className="rounded-2xl border border-primary/25 bg-accent/25 p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <p className="text-xs font-semibold text-primary">
              {result.standard.document} · {result.standard.section_path}
            </p>
          </div>
          <blockquote className="mt-2 border-l-2 border-primary pl-3 text-sm font-medium italic">
            “{result.standard.excerpt}”
          </blockquote>
          <p className="mt-2 text-xs text-muted-foreground">
            Why you're seeing this: {result.standard.why_shown}
          </p>
        </div>

        {result.generated_scenario_id && (
          <Link
            href={`/staff/practice/${result.generated_scenario_id}`}
            className="flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground"
          >
            <div>
              <p className="text-sm font-semibold">
                A 3-minute replay was built from what you just said
              </p>
              <p className="text-xs opacity-80">
                Practise it now while it's fresh — it's yours, not shared.
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">
          What happened on your shift?
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          30–90 seconds, in your own words. It never routes to a disciplinary
          path — it's how you get coaching that's about your actual day.
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A table waited about forty minutes for food and when it came the starter was missing…"
          className="mt-3 min-h-28"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="flex-1"
          >
            {submitting ? "Checking against your standard…" : "Get instant feedback"}
          </Button>
          <Button variant="outline" size="icon" className="size-10 shrink-0" disabled>
            <Mic className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Voice debrief coming soon — audio is deleted once the transcript is
          confirmed.
        </p>
      </div>
    </div>
  );
}
