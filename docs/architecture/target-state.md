# Travel Diary target architecture

## Architectural direction

Travel Diary remains a modular monolith. The Go application owns media, generation, AI orchestration, authorization, and persistence. TanStack Start owns authenticated product UI and a declarative experience runtime. MongoDB remains the system of record and S3-compatible storage remains the media store.

The central design rule is that understanding, creative reasoning, specification, and rendering are different contracts:

```text
media assets
  -> MemoryAnalysis
  -> JourneySpec
  -> StorySpec
  -> CreativeConcept[]
  -> ExperienceDNA
  -> ExperienceSpec
  -> runtime render
  -> RenderReview
  -> targeted refinement
```

Each arrow is independently versioned, validated, observable, and retryable. Models never emit executable application code.

## Backend boundaries

The migration will organize new code around these domains without moving stable code merely to match a folder diagram:

```text
internal/
  media/          upload reservations, metadata, derivatives, hashes
  analysis/       Memory Analyst orchestration and results
  journey/        chronology, similarity, and moment reconstruction
  story/          StorySpec and Story Director
  creative/       concept exploration, selection, fingerprints, critique
  experience/     versioned ExperienceSpec and validation
  generation/     durable jobs, leases, stage transitions, retries
  ai/
    provider/     structured-generation interface and adapters
    prompts/      immutable versioned prompt assets
    schemas/      model-output schemas
  observability/  correlation context, structured events, metrics ports
```

Fiber handlers remain transport adapters. They authenticate, parse, invoke a domain service, and serialize. They do not orchestrate generation stages.

## Persistence

Existing collections remain readable. New collections are introduced incrementally:

- `media_assets`: source object plus media kind and stable ownership.
- `media_derivatives`: purpose, dimensions, format, key, generator version, checksum.
- `media_analyses`: immutable/versioned analysis attempts and active-result pointer.
- `generation_jobs`: current stage, lease, attempts, failure, stage history, correlation ID.
- `stories`: versioned StorySpec documents.
- `creative_explorations`: immutable candidate concepts and the fingerprints considered.
- `creative_directions`: immutable chosen ExperienceDNA with selection provenance.
- `creative_fingerprints`: normalized fingerprints of selected directions for anti-template comparison.
- `experience_versions`: immutable ExperienceSpec versions and review status.
- `experience_heads`: the active version pointer and monotonic version allocator per trip.
- `albums`: future publication visibility and optional share policy; private trip ownership remains authoritative during migration.

The current `trip_images`, `trip_image_analyses`, and `album_plans` collections are migrated lazily. Existing album plans can be adapted into a conservative ExperienceSpec so old albums remain viewable.

## Durable generation lifecycle

Generation starts with an idempotency key scoped to user, trip, requested scope, and source revision. An active matching job is returned instead of duplicated. Workers atomically claim jobs with a lease; expired leases can be reclaimed after a crash.

Supported stages are:

```text
created -> media_processing -> analyzing -> clustering -> story_building
        -> concept_exploration -> creative_direction -> experience_generation
        -> validating -> render_review -> render_ready
```

Stages may be skipped only when their required versioned artifact already exists. Stage history records actual completed work; product text maps from the persisted state and never simulates percentage completion. Retrying creates a new attempt while preserving artifacts from successful idempotent stages.

The first migration slice wraps legacy album generation in this lifecycle without pretending that the combined legacy prompt performed the future stages. Subsequent slices replace that executor one boundary at a time.

## AI provider and prompts

Domain agents depend on a provider-neutral structured-generation port. A request includes agent ID, prompt version, model policy, JSON schema, redacted structured input, timeout, and correlation ID. A response includes validated JSON, provider/model identifiers, latency, usage, and provider request ID when available.

Prompts are immutable source-controlled assets. User-controlled OCR, filenames, captions, and metadata are serialized into clearly delimited data sections and explicitly treated as untrusted content. Prompt upgrades write new artifact versions rather than mutating old output.

Agents remain separate:

1. Memory Analyst understands individual assets.
2. Journey Reconstructor builds moments from evidence.
3. Story Director selects the emotional narrative.
4. Creative Explorer proposes distinct metaphors.
5. Creative Director selects and refines ExperienceDNA.
6. Experience Planner produces ExperienceSpec.
7. Creative Critic produces bounded, actionable feedback.

