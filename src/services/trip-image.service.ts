/**
 * Trip image backend API client. Server-only.
 *
 * Upload is not here — the browser uploads bytes directly to S3 via
 * presigned URLs (see `src/services/trip-image-upload.ts`), so this backend
 * is never on the data path for file bytes. This module only covers listing
 * and deleting images, which are small JSON/DELETE calls.
 */
import type { RawTripImageCollection, TripImage } from "@/interface/trip-image";
import { normalizeTripImageCollection } from "@/interface/trip-image";

import { apiRequest } from "./http.server";

function imagesPath(tripId: string): string {
  return `/api/v1/trips/${encodeURIComponent(tripId)}/images`;
}

function imagePath(tripId: string, imageId: string): string {
  return `${imagesPath(tripId)}/${encodeURIComponent(imageId)}`;
}

export async function listTripImages(token: string, tripId: string): Promise<TripImage[]> {
  const data = await apiRequest<RawTripImageCollection>(imagesPath(tripId), { token });
  return normalizeTripImageCollection(data?.uploaded);
}

export async function deleteTripImage(
  token: string,
  tripId: string,
  imageId: string,
): Promise<void> {
  await apiRequest(imagePath(tripId, imageId), { method: "DELETE", token });
}
