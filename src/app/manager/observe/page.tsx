import { Timer } from "lucide-react";
import { ObservationForm } from "@/features/manager-console/components/observation-form";
import { staffMembers } from "@/lib/mock/seed";

export const metadata = { title: "Log observation — Manager Console" };

export default function ObservePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Log a floor observation</h1>
          <p className="text-sm text-muted-foreground">
            Twenty seconds, three ratings. What you personally saw on shift.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Timer className="size-3.5" />
          ~20s
        </div>
      </div>
      <ObservationForm staff={staffMembers} />
    </div>
  );
}
