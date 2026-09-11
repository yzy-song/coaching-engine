"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Send, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { useVoiceInput } from "@/features/staff-pwa/lib/use-voice-input";
import { API_BASE_URL } from "@/lib/api/client";
import type { PracticeAttempt } from "@/lib/types";

interface Message {
  role: "staff" | "guest";
  content: string;
  mood?: string;
  turn_index: number;
  audioId?: string;
}

const moodLabel: Record<string, string> = {
  neutral: "neutral",
  frustrated: "frustrated",
  escalating: "escalating",
  calming: "calming",
};

const moodTone: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  frustrated: "bg-[oklch(0.8_0.06_80)]/15 text-[oklch(0.47_0.065_72)]",
  escalating: "bg-[oklch(0.7_0.085_28)]/15 text-[oklch(0.44_0.09_28)]",
  calming: "bg-[oklch(0.66_0.055_152)]/15 text-[oklch(0.38_0.055_152)]",
};

const moodShiftNote: Record<string, string> = {
  "neutral-frustrated": "The guest is getting frustrated",
  "neutral-escalating": "The guest is getting more upset",
  "neutral-calming": "The guest seems satisfied",
  "frustrated-escalating": "The guest is getting more upset",
  "frustrated-calming": "The guest is calming down",
  "frustrated-neutral": "The guest is settling",
  "escalating-calming": "The guest is calming down",
  "escalating-frustrated": "The guest is settling slightly",
  "escalating-neutral": "The guest is settling",
  "calming-neutral": "The guest is nearly satisfied",
};

function shiftNote(from: string, to: string): string | null {
  if (from === to) return null;
  return (
    moodShiftNote[`${from}-${to}`] ?? `Guest mood shifted: ${from} → ${to}`
  );
}

const DEMO_VOICE_LINE =
  "I'm really sorry about the wait — let me fix this for you right away.";

