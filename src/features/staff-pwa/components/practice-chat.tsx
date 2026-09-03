"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
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
  frustrated: "bg-amber-100 text-amber-800",
  escalating: "bg-rose-100 text-rose-800",
  calming: "bg-emerald-100 text-emerald-800",
};

export function PracticeChat({ attempt }: { attempt: PracticeAttempt }) {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestTurn = attempt.turns[attempt.turns.length - 1];
  const [remaining, setRemaining] = useState(latestTurn?.turns_remaining ?? 6);
  const [canComplete, setCanComplete] = useState(latestTurn?.can_complete ?? false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
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
        { role: "guest", content: turn.guest.content, mood: turn.guest.mood, turn_index: turn.turn_index },
      ]);
      setRemaining(turn.turns_remaining);
      setCanComplete(turn.can_complete);
    } catch {
      setInput(content);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/v1/attempts/${attempt.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Complete failed");
      router.push(`/staff/results/${attempt.id}`);
    } catch {
      setCompleting(false);
    }
  };

  const lastGuestMood = [...messages].reverse().find((m) => m.role === "guest")?.mood ?? "neutral";

  return (
    <div className="flex h-[calc(100dvh-150px)] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        <p className="text-center text-[11px] text-muted-foreground">
          You are practising as yourself. Nothing is graded live — the score
          comes once, at the end, over the whole conversation.
        </p>
        {messages.map((message, i) =>
          message.role === "guest" ? (
            <div key={i} className="flex justify-end">
              <GuestBubble content={message.content} mood={message.mood ?? "neutral"} />
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <StaffBubble content={message.content} />
            </div>
          )
        )}
        {sending && (
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-sm border bg-card px-4 py-2.5 text-sm">
              <span className="animate-pulse text-muted-foreground">
                The guest is replying…
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{remaining} turns left</span>
          <span className="font-medium">{moodLabel[lastGuestMood]}</span>
        </div>
        {canComplete && (
          <Button
            onClick={handleComplete}
            disabled={completing}
            className="w-full"
          >
            {completing ? "Scoring your attempt…" : "Finish & get scored"}
          </Button>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="What would you say to the guest?"
            className="flex-1 rounded-xl border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
            className="size-11 shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function GuestBubble({ content, mood }: { content: string; mood: string }) {
  return (
    <div className="max-w-[80%]">
      <div className="rounded-2xl rounded-br-sm border bg-card px-4 py-2.5 text-sm shadow-sm">
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
  );
}

function StaffBubble({ content }: { content: string }) {
  return (
    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
      {content}
    </div>
  );
}
