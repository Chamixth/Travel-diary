# Incremental implementation plan

This plan is tied to the audited repositories and keeps legacy albums readable throughout the migration.

## Completed foundation slice

- Added current and target architecture records.
- Added persisted, leased `generation_jobs` in `Travel-diary-backend/internal/generation` and authenticated start/status endpoints.
- Kept `POST /album/generate` for compatibility while moving the active frontend flow to job polling.
- Added a provider-neutral structured AI contract in `internal/ai/provider`.
- Moved the Memory Analyst prompt into a versioned embedded asset and made OCR/photo text explicitly untrusted.
- Added backend ExperienceSpec v1 types, primitive-reference validation, asset-reference validation, and unit tests.
- Added the frontend `album-experience` domain with strict Zod parsing, registries, accessible unknown-entry fallbacks, capability tiers, three initial scenes, three motion primitives, and three effects.
- Added expiring single-use upload reservations so upload completion cannot claim arbitrary S3 keys.
- Added frontend test/typecheck commands and backend/frontend setup documentation.
- Added the canonical ExperienceSpec v1 JSON Schema plus a checked frontend mirror and drift command.
- Added immutable `experience_versions`, atomic active pointers in `experience_heads`, and cleanup on trip deletion.
- Added a validated `AlbumPlan -> ExperienceSpec` compatibility adapter and made generation jobs materialize the runtime contract before `render_ready`.
- Connected the authenticated album route to the ExperienceSpec runtime with strict parsing and a legacy renderer fallback.
- Added a truthful `story_building` job stage with an evidence-only, validated StorySpec baseline persisted immutably by source revision. This is the deterministic fallback seam for the model-backed Story Director.
- Added owned version-list and activation endpoints so a prior immutable experience can be restored without rewriting it.
- Added the first model-backed pipeline agent: Story Director now uses `StructuredGenerator`, a strict StorySpec JSON Schema, privacy-reduced inputs, semantic reference validation, and persisted provider/model/token/latency provenance. Rollout is feature-gated and malformed output produces an explicit recorded fallback.
- Added Creative Explorer as a durable `concept_exploration` stage. It generates 3–7 schema-validated directions from story, journey, photographic evidence, and prior fingerprints; persists immutable provenance; rejects repeated overall concepts; and retains three deliberately distinct deterministic fallbacks.
- Added Creative Director as a separate `creative_direction` stage. It selects an exact explored concept, refines it into schema-validated ExperienceDNA, requires a concrete memorable-moment answer, validates signature assets, persists provider provenance, and writes the selected normalized fingerprint to anti-template history. A validated deterministic direction keeps the migration path runnable without model access.
- Added Experience Planner through `StructuredGenerator` with a strict AI schema and the same server-side primitive registry used by validation. Native plans cover every story chapter, include deliberate mobile rules and reduced-motion fallbacks, place the signature asset in its memorable scene, and persist as immutable active ExperienceSpec versions with provenance. The deterministic planner provides the same contract when model generation is disabled or malformed. New creative-pipeline jobs bypass the legacy combined prompt.
- Hardened generation execution with renewable worker leases, bounded stage-resuming retries, explicit transient/permanent failure classes, exhausted-lease cleanup, truthful retry metadata, and SIGINT/SIGTERM shutdown that stops claims before draining or releasing active work.
- Added explicit sealed-session and access-token timing metadata. Server-originated calls reject stale tokens before contacting the API, while each Auth0 browser-token rotation is synchronized once into the sealed session.
- Expanded the v1 runtime to nine scene layouts, ten motion behaviors, eight transitions, eight effects, and eleven approved typography personalities. Transitions now render at scene boundaries, deterministic plans vary composition by creative metaphor, and fixtures exercise deliberate mobile alternatives.
- Added a fixture-backed Playwright render gate for all six synthetic experiences. It captures desktop/mobile output and fails on page errors, console errors, broken images, document overflow, inaccessible navigation, or a missing reduced-motion fallback.
- Added a compatibility `media_assets` collection keyed to existing `trip_images`. New uploads persist versioned orientation, capture/GPS metadata, exact and perceptual hashes, dominant colors, bounded quality signals, and derivative references without changing the legacy image contract.
- Added an additive, schema-versioned `MemoryAnalysis` object to image analysis. It captures description, objects, OCR text, colors, visual importance, photographic quality, storytelling value, candidate roles, and confidence while preserving all legacy analysis fields and album behavior.
- Enriched JourneySpec reconstruction with media-backed duplicate detection, perceptual-hash similarity, GPS distance evidence, and stronger chronology boundaries. Generation now loads `media_assets` before building the journey.
- Added a bounded authenticated media backfill endpoint (`POST /api/v1/trips/:id/media/backfill`). It is idempotent, capped at 50 assets per call, isolates per-file failures, and reports remaining work for resumable clients.

## Next: media intelligence

1. Add background scheduling/observability around the backfill endpoint so historical assets can be migrated without user-triggered calls.
2. Feed MemoryAnalysis candidate roles and confidence directly into Story Director and Creative Director ranking.

## Phase 3: experience engine

Complete the first production vocabulary with image-aware palette resolution, measured scene prefetching, and any additional primitive justified by fixture review. Keep the current responsive alternatives and reduced-motion variants as required contracts.

## Phase 4: render and critique loop

Persist deterministic Playwright render results against generation jobs, then add a vision-capable Creative Critic whose feedback can request a bounded scene or direction regeneration.

## Phase 5: optional advanced rendering

Introduce Canvas/WebGL only through dynamically loaded Tier C effect entries with Tier A fallbacks, explicit cleanup, measured budgets, and reviewed effect metadata. Do not accept arbitrary generated JavaScript.
