# ADR 0005: Track sealed-session token freshness explicitly

## Status

Accepted

## Context

Auth0 owns browser token rotation, while TanStack server functions use an
encrypted, HTTP-only session cookie. The cookie previously stored an Auth0
access token without its expiry. A server-originated request could therefore
forward a stale token and discover the problem only after the Go API returned
401. Browser requests already retried with a fresh Auth0 token, but that did
not update the copy used by later server functions.

## Decision

The session records its creation and expiry and stores access-token `iat`,
`exp`, and synchronization timestamps as epoch milliseconds. These timing
claims are decoded from the JWT on the server and are used only to decide
whether a token is fresh enough to forward. The Go API continues to perform
all signature, issuer, audience, and authorization checks.

`requireAccessToken` reserves a 30-second validity window and returns a local
401 for a stale or unreadable token. Existing sealed sessions migrate by
reading `exp` directly from the stored JWT when explicit metadata is absent.

The Auth0 browser bridge synchronizes a token into the sealed session after
initial restoration or rotation. It remembers the last synchronized token so
ordinary API calls do not cause an additional session request.

## Consequences

- Server work does not begin with a token known to expire during the request.
- Browser and server request paths converge on the same rotated Auth0 token.
- An expired sealed token can fail before the Go API is contacted.
- JWT timing claims are freshness hints only and never grant access.
- A browser that cannot restore Auth0 must sign in again; the server does not
  store the Auth0 refresh token.
