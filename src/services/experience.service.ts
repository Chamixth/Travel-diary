import { apiRequest } from "./http.server";

function experiencePath(tripId: string): string {
  return `/api/v1/trips/${encodeURIComponent(tripId)}/experience`;
}

// Parse at the runtime boundary, where the full Zod contract is available.
// Keeping this response unknown prevents an unvalidated server payload from
// masquerading as a renderable ExperienceSpec.
export async function getExperience(token: string, tripId: string): Promise<string> {
  return JSON.stringify(await apiRequest<unknown>(experiencePath(tripId), { token }));
}