## ExperienceSpec v1

JSON Schema is the language-neutral source of truth. Go validates before persistence and TypeScript validates at every network/fixture boundary. Every document contains `schemaVersion`, `generatorVersion`, stable IDs, and provenance.

V1 contains:

- ExperienceDNA and its memorable signature moment;
- ordered scenes with registered layout, motion, transition, and effect IDs;
- typed media placements and semantic text;
- palette and approved typography personality;
- navigation behavior;
- desktop/tablet/mobile choreography;
- reduced-motion and semantic fallbacks;
- load priority and prefetch hints;
- global and scene effects with bounded parameters.

Unknown registry keys produce an explicit accessible fallback and a diagnostic event. They never crash the album or disappear silently.

## Frontend runtime

```text
src/features/album-experience/
  runtime/         validation, context, registry resolution, diagnostics
  scenes/          composition primitives
  layouts/         reusable internal layout mechanics
  motion/          Framer and optional GSAP adapters
  effects/         progressively enhanced effects
  transitions/     scene-boundary behavior
  typography/      semantic personalities -> approved font systems
  media/           responsive sources, preload window, decoding
  navigation/      keyboard and concept-specific navigation
  accessibility/   reduced-motion and semantic projections
  schemas/         generated/validated ExperienceSpec contract
  fixtures/        synthetic specifications and analyses
```

Framer Motion continues to own component transitions and gestures. GSAP is introduced only when the initial DOM runtime needs coordinated scroll timelines, pinning, or scrubbing. Both use runtime lifecycle adapters that guarantee cleanup. WebGL is optional Tier C enhancement loaded behind capability, motion-preference, and performance checks.

The initial capability tiers are:

- Tier A: semantic HTML, CSS layouts, responsive images, reduced/basic motion.
- Tier B: richer DOM/SVG effects and coordinated timelines.
- Tier C: dynamically imported Canvas/WebGL enhancement with a Tier A fallback.

## Anti-template behavior

Every published experience stores a normalized fingerprint: interaction metaphor, story structure, scene sequence, typography personality, motion personality, navigation, palette class, image treatment, and signature effect. Creative Exploration receives nearest prior fingerprints and must explain material differences. Similarity is a warning and reasoning input, not an automatic artistic veto.

Primitives stay reusable. Novelty comes from the relationship among story pacing, selected photographs, primitive parameters, motion, typography, navigation, and one deliberate signature moment.

## Privacy and security invariants

- Every domain lookup includes owner or explicit share authorization.
- Upload completion requires a single-use upload reservation bound to user, trip, object key, MIME, size ceiling, and expiry.
- Original and generated media remain private; publishing creates explicit scoped share grants.
- Deletion walks source media, derivatives, analyses, experience versions, and share artifacts.
- Model outputs are data and pass schema plus semantic validation.
- Custom effects are declarative registry references. Future custom modules run in an isolated capability sandbox with no auth, storage, DOM, or network access.
- Rate and cost budgets apply per user and generation stage.

## Quality loop

An experience can become `render_ready` only after data validation, runtime validation, desktop/mobile Playwright renders, console and overflow checks, reduced-motion checks, asset verification, and a creative critique. Screenshot-based vision critique is advisory; deterministic failures block publication.

Refinement targets the owning artifact or scene. Published experience versions are immutable, and activating a new version is atomic so users can undo safely.

## Delivery sequence

1. Foundation: current/target documentation, versioned contracts, durable job state machine, AI provider ports, prompt assets, registry runtime, and tests.
2. Intelligence: richer media analysis, JourneySpec, StorySpec, concept exploration, ExperienceDNA, fingerprints, and staged generation.
3. Engine: eight to twelve high-quality scene primitives, motion/transition libraries, typography systems, responsive choreography, and media prefetching.
4. Visual critic: Playwright capture, deterministic render gates, vision critique, and bounded refinement.
5. Advanced creativity: optional Canvas/WebGL effects and reviewed effect discovery.

Each slice keeps legacy albums readable and the application runnable. New writes move to versioned artifacts only after their reader and migration adapter ship.
