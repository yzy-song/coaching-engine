import { DebriefEntry } from "@/features/staff-pwa/components/debrief-entry";
import { LastPracticeCard } from "@/features/staff-pwa/components/last-practice-card";

/** Rendered per request, never prerendered.
 *
 * Without this Next may statically render at build time and the page freezes
 * with whatever the database held during deployment. Everything here is live
 * operational data, and a manager acting on a stale queue is worse than a
 * manager waiting a moment for a fresh one.
 */
export const dynamic = "force-dynamic";

export default function StaffHomePage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Your practice
      </h1>
      <DebriefEntry />
      <LastPracticeCard />
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        This is your practice space — just for you. Your manager never sees
        your individual practice scores. They only get a coaching insight, and
        only after they&apos;ve logged their own observation of you.
      </p>
    </div>
  );
}
