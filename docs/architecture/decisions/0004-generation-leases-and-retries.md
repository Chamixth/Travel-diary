# ADR 0004: Renewable generation leases and bounded retries

## Status

Accepted.

## Context

Story, creative, and experience generation can outlive a fixed worker lease. A process can also stop between immutable stage writes. Without renewal, another instance may claim the same job while the first worker is still running. Treating every database or provider interruption as terminal makes otherwise safe, idempotent stage work unnecessarily fragile.

## Decision

Generation remains in the modular monolith and MongoDB remains the job store. A claimed job has a 90-second ownership lease renewed every 30 seconds. Every stage transition and terminal write checks the worker identity. Losing ownership cancels local execution.

Failures are classified before state changes. Schema, reference, and creative validation failures are permanent. Known persistence, network, timeout, and compatible-provider failures are transient. Transient failures return the same job to its current persisted stage with bounded exponential backoff. Jobs receive at most three attempts by default, configurable from one to ten. An expired lease on the final attempt becomes a terminal `retry_exhausted` failure.

SIGINT and SIGTERM stop new claims first. Active workers may finish during the shutdown window. If the window expires, execution contexts are canceled and owned jobs are returned to the queue without consuming an attempt.

## Consequences

Stages must remain idempotent and immutable artifact writes must continue using create-or-get semantics. The system avoids another queue service at current scale while supporting multiple application instances safely. Retry timing and counts are observable without exposing provider errors to users.
