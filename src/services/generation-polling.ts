import type { GenerationJob } from "@/interface/generation";
import { getGenerationJobFn, startGenerationFn } from "./generation.functions";

const POLL_INTERVAL_MS = 1_500;
const GENERATION_TIMEOUT_MS = 5 * 60_000;

export async function generateExperience(
  tripId: string,
  onProgress: (job: GenerationJob) => void,
): Promise<GenerationJob> {
  let job = await startGenerationFn({ data: { tripId } });
  onProgress(job);
  const deadline = Date.now() + GENERATION_TIMEOUT_MS;

  while (job.status === "queued" || job.status === "running") {
    if (Date.now() >= deadline) {
      throw new Error(
        "This experience is taking longer than expected. You can return to it later.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    job = await getGenerationJobFn({ data: { tripId, jobId: job.id } });
    onProgress(job);
  }

  if (job.status === "failed") {
    throw new Error(job.failureMessage || "We couldn't finish this experience yet.");
  }
  return job;
}
