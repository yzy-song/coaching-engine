"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PracticeAttempt } from "@/lib/types";

interface Message {
  role: "staff" | "guest";
  content: string;
  mood?: string;
  turn_index: number;
}

const moodLabel: Record<string, string> = {
  neutral: "neutral",
  frustrated: "frustrated",
  escalating: "escalating",
  calming: "calming",
};

const moodTone: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  frustrated: "bg-amber-500/15 text-amber-200",
  escalating: "bg-rose-500/15 text-rose-300",
  calming: "bg-emerald-500/15 text-emerald-300",
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

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

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
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseInputRef = useRef("");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
    };
  }, []);

  const stopVoice = () => {
    const rec = recRef.current;
    recRef.current = null;
    setListening(false);
    rec?.abort();
  };

  const handleMic = () => {
    if (listening) {
      stopVoice();
      return;
    }
    if (exhausted || completing) return;
    const rec = getSpeechRecognition();
    if (!rec) {
      setInput((v) => (v.trim() ? `${v} ` : "") + DEMO_VOICE_LINE);
      toast.info(
        "Voice input isn't available in this browser — filled a demo reply instead."
      );
      return;
    }
    baseInputRef.current = input;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        const chunk = e.results[i][0]?.transcript ?? "";
        if (chunk) text += (text ? " " : "") + chunk;
      }
      const base = baseInputRef.current.trim();
      setInput((base ? `${base} ` : "") + text.trim());
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
    };
    rec.onerror = (e) => {
      if (recRef.current !== rec) return;
      recRef.current = null;
      setListening(false);
      setInput((v) => (v.trim() ? `${v} ` : "") + DEMO_VOICE_LINE);
      toast.info(
        `Voice recognition failed (${e.error}) — filled a demo reply instead.`
      );
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const handleSend = async () => {
    if (sendingRef.current || !input.trim()) return;
    stopVoice();
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
      const res = await fetch(`/api/v1/attempts/${attempt.id}/turns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Turn failed");
      const turn = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "guest",
          content: turn.guest.content,
          mood: turn.guest.mood,
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
      const res = await fetch(`/api/v1/attempts/${attempt.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Complete failed");
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
  const exhausted = remaining <= 0;
  const canFinish =
    canComplete || messages.some((m) => m.role === "staff");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <GuestAvatar />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">The guest</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                moodTone[lastGuestMood] ?? moodTone.neutral
              }`}
            >
              {moodLabel[lastGuestMood] ?? "neutral"}
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {scenarioTitle}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4"
      >
        <p className="text-center text-[11px] text-muted-foreground">
          You are practising as yourself. Nothing is graded live — the score
          comes once, at the end, over the whole conversation.
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
              {completing ? "Scoring…" : "Finish & get scored"}
            </Button>
          )}
        </div>
        {sendFailed && (
          <p className="text-xs text-rose-400">
            Couldn't send that message — please try again.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={exhausted || completing}
            placeholder={
              listening
                ? "Listening — speak your reply…"
                : exhausted
                  ? "Conversation complete — finish to see your score"
                  : "What would you say to the guest?"
            }
            className="flex-1 rounded-xl border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleMic}
            disabled={exhausted || completing || sending}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            className={`size-11 shrink-0 rounded-xl ${
              listening ? "border-rose-400/60 bg-rose-500/15 text-rose-300" : ""
            }`}
          >
            <Mic className={`size-4 ${listening ? "animate-pulse" : ""}`} />
          </Button>
          <Button
            onClick={handleSend}
            disabled={exhausted || completing || !input.trim() || sending}
            size="icon"
            aria-label="Send message"
            className="size-11 shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </div>
        {listening && (
          <p className="text-xs text-rose-300">
            Listening… your words fill the box — review, then send.
          </p>
        )}
      </div>
    </div>
  );
}

function GuestAvatar() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 ring-2 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/30">
      G
    </div>
  );
}

function GuestRow({ content, mood }: { content: string; mood: string }) {
  return (
    <div className="flex msg-in items-end gap-2">
      <GuestAvatar />
      <div className="max-w-[78%]">
        <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 text-sm shadow-sm">
          {content}
        </div>
        <p
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
            moodTone[mood] ?? moodTone.neutral
          }`}
        >
          guest · {moodLabel[mood] ?? "neutral"}
        </p>
      </div>
    </div>
  );
}

function StaffRow({ content }: { content: string }) {
  return (
    <div className="flex msg-in justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-[0_4px_20px_-8px_var(--primary)]">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex msg-in items-end gap-2">
      <GuestAvatar />
      <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-3 shadow-sm">
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
      <span className="text-[11px] font-medium text-muted-foreground">
        {note}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
