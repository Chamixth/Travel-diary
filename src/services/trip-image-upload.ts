/**
 * Browser-side trip image upload. File bytes never touch our backend:
 *
 *   1. POST .../images/presign  — ask for one presigned S3 PUT URL per file.
 *   2. PUT each file directly to S3, in parallel, with real progress events.
 *   3. POST .../images/complete — tell the backend which objects landed, so
 *      it can verify them against S3, record them, and queue analysis.
 *
 * A failure at any step is reported per-file rather than aborting the whole
 * batch, so a caller can retry just the ones that didn't make it.
 *
 * Every file is correlated by a caller-supplied `clientId` (and, once
 * presigned, by its S3 key) rather than by file name — two different files
 * in one batch can share a name, and the whole point of this module is to
 * never lose track of which bytes belong to which upload.
 */
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  normalizeTripImage,
  type FailedImageUpload,
  type RawCompleteImagesResponse,
  type RawPresignImagesResponse,
  type TripImage,
} from "@/interface/trip-image";
import { browserApiRequest } from "@/services/browser-api";

const acceptedTypes = new Set<string>(ACCEPTED_IMAGE_TYPES);

export interface UploadableFile {
  /** Caller-chosen unique id (e.g. an object URL already in hand) used to report progress/results back for this exact file. */
  clientId: string;
  file: File;
}

export interface UploadProgressEvent {
  clientId: string;
  fileName: string;
  loaded: number;
  total: number;
}

export interface UploadTripImagesOptions {
  /** Byte-level progress as each file streams to S3. */
  onProgress?: (progress: UploadProgressEvent) => void;
  /** Files PUT to S3 concurrently. S3 takes parallel writes fine — this just paces the client's own uplink. */
  concurrency?: number;
}

export interface UploadedTripImage {
  clientId: string;
  image: TripImage;
}

export interface TripImageUploadRunResult {
  uploaded: UploadedTripImage[];
  failed: FailedImageUpload[];
}

export async function uploadTripImages(
  tripId: string,
  files: UploadableFile[],
  options: UploadTripImagesOptions = {},
): Promise<TripImageUploadRunResult> {
  const failed: FailedImageUpload[] = [];
  const candidates = files.filter(({ file }) => file.size > 0);

  for (const { clientId, file } of candidates) {
    if (file.size > MAX_IMAGE_BYTES) {
      failed.push({ clientId, fileName: file.name, error: `"${file.name}" is larger than 15 MB.` });
    } else if (file.type && !acceptedTypes.has(file.type)) {
      failed.push({
        clientId,
        fileName: file.name,
        error: `"${file.name}" isn't a supported image type (JPEG, PNG, GIF, or HEIC).`,
      });
    }
  }
  const rejectedIds = new Set(failed.map((entry) => entry.clientId));
  const toUpload = candidates.filter(({ clientId }) => !rejectedIds.has(clientId));
  if (toUpload.length === 0) return { uploaded: [], failed };

  const presignResponse = await browserApiRequest<RawPresignImagesResponse>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/images/presign`,
    {
      method: "POST",
      body: {
        files: toUpload.map(({ clientId, file }) => ({
          clientId,
          fileName: file.name,
          contentType: file.type,
        })),
      },
    },
  );
  failed.push(...(presignResponse.failed ?? []));

  const presigned = presignResponse.uploads ?? [];
  const fileByClientId = new Map(toUpload.map(({ clientId, file }) => [clientId, file]));
  const landed: Array<{ clientId: string; fileName: string; s3Key: string }> = [];

  let cursor = 0;
  async function worker() {
    while (cursor < presigned.length) {
      const upload = presigned[cursor++];
      const file = fileByClientId.get(upload.clientId);
      if (!file) continue;
      try {
        await putFileToS3(upload.uploadUrl, file, upload.contentType, (loaded, total) =>
          options.onProgress?.({
            clientId: upload.clientId,
            fileName: upload.fileName,
            loaded,
            total,
          }),
        );
        landed.push({ clientId: upload.clientId, fileName: upload.fileName, s3Key: upload.s3Key });
      } catch {
        failed.push({
          clientId: upload.clientId,
          fileName: upload.fileName,
          s3Key: upload.s3Key,
          error: "Could not upload to storage.",
        });
      }
    }
  }
  const concurrency = Math.max(1, options.concurrency ?? 4);
  await Promise.all(Array.from({ length: Math.min(concurrency, presigned.length) }, worker));

  if (landed.length === 0) return { uploaded: [], failed };

  const completeResponse = await browserApiRequest<RawCompleteImagesResponse>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/images/complete`,
    {
      method: "POST",
      body: {
        images: landed.map(({ clientId, fileName, s3Key }) => ({ clientId, s3Key, fileName })),
      },
    },
  );
  failed.push(...(completeResponse.failed ?? []));

  const clientIdByS3Key = new Map(landed.map(({ s3Key, clientId }) => [s3Key, clientId]));
  const uploaded: UploadedTripImage[] = (completeResponse.uploaded ?? []).map((raw) => {
    const image = normalizeTripImage(raw);
    return { clientId: clientIdByS3Key.get(image.s3Key) ?? "", image };
  });

  return { uploaded, failed };
}

/** XMLHttpRequest, not fetch, because fetch has no upload-progress event. */
function putFileToS3(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType || file.type || "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error during S3 upload."));
    xhr.send(file);
  });
}
