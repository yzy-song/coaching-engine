import { Suspense } from "react";
import { ObservationForm } from "@/features/manager-console/components/observation-form";
import { managerApi } from "@/features/manager-console/api/managerApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Log observation — Manager Console" };

export const dynamic = "force-dynamic";

/** Sync shell: paints immediately; the form waits on the roster fetch that
 * feeds its staff picker, so it streams in behind the skeleton. */
export default function ObservePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Suspense fallback={<ObserveSkeleton />}>
        <ObservePanels />
      </Suspense>
    </div>
  );
}

/** The form renders its own heading, so the skeleton is form-shaped: a
 * title bar, a subtitle bar, then a card of input-sized lines. */
function ObserveSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Card>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

async function ObservePanels() {
  // Real mode lists the live roster; mock mode falls back to the seed.
  const staff = await managerApi.listStaff();

  return (
    <div className="fade-up">
      <ObservationForm staff={staff} />
    </div>
  );
}
