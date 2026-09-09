"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { useVoiceInput } from "@/features/staff-pwa/lib/use-voice-input";
import type { Debrief } from "@/lib/types";

const DEMO_VOICE_LINE =
  "A guest asked for a late checkout and I wasn't sure if I could say yes, so I checked the duty manager's guidance.";

export function DebriefEntry() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Debrief | null>(null);

  const { listening, toggleVoice, stop } = useVoiceInput({
    demoLine: DEMO_VOICE_LINE,
    onTranscript: setText,
    getBaseInput: () => text,
    enabled: !submitting,
    demoNoun: "debrief",
  });

  const handleSubmit = async () => {
    if (submitting) return;
    if (!text.trim()) {
      toast.warning("Tell us what happened first — a sentence is enough.");
      return;
    }
    stop();
    setSubmitting(true);
    try {
      // POST registers the debrief (202) and the follow-up read returns the
      // cited standard. The mock resolves instantly, so there is no polling
      // spinner to jitter the UI — the read below is already the result.
      const debrief = await staffApi.createDebrief(text);
      if (debrief.status === "failed") {
        toast.error(
          "Could not match that to a standard yet. Try one more sentence about what happened."
        );
        return;
      }
      setResult(debrief);
      toast.success("Got it — here's what your standard says");
    } catch {
      toast.error("Could not save that. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.standard) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[oklch(0.66_0.055_152)]/15">
              <Sparkles className="size-4 text-[oklch(0.38_0.055_152)]" />
            </div>
            <p className="text-sm font-semibold">
              Your hotel&apos;s own standard — straight after your shift
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
            Why you&apos;re seeing this: {result.standard.why_shown}
          </p>
        </div>

        {result.generated_scenario_id && (
          <Link
            href={`/staff/practice/${result.generated_scenario_id}`}
            className="group flex items-center gap-3 rounded-2xl border bg-card p-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.66_0.055_152)]/15">
              <Sparkles className="size-4 text-[oklch(0.38_0.055_152)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                A 3-minute replay was built from what you just said
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Practise it now while it&apos;s fresh — it&apos;s yours, not
                shared.
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">
          This is just for you and your manager to talk through what actually
          happened.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          30–90 seconds, in your own words. It never routes to a disciplinary
          path — it&apos;s how you get coaching that&apos;s about your actual
          day.
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting || listening}
          placeholder={
            listening
              ? "Listening — speak your debrief…"
              : "A guest asked for something you weren't sure you could offer — or a moment that still feels off, in your own words…"
          }
          className="mt-3 min-h-28"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "Checking against your standard…" : "Get instant feedback"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            disabled={submitting}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
            title="Voice input"
            className={`size-10 shrink-0 rounded-lg ${
              listening
                ? "border-[oklch(0.62_0.09_28)]/50 bg-[oklch(0.7_0.085_28)]/10 text-[oklch(0.44_0.09_28)]"
                : ""
            }`}
          >
            <Mic className={`size-4 ${listening ? "animate-pulse" : ""}`} />
          </Button>
        </div>
        {listening && (
          <p
            aria-live="polite"
            className="mt-2 text-center text-xs text-[oklch(0.44_0.09_28)]"
          >
            Listening… your words fill the box — review, then submit.
          </p>
        )}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Voice is optional — audio stays on your device and is deleted once
          the transcript is confirmed.
        </p>
      </div>
    </div>
  );
}
