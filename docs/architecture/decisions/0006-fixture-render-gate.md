# ADR 0006: Gate the experience runtime with synthetic browser fixtures

## Status

Accepted

## Context

Schema-valid ExperienceSpec JSON does not prove that an album renders. Layout
overflow, broken assets, animation failures, inaccessible navigation, and weak
mobile fallbacks only become visible in a browser. Running live AI generation
for every runtime change would be slow, costly, and nondeterministic, while
using personal photographs would create fixture privacy concerns.

## Decision

Six synthetic experience specifications exercise distinct creative metaphors
and primitive combinations through a development-only fixture route. A
Playwright gate renders every fixture in Chromium and checks page and console
errors, image decoding, document overflow, keyboard navigation, mobile layout
substitution, and reduced-motion fallback behavior. Successful runs capture
JPEG review artifacts in the ignored Playwright output directory.

The fixture route is available automatically in development. Production
builds require the explicit `VITE_ENABLE_EXPERIENCE_FIXTURES=true` flag before
the route will serve content.

## Consequences

- Runtime regressions can be reproduced without AI calls or user data.
- Layout and asset failures block changes even when schemas still validate.
- Captures are available for human or future vision-critic review.
- Pixel-level snapshot approval remains optional until visual baselines are
  stable enough to avoid noisy failures from font and rendering differences.
