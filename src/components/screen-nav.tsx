"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { parentOf } from "@/lib/nav";

/**
 * The one navigation row, at the top of every screen inside a shell.
 *
 * Two jobs, and they are deliberately at opposite ends so neither is mistaken
 * for the other:
 *
 *   left   go up one level, labelled with the destination
 *   right  jump back to the landing page
 *
 * The second one is the gap that mattered. Both apps had internal navigation
 * and no exit: once you opened the staff phone you could reach three tabs and
 * nothing else, and the glass box, which is linked from the manager sidebar,
 * had no chrome at all. Anyone who landed there had to use the browser's back
 * button, which is not something to rely on in front of a room.
 *
 * Rendered at the top of the content area rather than inside the sidebar, so
 * it is in the same place on a phone as on a laptop.
 */
export function ScreenNav({
  className = "",
  showHome = true,
}: {
  className?: string;
  /** The landing page needs no exit to itself. */
  showHome?: boolean;
}) {
  const pathname = usePathname();
  const back = parentOf(pathname);

  // Nothing to render at all would collapse the spacing the pages below expect.
  if (!back && !showHome) return null;

  return (
    <div className={`mb-5 flex items-center justify-between gap-3 ${className}`}>
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      ) : (
        <span />
      )}

      {showHome && (
        <Link
          href="/"
          className="-mr-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Home className="size-3.5" aria-hidden />
          Home
        </Link>
      )}
    </div>
  );
}
