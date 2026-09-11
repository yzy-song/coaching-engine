import { ObservationForm } from "@/features/manager-console/components/observation-form";
import { managerApi } from "@/features/manager-console/api/managerApi";

export const metadata = { title: "Log observation — Manager Console" };

export const dynamic = "force-dynamic";

export default async function ObservePage() {
  // Real mode lists the live roster; mock mode falls back to the seed.
  const staff = await managerApi.listStaff();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="fade-up">
        <ObservationForm staff={staff} />
      </div>
    </div>
  );
}
