/**
 * Client-callable trip image RPC layer for listing and deleting. Upload
 * lives in `src/services/trip-image-upload.ts` — the browser talks to the
 * backend and S3 directly, since routing file bytes through a server
 * function risks the hosting platform's function payload limit.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { TripImage } from "@/interface/trip-image";

import { requireAccessToken } from "./session.server";
import { toClientError } from "./service-error";
import * as tripImageService from "./trip-image.service";

export const listTripImagesFn = createServerFn({ method: "GET" })
  .validator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data }): Promise<TripImage[]> => {
    try {
      return await tripImageService.listTripImages(await requireAccessToken(), data.tripId);
    } catch (error) {
      toClientError(error);
    }
  });

export const deleteTripImageFn = createServerFn({ method: "POST" })
  .validator(z.object({ tripId: z.string().min(1), imageId: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    try {
      await tripImageService.deleteTripImage(await requireAccessToken(), data.tripId, data.imageId);
      return { ok: true };
    } catch (error) {
      toClientError(error);
    }
  });
