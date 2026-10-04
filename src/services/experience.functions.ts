import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAccessToken } from "./session.server";
import { toClientError } from "./service-error";
import * as experienceService from "./experience.service";

export const getExperienceFn = createServerFn({ method: "GET" })
  .validator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data }): Promise<string> => {
    try {
      return await experienceService.getExperience(await requireAccessToken(), data.tripId);
    } catch (error) {
      toClientError(error);
    }
  });
