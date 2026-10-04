import type { GenerationJob } from "@/interface/generation";
import { apiRequest } from "./http.server";

function jobsPath(tripId: string): string {
  return `/api/v1/trips/${encodeURIComponent(tripId)}/generation-jobs`;
}

export function startGeneration(token: string, tripId: string): Promise<GenerationJob> {
  return apiRequest<GenerationJob>(jobsPath(tripId), { method: "POST", token });
}

export function getGenerationJob(
  token: string,
  tripId: string,
  jobId: string,
): Promise<GenerationJob> {
  return apiRequest<GenerationJob>(`${jobsPath(tripId)}/${encodeURIComponent(jobId)}`, { token });
}
