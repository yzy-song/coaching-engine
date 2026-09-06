import { http, isRealApi } from "@/lib/api/client";
import { mockDb } from "@/lib/mock/db";
import type {
  CalibrationDimension,
  CalibrationReading,
  CalibrationState,
  Observation,
  ObservationInput,
  ObservationResponse,
  Recommendation,
  ScoreSource,
  ScoresResponse,
  TeamInsights,
  TransferGap,
  VerifyInput,
  VerifyResponse,
} from "@/lib/types";

/** Manager Console API — mirrors LLD-B manager/ld endpoints. */

// The mock store (db.ts, owned elsewhere) still serves the legacy
// { computed_at, dimensions } wrapper. Both the /calibration route and this
// client translate it to the frozen bare-array shape on the way out — keep the
// two mappings in step with the thresholds in calibration.py.
const PROVISIONAL_BELOW_N = 10;
const RELIABLE_LOWER_BOUND = 0.75;
const UNRELIABLE_UPPER_BOUND = 0.65;

function stateOf(
  sampleSize: number,
  lower: number,
  upper: number
): CalibrationState {
  if (sampleSize < PROVISIONAL_BELOW_N) return "provisional";
  if (lower >= RELIABLE_LOWER_BOUND) return "reliable";
  if (upper < UNRELIABLE_UPPER_BOUND) return "unreliable";
  return "uncertain";
}

function toCalibrationReading(d: CalibrationDimension): CalibrationReading {
  const lower = d.lower ?? d.wilson_low;
  const upper = d.upper ?? d.wilson_high;
  const state = d.state ?? stateOf(d.sample_size, lower, upper);
  const pct = Math.round((d.agreement_rate ?? 0) * 100);
  const advice =
    d.advice ??
    `Agrees with your managers ${pct}% of the time (${d.sample_size} checks).`;
  return {
    dimension: d.dimension,
    agreement_rate: d.agreement_rate,
    lower,
    upper,
    sample_size: d.sample_size,
    state,
    advice,
  };
}

/** Builds a CalibrationReading[] from the legacy wrapper served by db.ts. */
async function legacyCalibrationToReadings(): Promise<CalibrationReading[]> {
  const legacy = await mockDb.getCalibration();
  return legacy.dimensions.map(toCalibrationReading);
}

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

  /** GET /calibration → bare array of CalibrationReading (frozen contract).
   * The route handler is the canonical shape; in mock mode the legacy wrapper
   * from db.ts is mapped here so server pages see the frozen shape too. */
  getCalibration: (): Promise<CalibrationReading[]> =>
    isRealApi()
      ? http.get("/calibration")
      : legacyCalibrationToReadings(),

  /** GET /staff/{id}/scores?source=practice|floor — reads a staff member's
   * two evidence streams. Call from client components (or real-mode servers):
   * the scores route handler is the single implementation for both modes and
   * answers 409 (problem+json) for practice before the manager's first floor
   * observation of that person exists. */
  getScores: (
    staffId: string,
    source: ScoreSource
  ): Promise<ScoresResponse> =>
    http.get(`/staff/${staffId}/scores?source=${source}`),

  getTeamInsights: (): Promise<TeamInsights> =>
    isRealApi()
      ? http.get("/insights/team")
      : mockDb.getTeamInsights(),
};
