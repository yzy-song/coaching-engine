import { http, isRealApi } from "@/lib/api/client";
import { mockDb } from "@/lib/mock/db";
import type {
  Debrief,
  DebriefRegistration,
  DebriefStatus,
  PracticeAttempt,
  Scenario,
  ScoreResult,
} from "@/lib/types";

/** Staff PWA API — mirrors LLD-B staff endpoints. */

/** Debrief statuses that mean the pipeline has finished (typed debriefs land
 * in exactly one of these: a clause matched, or none did). */
const TERMINAL_STATUSES: ReadonlySet<DebriefStatus> = new Set([
  "extracted",
  "failed",
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mock branch of the debrief flow can return either the legacy
 * `{ id, debrief }` or the frozen `DebriefRegistration` shape while db.ts
 * migrates — both carry the id, and the mock store resolves synchronously,
 * so one follow-up read always finds the parsed debrief. */
type MockCreatedDebrief = {
  id: string;
  debrief?: Debrief;
};

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

  /** POST /debriefs → 202 { id, status, poll_after_ms }, then follow the
   * registration with one GET by id (the frozen polling contract). The mock
   * pipeline resolves inside the POST, so the first read is already terminal
   * there; the real pipeline gets one retry after the advertised cadence. */
  createDebrief: async (text: string): Promise<Debrief> => {
    if (isRealApi()) {
      const registration = await http.post<DebriefRegistration>("/debriefs", {
        text,
      });
      const firstRead = await http.get<Debrief>(`/debriefs/${registration.id}`);
      if (TERMINAL_STATUSES.has(firstRead.status)) return firstRead;
      await sleep(registration.poll_after_ms);
      const secondRead = await http.get<Debrief>(`/debriefs/${registration.id}`);
      if (TERMINAL_STATUSES.has(secondRead.status)) return secondRead;
      throw new Error("Debrief is still processing — check back in a moment.");
    }
    const created = (await mockDb.createDebrief(text)) as MockCreatedDebrief;
    if (created.debrief) return created.debrief;
    const stored = await mockDb.getDebrief(created.id);
    if (stored) return stored;
    throw new Error("Debrief could not be read back");
  },
};
