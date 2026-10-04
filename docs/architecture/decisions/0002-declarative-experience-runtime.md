# ADR 0002: Render versioned declarative experiences

Status: accepted

## Context

The legacy album plan chooses from fixed editorial blocks and cannot express a trip-specific interaction system. Executing arbitrary model-generated React or JavaScript would expose authentication, privacy, security, reliability, and migration risks.

## Decision

Models produce a strictly validated, versioned ExperienceSpec. The frontend resolves scene, motion, transition, and effect IDs through explicit registries. Unknown entries use accessible fallbacks and emit diagnostics. Custom behavior remains inside reviewed application primitives; AI controls composition and bounded parameters.

Framer Motion handles component motion. GSAP will be considered only for coordinated scroll timelines. Canvas/WebGL remains an optional dynamically imported capability tier.

## Consequences

The creative vocabulary can grow without making generated data executable. Reusable primitives remain testable, and persisted specifications can be migrated. Novelty must come from story-led composition, parameters, and interaction relationships rather than arbitrary code.
