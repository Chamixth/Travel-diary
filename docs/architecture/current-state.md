# Travel Diary current state

Last audited: 2026-09-21

## Repository map

Travel Diary is split across two Git repositories in the same workspace:

- `Travel-diary`: React 19 and TypeScript application built with TanStack Start, TanStack Router, Tailwind CSS, Framer Motion, and Auth0.
- `Travel-diary-backend`: Go modular monolith using Fiber, MongoDB, S3-compatible storage, and OpenAI-compatible chat-completion requests.

There is no checked-in container, infrastructure, or CI configuration. The frontend README points to Lovable and assumes a Node deployment. Backend deployment requirements must currently be inferred from configuration and native dependencies (`heif-convert` for HEIC ingestion).

## Current request and data flow

```text
Auth0 Universal Login
  -> Auth0 SPA token in browser storage
  -> sealed TanStack Start session cookie
  -> frontend server functions / browser API proxy
  -> Fiber Auth0 middleware

Create trip
  -> trips collection

Request presigned upload
  -> browser PUT to S3
  -> confirm client-provided object key
  -> trip_images record + thumbnail goroutine
  -> in-memory image-analysis queue
  -> OpenAI vision request
  -> trip_image_analyses record

Generate album
  -> idempotent persisted generation job
  -> leased background worker
  -> deterministic JourneySpec reconstruction
  -> evidence-only StorySpec fallback with explicit emotional arc
     (or strict model-backed Story Director when the rollout flag is enabled)
  -> 3–7 distinct CreativeExploration concepts with anti-template fingerprint input
  -> selected, validated ExperienceDNA + normalized fingerprint
  -> native ExperienceSpec planning using registered primitives
  -> validated immutable ExperienceSpec version with planner provenance
  -> registry runtime, with AlbumFilm as a deployment fallback
```

Jobs without usable story and direction artifacts retain the legacy planning and adapter path. Existing `album_plans` also remain readable, but native creative-pipeline jobs no longer depend on the combined legacy prompt.

## Existing domain model

MongoDB currently stores users, sessions, pricing plans, trips, trip images, per-image analyses, and album plans. Image analysis is correctly separated from the source image and carries model, analysis-version, and prompt-version metadata. Album plans do not have a schema version, generator version, history, or status.

The current album contract is a title, subtitle, tone, quotes, chapters, and one of thirteen fixed block types. It is useful as a legacy editorial-plan format, but it cannot express a trip-specific interaction metaphor, responsive choreography, accessibility fallback, motion language, navigation concept, visual fingerprint, or advanced effects.

## Media ingestion

Useful existing behavior to retain:

- direct browser-to-S3 uploads with short-lived presigned PUT URLs;
- authoritative size and MIME checks after upload;
- a 15 MB image limit;
- JPEG, PNG, GIF, HEIC, and HEIF support;
- HEIC normalization to JPEG when `heif-convert` is installed;
- dimension and partial EXIF extraction;
- private-object GET URLs signed on read;
- 480 px JPEG thumbnails;
- bounded thumbnail work inside an individual service instance.

Missing capabilities include upload reservations, object-key ownership verification, GPS extraction, orientation normalization, dominant colors, perceptual hashes, duplicate detection, analysis-sized and fullscreen derivatives, image-bomb safeguards, derivative metadata, and cache/version tracking. Thumbnail workers and deduplication are recreated per HTTP request, so their limits are not process-wide.

## AI and album generation

The code has an `ImageAnalyzer` interface, but provider HTTP details, prompts, schemas, retry logic, and application behavior otherwise live together in `internal/ai/image_analysis.go`. The album-planning prompt performs journey reconstruction, story direction, creative decisions, copywriting, layout selection, and validation in one request. Prompt text is embedded in Go functions rather than stored as independently versioned prompt assets.

Structured-output schemas are sent to the model, and album plans receive additional server-side validation. That is a strong reusable base. Model requests do not consistently capture usage, cost, latency, request IDs, or structured failure classifications.

The image-analysis queue is process-local. A restart loses queued work while MongoDB can retain `QUEUED` or `PROCESSING` states. Album generation now has durable jobs, atomic leases, stage history, source-revision idempotency, and immutable experience versions. It still needs heartbeats, bounded retry classes, graceful shutdown, and replacement of the legacy combined planning prompt.

## Frontend experience

The frontend has polished reusable visual components and a responsive album renderer. Its current visual language is intentionally cinematic but globally fixed: dark blue, gold, serif display type, fades, full-bleed images, grids, film strips, and similar chapter composition for every trip. The generated data selects blocks; it does not establish a unique experience system.

The legacy renderer remains split into album components with fixed block dispatch. The new album-experience runtime validates `ExperienceSpec` at the network boundary, resolves scenes/motion/effects through registries, provides capability tiers and accessible unknown-entry fallbacks, and renders adapted legacy albums. Scene prefetching, effect cleanup contracts for advanced effects, and automated browser review remain outstanding.

The processing and album screens start a persisted generation job and poll its truthful stage label. Product-facing copy maps directly from those backend stages.

## Authentication, privacy, and security

Protected backend resources consistently derive the user ID from validated Auth0 claims and most DAO queries include that user ID. Albums are private because their routes require authentication and S3 objects use signed URLs.

Priority security findings at the start of the audit:

1. Upload completion accepts a client-provided S3 key without proving that the current user received that key from a presign operation. A known key can be attached to another owned trip and later viewed or deleted.
2. Production browser retries can obtain a fresh Auth0 token, while the same-origin proxy still forwards the older token from the sealed session cookie.
3. Pricing-plan changes and advertised quotas are not backed by billing authorization or server-side enforcement.
4. Original deletion does not remove thumbnail objects.
5. There is no rate limiting or generation-abuse control.
6. OCR/photo text is not explicitly delimited as untrusted data for later prompts.

The first foundation slice has remediated findings 1, 2, 4, and 6 with single-use upload reservations, fresh-token forwarding, derivative deletion, and a versioned Memory Analyst prompt. The remaining findings stay on the implementation plan.

## Errors, logs, and observability

The frontend normalizes API errors and the backend has recovery and request logging middleware. AI and analysis workers emit plain-text logs. There is no job/correlation ID propagated through the system, no structured stage metrics, no token/cost collection, and no client render-error or Web Vitals ingestion.

## Tests and developer workflow

The backend compiles with `go test ./...`, but there were no test files at the start of this audit. The frontend had no installed dependencies in the audited checkout and no `test` or `typecheck` script. No end-to-end or visual-regression setup exists. The root frontend README describes the original design prompt rather than the current architecture or full local setup.

## Keep, evolve, replace

Keep the authenticated modular monolith, MongoDB, direct S3 upload, private signed media, separate image-analysis documents, strict model-output schemas, album-plan validation, deterministic fallback, React/TanStack stack, Framer Motion for component motion, and the strongest current visual components.

Evolve media records into versioned assets and derivatives; analysis into a richer versioned Memory Analyst result; synchronous work into durable jobs; the current plan into StorySpec, ExperienceDNA, and ExperienceSpec; and fixed block rendering into typed registries.

Replace the combined album-planning prompt, process-local-only queues, unversioned generated JSON, client-asserted upload completion, fixed global art direction, and silent handling of unsupported generated primitives.
