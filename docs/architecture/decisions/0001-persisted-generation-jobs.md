# ADR 0001: Persist generation jobs in MongoDB

Status: accepted

## Context

Album generation was a synchronous request with a three-minute frontend timeout. A disconnect lost the caller's result, there was no durable progress, and process-local work could not be recovered safely.

## Decision

Generation work is represented by a `generation_jobs` document. Starting a job uses a unique active key derived from owner, trip, scope, and source revision. Workers claim queued or lease-expired jobs atomically and record actual stage transitions. The API returns `202 Accepted`; clients poll a user-owned job resource.

The first executor calls the validated legacy album service. This preserves current records and behavior while later agents replace the combined generator behind the job boundary.

## Consequences

HTTP requests are short-lived, duplicate clicks do not duplicate active work, and crashed jobs can be reclaimed. The initial worker still needs heartbeat, retry-policy, and graceful-shutdown improvements before horizontally scaled production use.
