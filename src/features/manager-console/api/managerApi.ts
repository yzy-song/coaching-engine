import { http, isRealApi } from "@/lib/api/client";
import { mockDb } from "@/lib/mock/db";
import type {
  Calibration,
  Observation,
  ObservationInput,
  ObservationResponse,
  Recommendation,
  TeamInsights,
  TransferGap,
  VerifyInput,
  VerifyResponse,
} from "@/lib/types";

/** Manager Console API — mirrors LLD-B manager/ld endpoints. */

export const managerApi = {
  listObservations: (): Promise<Observation[]> =>
    isRealApi() ? http.get("/observations") : mockDb.listObservations(),

  logObservation: (input: ObservationInput): Promise<ObservationResponse> =>
    isRealApi()
      ? http.post("/observations", input)
      : mockDb.logObservation(input),

  getGap: (staffId: string): Promise<TransferGap | undefined> =>
    isRealApi()
      ? http.get(`/staff/${staffId}/gap`)
      : mockDb.getGap(staffId),

  listRecommendations: (): Promise<Recommendation[]> =>
    isRealApi()
      ? http.get("/recommendations")
      : mockDb.listRecommendations(),

  getRecommendation: (id: string): Promise<Recommendation | undefined> =>
    isRealApi()
      ? http.get(`/recommendations/${id}`)
      : mockDb.getRecommendation(id),

  verifyRecommendation: (
    id: string,
    input: VerifyInput
  ): Promise<VerifyResponse> =>
    isRealApi()
      ? http.post(`/recommendations/${id}/verify`, input)
      : mockDb.verifyRecommendation(id, input),

  getCalibration: (): Promise<Calibration> =>
    isRealApi() ? http.get("/calibration") : mockDb.getCalibration(),

  getTeamInsights: (): Promise<TeamInsights> =>
    isRealApi()
      ? http.get("/insights/team")
      : mockDb.getTeamInsights(),
};
