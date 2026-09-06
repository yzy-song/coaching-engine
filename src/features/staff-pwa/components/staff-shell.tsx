"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, MessageCircle } from "lucide-react";
import {
  completedAttempt,
  currentManager,
  historyAug26Attempt,
  historyAug29Attempt,
  staffMembers,
} from "@/lib/mock/seed";
import type { ScoreResult } from "@/lib/types";

const tabs = [
  { href: "/staff", label: "Home", icon: Home },
  { href: "/staff/practice", label: "Practice", icon: MessageCircle },
  { href: "/staff/history", label: "My scores", icon: History },
];

// The staff PWA is the narrative actor's phone in the demo: roster id
// 9f2c-diego (seed.sql staff-001). Header strings come from the roster so a
// rename in seed.ts flows through without touching the shell.
const actor = staffMembers.find((s) => s.id === "9f2c-diego");

/** Initials from the name field itself (first letters of each word). */
function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "?"
  );
}

/** The actor's completed practice runs in the seed (the staff PWA narrates
 * one staff member, so their header level is their own data — never static). */
const actorPracticeResults = [
  completedAttempt.result,
  historyAug29Attempt.result,
  historyAug26Attempt.result,
].filter((result): result is ScoreResult => result !== null);

/** Mean of the actor's rated dimensions across completed practice runs, one
 * decimal — the same story the transfer-gap page tells as "Practice 4.0". */
function actorPracticeMean(): string | null {
  const levels = actorPracticeResults.flatMap((result) =>
    result.scores
      .filter((s) => s.level !== null)
      .map((s) => s.level as number)
  );
  if (levels.length === 0) return null;
  const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  return mean.toFixed(1);
}

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh justify-center bg-muted/40">
      <div className="relative flex min-h-dvh w-full max-w-md flex-col bg-background shadow-2xl ring-1 ring-border">
        <header className="flex items-center gap-3 border-b px-4 py-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {actor ? initials(actor.name) : "?"}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">
              {actor?.name ?? "Team member"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[actor?.role, currentManager.property]
                .filter((part): part is string => Boolean(part))
                .join(" · ")}
            </p>
          </div>
          <div className="ml-auto flex size-8 items-center justify-center rounded-full bg-[oklch(0.66_0.11_150)]/15 text-xs font-bold text-[oklch(0.78_0.1_150)] ring-1 ring-[oklch(0.66_0.11_150)]/30">
            {actorPracticeMean() ?? "—"}
          </div>
        </header>

        <main className="flex flex-1 flex-col px-4 pb-24 pt-4">{children}</main>

        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 border-t bg-background/95 backdrop-blur">
          {tabs.map((tab) => {
            const active =
              tab.href === "/staff"
                ? pathname === "/staff"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="size-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
