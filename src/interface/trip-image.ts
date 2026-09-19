/**
 * Trip image types. Mirrors the backend `dto.TripImage*` contract
 * (`/api/v1/trips/:id/images`). Timestamps are RFC 3339 strings.
 */

export interface TripImage {
  id: string;
  tripId: string;
  userId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  dimensionName: string;
  exif?: ImageEXIF | null;
  s3Key: string;
  s3Url: string;
  /** Small resized JPEG for grid display; falls back to `s3Url` if the backend hasn't generated one yet. */
  thumbnailUrl: string;
  /** RFC 3339 */
  createdAt: string;
  /** RFC 3339 */
  updatedAt: string;
}

export interface ImageEXIF {
  capturedAt?: string;
  timezone?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
}

export interface RawImageEXIF {
  captured_at?: string;
  timezone?: string;
  camera_make?: string;
  camera_model?: string;
  lens_model?: string;
}

/** Raw image object from the backend — every field optional / defensive. */
export interface RawTripImage {
  id?: string;
  tripId?: string;
  userId?: string;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  dimensionName?: string;
  exif?: RawImageEXIF | null;
  s3Key?: string;
  s3Url?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** `{ "uploaded": RawTripImage[] }` — used by the list endpoint. */
export interface RawTripImageCollection {
  uploaded?: RawTripImage[] | null;
}

/**
 * `clientId`/`s3Key` let the frontend correlate a failure back to the right
 * file without relying on `fileName`, which two different files in the same
 * batch could share.
 */
export interface FailedImageUpload {
  fileName: string;
  error: string;
  clientId?: string;
  s3Key?: string;
}

/** Result of a batch upload. */
export interface TripImageUploadResult {
  uploaded: TripImage[];
  failed: FailedImageUpload[];
}

/**
 * Direct-to-S3 upload contract: the backend never sees file bytes. See
 * `src/services/trip-image-upload.ts` for the full presign -> PUT -> complete flow.
 */
export interface PresignedImageUpload {
  clientId: string;
  fileName: string;
  s3Key: string;
  uploadUrl: string;
  contentType: string;
}

export interface RawPresignImagesResponse {
  uploads?: PresignedImageUpload[] | null;
  failed?: FailedImageUpload[] | null;
}

export interface RawCompleteImagesResponse {
  uploaded?: RawTripImage[] | null;
  failed?: FailedImageUpload[] | null;
}

/**
 * Client-side rules for what the backend can decode. HEIC/HEIF (the iPhone
 * camera default) is converted to JPEG server-side on upload — see
 * convertHEICToJPEG in trip_image_service.go.
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;
export const ACCEPTED_IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB per file

/** Pure mapping, safe to call from both server-only code and the browser. */
export function normalizeTripImage(raw: RawTripImage): TripImage {
  return {
    id: String(raw.id ?? ""),
    tripId: String(raw.tripId ?? ""),
    userId: String(raw.userId ?? ""),
    fileName: raw.fileName ?? "",
    contentType: raw.contentType ?? "",
    fileSizeBytes: Number(raw.fileSizeBytes ?? 0),
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    dimensionName: raw.dimensionName ?? "",
    exif: raw.exif
      ? {
          capturedAt: raw.exif.captured_at,
          timezone: raw.exif.timezone,
          cameraMake: raw.exif.camera_make,
          cameraModel: raw.exif.camera_model,
          lensModel: raw.exif.lens_model,
        }
      : null,
    s3Key: raw.s3Key ?? "",
    s3Url: raw.s3Url ?? "",
    thumbnailUrl: raw.thumbnailUrl || raw.s3Url || "",
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

export function normalizeTripImageCollection(raw: RawTripImage[] | null | undefined): TripImage[] {
  return Array.isArray(raw) ? raw.map(normalizeTripImage) : [];
}
