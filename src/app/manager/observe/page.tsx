import { ObservationForm } from "@/features/manager-console/components/observation-form";
import { staffMembers } from "@/lib/mock/seed";

export const metadata = { title: "Log observation — Manager Console" };

export default function ObservePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="fade-up">
        <ObservationForm staff={staffMembers} />
      </div>
    </div>
  );
}
