"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, MessageCircle } from "lucide-react";

const tabs = [
  { href: "/staff", label: "Home", icon: Home },
  { href: "/staff/practice", label: "Practice", icon: MessageCircle },
  { href: "/staff/history", label: "My scores", icon: History },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh justify-center bg-muted/40">
      <div className="relative flex min-h-dvh w-full max-w-md flex-col bg-background shadow-2xl ring-1 ring-border">
        <header className="flex items-center gap-3 border-b px-4 py-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            DA
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Diego Alvarez</p>
            <p className="text-xs text-muted-foreground">
              Front Desk · The Meridian
            </p>
          </div>
          <div className="ml-auto flex size-8 items-center justify-center rounded-full bg-[oklch(0.66_0.11_150)]/15 text-xs font-bold text-[oklch(0.78_0.1_150)] ring-1 ring-[oklch(0.66_0.11_150)]/30">
            4.0
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
