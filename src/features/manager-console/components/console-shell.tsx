"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardCheck, ListChecks, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/manager", label: "Overview", icon: Sparkles },
  { href: "/manager/observe", label: "Log observation", icon: ClipboardCheck },
  { href: "/manager/verify", label: "Verify queue", icon: ListChecks, badge: "3" },
  { href: "/manager/gap", label: "Transfer gap", icon: BarChart3 },
  { href: "/manager/insights", label: "Team insights", icon: Users },
];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Coaching Engine</p>
            <p className="text-xs text-muted-foreground">Manager Console</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === "/manager"
                ? pathname === "/manager"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-5 py-4">
          <p className="text-sm font-medium">Marta Murphy</p>
          <p className="text-xs text-muted-foreground">
            Duty Manager · The Meridian, Dublin
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
        <MobileNav pathname={pathname} />
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background/95 backdrop-blur md:hidden">
      {nav.map((item) => {
        const active =
          item.href === "/manager"
            ? pathname === "/manager"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="size-5" />
            {item.label.split(" ")[0]}
            {item.badge && (
              <span className="absolute right-1/4 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
