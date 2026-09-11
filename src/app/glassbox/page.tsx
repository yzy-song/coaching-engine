import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GlassBox } from "@/features/glass-box/components/glass-box";
import { isRealApi } from "@/lib/api/client";

export const metadata = {
  title: "Glass box — The Coaching Engine",
  description:
    "Check the three claims instead of believing them: where the reasoning "
    + "lives, what the cite gate rejects, and who the database lets you read.",
};

/** The page exists for one audience: someone who has just been told this is a
 * wrapper around a language model and wants to see for themselves. Every panel
 * below runs production code on demand. Nothing is recorded or replayed. */
export default function GlassBoxPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* This page sits outside both shells, so without this it would be a
          dead end for anyone who lands on it. */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
          The glass box
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Three claims we would rather you checked than believed. Each panel
          calls the same code the product runs, live, when you press the button.
          If a panel says the gate rejected a fabricated citation, it is because
          the gate rejected it a moment ago.
        </p>
      </header>
      {isRealApi() ? (
        <GlassBox />
      ) : (
        <div className="flex justify-center py-12">
          <Card className="w-full max-w-md border bg-card">
            <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
              The glass box runs on the live API — this demo is in mock mode.
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
