import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { GenerationJob } from "@/interface/generation";
import { requireAccessToken } from "./session.server";
import { toClientError } from "./service-error";
import * as generationService from "./generation.service";

const tripSchema = z.object({ tripId: z.string().min(1) });
const jobSchema = tripSchema.extend({ jobId: z.string().min(1) });

export const startGenerationFn = createServerFn({ method: "POST" })
  .validator(tripSchema)
  .handler(async ({ data }): Promise<GenerationJob> => {
    try {
      return await generationService.startGeneration(await requireAccessToken(), data.tripId);
    } catch (error) {
      toClientError(error);
    }
  });

export const getGenerationJobFn = createServerFn({ method: "GET" })
  .validator(jobSchema)
  .handler(async ({ data }): Promise<GenerationJob> => {
    try {
      return await generationService.getGenerationJob(
        await requireAccessToken(),
        data.tripId,
        data.jobId,
      );
    } catch (error) {
      toClientError(error);
    }
  });
