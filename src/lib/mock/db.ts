import {
  calibration,
  completedAttempt,
  diegoDebrief,
  diegoEscalation,
  diegoGap,
  diegoObservation,
  diegoScoreResult,
  historyAug26Attempt,
  historyAug29Attempt,
  inProgressAttempt,
  recommendations,
  scenarios,
  staffMembers,
  teamInsights,
} from "@/lib/mock/seed";
import type {
  Calibration,
  Debrief,
  Observation,
  ObservationInput,
  ObservationResponse,
  PracticeAttempt,
  Recommendation,
  Scenario,
  ScoreResult,
  TeamInsights,
  TransferGap,
  TurnResponse,
  VerifyInput,
  VerifyResponse,
} from "@/lib/types";

/**
 * In-memory mock store. Every function mirrors a frozen LLD-B endpoint.
 * Swap to the real API by setting USE_REAL_API — see src/lib/api/client.ts.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const store = {
  observations: [diegoObservation] as Observation[],
  recommendations: [...recommendations] as Recommendation[],
  attempts: new Map<string, PracticeAttempt>([
    [completedAttempt.id, completedAttempt],
    [historyAug29Attempt.id, historyAug29Attempt],
    [historyAug26Attempt.id, historyAug26Attempt],
    [inProgressAttempt.id, inProgressAttempt],
  ]),
  calibration: calibration as Calibration,
};

export const mockDb = {
  // GET /scenarios
  async listScenarios(): Promise<Scenario[]> {
    await wait(250);
    return scenarios;
  },

  // POST /scenarios/{id}/attempts — idempotent per scenario: an in-progress
  // attempt is reused so refreshes never lose the conversation.
  async startAttempt(scenarioId: string): Promise<PracticeAttempt> {
    await wait(350);
    const existing = [...store.attempts.values()].find(
      (a) => a.scenario_id === scenarioId && a.status === "in_progress"
    );
    if (existing) return existing;

    const scenario = scenarios.find((s) => s.id === scenarioId);
    const attempt: PracticeAttempt = {
      id: `attempt-${Date.now()}`,
      scenario_id: scenarioId,
      status: "in_progress",
      turns: [
        {
          turn_index: 0,
          guest: {
            content:
              scenario?.kind === "personal"
                ? "Oh, you're the one from Tuesday. We waited forty minutes for our food and the starter never arrived. What are you going to do about it?"
                : "Good afternoon. My room is not ready and I have been waiting since 3pm. This is not what I paid for.",
            mood: "frustrated",
          },
          turns_remaining: 6,
          can_complete: false,
        },
      ],
      result: null,
    };
    store.attempts.set(attempt.id, attempt);
    return attempt;
  },

  // POST /attempts/{id}/turns
  async sendTurn(attemptId: string, content: string) {
    await wait(600);
    const attempt = store.attempts.get(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    const turnIndex = attempt.turns.length;
    const turnsRemaining = 6 - turnIndex;

    const scriptedGuestReplies = [
      "And how do I know this won't happen again tonight?",
      "I don't want a voucher. I want to know someone here actually understands.",
      "Hmm. Fine. But this is the second time this month.",
      "Alright... I appreciate you saying it that way.",
    ];

    const turnResponse: TurnResponse = {
      turn_index: turnIndex,
      guest: {
        content:
          scriptedGuestReplies[
            Math.min(turnIndex - 1, scriptedGuestReplies.length - 1)
          ],
        mood: turnIndex >= 4 ? "calming" : "escalating",
      },
      turns_remaining: Math.max(turnsRemaining, 0),
      can_complete: turnsRemaining <= 0,
    };

    attempt.turns = [...attempt.turns, turnResponse];
    return turnResponse;
  },

  // POST /attempts/{id}/complete → GET /attempts/{id}
  async completeAttempt(attemptId: string): Promise<ScoreResult> {
    await wait(900);
    const attempt = store.attempts.get(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    attempt.status = "completed";
    attempt.result = { ...diegoScoreResult, attempt_id: attemptId, completed_at: new Date().toISOString() };
    return attempt.result;
  },

  async getAttempt(attemptId: string): Promise<PracticeAttempt | undefined> {
    await wait(150);
    return store.attempts.get(attemptId);
  },

  // GET /debriefs/{id} — Diego's processed debrief
  async getDebrief(id: string): Promise<Debrief | undefined> {
    await wait(250);
    return id === diegoDebrief.id ? diegoDebrief : undefined;
  },

  // POST /debriefs — registers a new debrief (demo: resolves to processed)
  async createDebrief(text: string): Promise<{ id: string; debrief: Debrief }> {
    await wait(700);
    const debrief: Debrief = {
      ...diegoDebrief,
      id: `d-${Date.now()}`,
      transcript: text,
      status: "extracted",
    };
    return { id: debrief.id, debrief };
  },

  // POST /observations (Listing 5) — unlocks practice history
  async logObservation(input: ObservationInput): Promise<ObservationResponse> {
    await wait(800);
    const observation: Observation = {
      ...input,
      id: `obs-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.observations = [...store.observations, observation];
    return {
      id: observation.id,
      unlocked_practice_history: true,
      recommendation_id: `rec-${Date.now()}`,
      recommendation_status: "pending_verify",
    };
  },

  async listObservations(): Promise<Observation[]> {
    await wait(200);
    return store.observations;
  },

  // GET /staff/{id}/gap (Listing 6)
  async getGap(staffId: string): Promise<TransferGap | undefined> {
    await wait(400);
    if (!staffMembers.some((s) => s.id === staffId)) return undefined;
    if (staffId === "9f2c-diego") return diegoGap;
    // Demo mock: every selectable staff member has a readable gap so the
    // post-observation redirect never dead-ends.
    return {
      ...diegoGap,
      staff_id: staffId,
      computed_at: new Date().toISOString(),
    };
  },

  // GET /recommendations — the verify queue
  async listRecommendations(): Promise<Recommendation[]> {
    await wait(300);
    return store.recommendations;
  },

  async getRecommendation(id: string): Promise<Recommendation | undefined> {
    await wait(200);
    return store.recommendations.find((r) => r.id === id);
  },

  // POST /recommendations/{id}/verify (Listing 9) — moves the calibration number
  async verifyRecommendation(
    id: string,
    input: VerifyInput
  ): Promise<VerifyResponse> {
    await wait(700);
    const rec = store.recommendations.find((r) => r.id === id);
    if (!rec) throw new Error("Recommendation not found");

    store.recommendations = store.recommendations.map((r) =>
      r.id === id ? { ...r, status: input.verdict } : r
    );

    const verdictDelta = {
      confirmed: 0.006,
      corrected: -0.003,
      rejected: -0.006,
    } as const;
    const before = rec.calibration.agreement_rate;
    const after = Math.round((before + verdictDelta[input.verdict]) * 1000) / 1000;
    const sampleSize = rec.calibration.sample_size + 1;

    store.calibration = {
      ...store.calibration,
      dimensions: store.calibration.dimensions.map((d) =>
        d.dimension === rec.calibration.dimension
          ? { ...d, agreement_rate: after, sample_size: sampleSize }
          : d
      ),
    };

    return {
      status: input.verdict,
      calibration_updated: {
        dimension: rec.calibration.dimension,
        agreement_rate_before: before,
        agreement_rate_after: after,
        sample_size: sampleSize,
      },
      escalation:
        input.verdict === "confirmed" && rec.classification === "policy"
          ? diegoEscalation
          : null,
    };
  },

  // GET /calibration
  async getCalibration(): Promise<Calibration> {
    await wait(250);
    return store.calibration;
  },

  // GET /insights/team (Listing 10)
  async getTeamInsights(): Promise<TeamInsights> {
    await wait(400);
    return teamInsights;
  },
};