export function PracticeChat({
  attempt,
  scenarioTitle,
}: {
  attempt: PracticeAttempt;
  scenarioTitle: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() =>
    attempt.turns.map((t) => ({
      role: "guest" as const,
      content: t.guest.content,
      mood: t.guest.mood,
      turn_index: t.turn_index,
      audioId: t.guest.audio_id,
    }))
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const completingRef = useRef(false);

  const latestTurn = attempt.turns[attempt.turns.length - 1];
  const TOTAL_TURNS = latestTurn?.turns_remaining ?? 6;
  const [remaining, setRemaining] = useState(
    latestTurn?.turns_remaining ?? TOTAL_TURNS
  );
  const [canComplete, setCanComplete] = useState(
    latestTurn?.can_complete ?? false
  );
  const exhausted = remaining <= 0;

  const { listening, toggleVoice, stop } = useVoiceInput({
    demoLine: DEMO_VOICE_LINE,
    onTranscript: setInput,
    getBaseInput: () => input,
    enabled: !exhausted && !completing,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sending]);

  const handleSend = async () => {
    if (sendingRef.current || !input.trim()) return;
    stop();
    const content = input.trim();
    sendingRef.current = true;
    setSendFailed(false);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "staff", content, turn_index: prev.length },
    ]);
    setSending(true);
    try {
      const turn = await staffApi.sendTurn(attempt.id, content);
      setMessages((prev) => [
        ...prev,
        {
          role: "guest",
          content: turn.guest.content,
          mood: turn.guest.mood,
          audioId: turn.guest.audio_id,
          turn_index: turn.turn_index,
        },
      ]);
      setRemaining(turn.turns_remaining);
      setCanComplete(turn.can_complete);
    } catch {
      setSendFailed(true);
      setInput((v) => (v === "" ? content : v));
      // The tail is always the optimistic staff bubble: guest turns are
      // appended only after a successful POST, so slice(0, -1) is exact.
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleComplete = async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setCompleting(true);
    try {
      await staffApi.completeAttempt(attempt.id);
      await router.push(`/staff/results/${attempt.id}`);
    } catch {
      // navigation blocked or scoring failed — stay on the chat for a retry
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  };

  const lastGuestMood =
    [...messages].reverse().find((m) => m.role === "guest")?.mood ?? "neutral";

  const moodDividers = new Map<number, string>();
  let prevGuestMood: string | null = null;
  messages.forEach((message, i) => {
    if (message.role !== "guest") return;
    const mood = message.mood ?? "neutral";
    if (prevGuestMood !== null) {
      const note = shiftNote(prevGuestMood, mood);
      if (note) moodDividers.set(i, note);
    }
    prevGuestMood = mood;
  });

  const usedTurns = TOTAL_TURNS - remaining;
  const canFinish =
    canComplete || messages.some((m) => m.role === "staff");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
        <GuestAvatar />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {scenarioTitle}
          </h2>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-xs text-muted-foreground">The guest</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                moodTone[lastGuestMood] ?? moodTone.neutral
              }`}
            >
              {moodLabel[lastGuestMood] ?? "neutral"}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4"
      >
        <p className="text-center text-xs text-muted-foreground">
          You are practising as yourself. Nothing is graded live and nothing
          is shared — the notes at the end are yours alone.
        </p>
        {messages.map((message, i) => (
          <Fragment key={i}>
            {moodDividers.has(i) && (
              <MoodDivider note={moodDividers.get(i) ?? ""} />
            )}
            {message.role === "guest" ? (
              <GuestRow
                content={message.content}
                mood={message.mood ?? "neutral"}
                audioId={message.audioId}
              />
            ) : (
              <StaffRow content={message.content} />
            )}
          </Fragment>
        ))}
        {sending && <TypingIndicator />}
      </div>

      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_TURNS }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`size-1.5 rounded-full transition-colors ${
                  i < usedTurns ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {remaining} turns left
            </span>
          </div>
          {canFinish && (
            <Button onClick={handleComplete} disabled={completing} size="sm">
              {completing ? "Wrapping up…" : "Finish & see your notes"}
            </Button>
          )}
        </div>
        {sendFailed && (
          <p className="text-xs text-[oklch(0.44_0.09_28)]">
            Couldn't send that message — please try again.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={exhausted || completing || listening}
            placeholder={
              listening
                ? "Listening — speak your reply…"
                : exhausted
                  ? "Conversation complete — finish to see your notes"
                  : "What would you say to the guest?"
            }
            className="flex-1 rounded-xl border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            disabled={exhausted || completing || sending}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
            title="Voice input"
            className={`size-11 shrink-0 rounded-lg ${
              listening
                ? "border-[oklch(0.62_0.09_28)]/50 bg-[oklch(0.7_0.085_28)]/10 text-[oklch(0.44_0.09_28)]"
                : ""
            }`}
          >
            <Mic className={`size-4 ${listening ? "animate-pulse" : ""}`} />
          </Button>
          <Button
            onClick={handleSend}
            disabled={exhausted || completing || !input.trim() || sending}
            size="icon"
            aria-label="Send message"
            className="size-11 shrink-0 rounded-lg"
          >
            <Send className="size-4" />
          </Button>
        </div>
        {listening && (
          <p className="text-xs text-[oklch(0.44_0.09_28)]">
            Listening… your words fill the box — review, then send.
          </p>
        )}
      </div>
    </div>
  );
}

function GuestAvatar() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.92_0.03_82)] text-sm font-bold text-[oklch(0.42_0.045_55)] ring-1 ring-border dark:bg-[oklch(0.72_0.08_70)]/15 dark:text-[oklch(0.89_0.05_76)] dark:ring-[oklch(0.78_0.07_72)]/30">
      G
    </div>
  );
}

/** Plays one guest line. Autoplay is deliberately not used — a staff member
 * may be on a shift floor, or on a bus — so the line is offered, never
 * forced. When the backend could not synthesise, audioId is absent and
 * nothing renders at all. */
function GuestAudio({ audioId }: { audioId?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const errorNotifiedRef = useRef(false);

  if (!audioId) return null;

  const reportError = () => {
    if (errorNotifiedRef.current) return;
    errorNotifiedRef.current = true;
    toast.error("Couldn't play the guest voice.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          el.pause();
          el.currentTime = 0;
          void el.play().catch(reportError);
        }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <Volume2 className="size-4" />
        hear it
      </button>
      <audio
        ref={audioRef}
        src={`${API_BASE_URL}/voice/${audioId}.mp3`}
        preload="none"
        onError={reportError}
      />
    </>
  );
}

function GuestRow({
  content,
  mood,
  audioId,
}: {
  content: string;
  mood: string;
  audioId?: string;
}) {
  return (
    <div className="flex msg-in items-end gap-2">
      <GuestAvatar />
      <div className="max-w-[78%]">
        <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 text-sm">
          {content}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              moodTone[mood] ?? moodTone.neutral
            }`}
          >
            guest · {moodLabel[mood] ?? "neutral"}
          </p>
          <GuestAudio audioId={audioId} />
        </div>
      </div>
    </div>
  );
}

function StaffRow({ content }: { content: string }) {
  return (
    <div className="flex msg-in justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex msg-in items-end gap-2">
      <GuestAvatar />
      <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-3">
        <span className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function MoodDivider({ note }: { note: string }) {
  return (
    <div className="flex msg-in items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">
        {note}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
