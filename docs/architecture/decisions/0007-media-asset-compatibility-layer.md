# ADR 0007: Add a versioned media-asset compatibility layer

## Status

Accepted

## Context

`trip_images` is a stable upload and ownership record used by the existing
album and image APIs. Adding every future extraction field to that document
would make the upload contract large, couple storage changes to AI analysis,
and make model revisions difficult to migrate. The current path already has
the original object and a thumbnail, but richer metadata is not durable.

## Decision

Create a separate `media_assets` collection with one document per image. New
uploads write a versioned metadata snapshot containing display orientation,
capture time, GPS when present, exact SHA-256 content hash, deterministic
perceptual hash, dominant colors, bounded brightness/contrast/sharpness
signals, and original/thumbnail derivative references.

The legacy `trip_images` document remains authoritative for ownership,
upload status, and existing API responses. Metadata extraction is
supplemental: codec or parser failures create a partial/pending asset record
without rejecting a valid upload. Deleting an image or trip removes its media
asset. Older images are eligible for a separately bounded backfill job.

## Consequences

- AI and journey stages can evolve against a stable media contract.
- Exact duplicates and near-duplicates have durable comparison keys.
- Palette and quality data can influence art direction without another image
  provider call.
- Upload completion performs one additional bounded object read for metadata;
  future scale work can move this to a durable media-processing job.
- GPS remains optional and is never synthesized when EXIF does not contain it.
