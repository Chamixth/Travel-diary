# ADR 0003: Structured agents retain explicit deterministic fallbacks

Status: accepted

## Context

Travel photographs are private, model calls can fail, and a malformed creative artifact must never replace a valid user experience. The migration also needs to introduce separate agents without making existing generation depend on all of them at once.

## Decision

Each model-backed stage uses `provider.StructuredGenerator`, a source-controlled prompt version, an OpenAI-compatible strict output schema, and domain reference validation. Inputs are projected to the evidence the agent needs and exclude ownership and storage identifiers.

During rollout, a stage may retain a deterministic evidence-only implementation. If model generation or validation fails, the worker records a structured fallback event and persists provenance containing the deterministic provider and a bounded fallback reason. It does not persist malformed model output or silently label fallback work as AI-generated.

Artifacts are immutable per source revision and generator version. A later prompt version can therefore create a new artifact without overwriting the last usable result.

## Consequences

- Existing generation remains available during staged rollout.
- Provider failures and malformed output remain observable.
- Prompts and generators can be evaluated or rolled back independently.
- The fallback is intentionally less creative and must not become the permanent primary path.
