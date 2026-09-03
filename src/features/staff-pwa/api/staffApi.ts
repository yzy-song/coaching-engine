import { http, isRealApi } from "@/lib/api/client";
import { mockDb } from "@/lib/mock/db";
import type {
  Debrief,
  PracticeAttempt,
  Scenario,
  ScoreResult,
} from "@/lib/types";

/** Staff PWA API — mirrors LLD-B staff endpoints. */

export const staffApi = {
  listScenarios: (): Promise<Scenario[]> =>
    isRealApi() ? http.get("/scenarios") : mockDb.listScenarios(),

  startAttempt: (scenarioId: string): Promise<PracticeAttempt> =>
    isRealApi()
      ? http.post(`/scenarios/${scenarioId}/attempts`, {})
      : mockDb.startAttempt(scenarioId),

  sendTurn: (
    attemptId: string,
    content: string
  ): Promise<{
    turn_index: number;
    guest: { content: string; mood: string };
    turns_remaining: number;
    can_complete: boolean;
  }> =>
    isRealApi()
      ? http.post(`/attempts/${attemptId}/turns`, { content })
      : mockDb.sendTurn(attemptId, content),

  completeAttempt: (attemptId: string): Promise<ScoreResult> =>
    isRealApi()
      ? http.post(`/attempts/${attemptId}/complete`, {})
      : mockDb.completeAttempt(attemptId),

  getAttempt: (attemptId: string): Promise<PracticeAttempt | undefined> =>
    isRealApi()
      ? http.get(`/attempts/${attemptId}`)
      : mockDb.getAttempt(attemptId),

  getDebrief: (id: string): Promise<Debrief | undefined> =>
    isRealApi() ? http.get(`/debriefs/${id}`) : mockDb.getDebrief(id),

  createDebrief: (text: string): Promise<{ id: string; debrief: Debrief }> =>
    isRealApi()
      ? http.post("/debriefs", { text })
      : mockDb.createDebrief(text),
};
