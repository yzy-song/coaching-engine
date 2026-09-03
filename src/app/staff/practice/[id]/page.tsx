import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeChat } from "@/features/staff-pwa/components/practice-chat";
import { staffApi } from "@/features/staff-pwa/api/staffApi";
import { dimensionShort } from "@/lib/format";

export default async function PracticeChatPage(
  props: PageProps<"/staff/practice/[id]">
) {
  const { id } = await props.params;
  const scenario = (await staffApi.listScenarios()).find((s) => s.id === id);
  const attempt = await staffApi.startAttempt(id);

  return (
    <div className="flex h-[calc(100dvh-110px)] flex-col">
      <div className="flex items-center gap-3 pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          nativeButton={false} render={<Link href="/staff/practice" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{scenario?.title}</p>
          <p className="text-[11px] text-muted-foreground">
            {scenario?.dimensions.map((d) => dimensionShort[d]).join(" · ")}
          </p>
        </div>
      </div>
      <PracticeChat attempt={attempt} />
    </div>
  );
}
