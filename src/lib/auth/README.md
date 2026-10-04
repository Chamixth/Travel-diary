# Auth

BFF-style auth against the backend at `API_URL` (`/api/v1/auth/*`).

## How it fits together

```
interface/auth.ts        types + ApiError (shared)
services/
  env.server.ts          reads API_URL / SESSION_SECRET (server-only)
  http.server.ts         JSON fetch wrapper → normalises errors to ApiError
  session.server.ts      sealed (AES-encrypted, httpOnly) cookie holding the token pair
  auth.functions.ts      createServerFn RPC boundary the client calls
lib/auth/
  guards.ts              requireAuth / requireGuest for route beforeLoad
  use-auth.ts            client hook: user + login/register/logout
  use-current-user.ts    reads user from root route context
  google.ts              builds the public Google redirect URL
components/auth/
  Auth0Provider.tsx      Auth0 SPA provider and refresh-token setup
routes/auth.auth0.callback.tsx
                          Auth0 callback → sealed app session
```

## Token handling

Auth0's SPA SDK holds its rotating refresh token and current access token in
browser storage. The callback also copies the current access token into an
encrypted, signed, `httpOnly`, `SameSite=Lax` application session cookie
(`voyaloom_session`) so TanStack server functions and route guards can operate.

Browser API calls send the freshest Auth0 access token. The same-origin API
proxy forwards that token when present and falls back to the sealed session for
server-originated requests. The Go API validates either token against Auth0 on
every protected call. Application code must never treat the frontend user or
sealed session as authorization by itself.

The server derives `iat` and `exp` timing metadata from each Auth0 JWT when it
seals the session. It rejects tokens that are expired or within 30 seconds of
expiry before starting a backend request. Whenever the Auth0 SDK rotates the
browser token, `Auth0TokenBridge` synchronizes that token into the sealed
session once, keeping server functions current without an extra request on
every API call. JWT metadata is only a freshness hint; the Go API remains the
authority that verifies the signature, issuer, and audience.

The current user is resolved once per navigation in `routes/__root.tsx`
`beforeLoad` and placed on route context. Call `router.invalidate()` after any
auth mutation to re-sync guards and `useCurrentUser`.

## Config

Set in `.env` (see `.env.example`):

- `VITE_API_URL` – public, used only for the Google full-page redirect.
- `API_URL` – server-only backend base URL (defaults to `VITE_API_URL`).
- `SESSION_SECRET` – ≥32 chars, encrypts the session cookie. `openssl rand -hex 32`.

## Auth0

The login and signup pages use Auth0 Universal Login. Auth0 returns an access
token for `VITE_AUTH0_AUDIENCE`; the callback sends that token through a
same-origin server function, where it is stored in the sealed session cookie.
Protected server functions then forward it as:

```http
Authorization: Bearer <Auth0 access token>
```

The backend must validate the token on every protected endpoint using the Auth0
tenant's JWKS, issuer (`https://<domain>/`), and configured API audience. It
must also enforce scopes/permissions for each operation. A frontend session or
user object must never be treated as proof of authorization.

Required Auth0 application settings:

- Allowed Callback URLs: `http://localhost:8080/auth/auth0/callback` and the production equivalent.
- Allowed Logout URLs: the local and production app origins.
- Allowed Web Origins: the local and production app origins.
- Enable whichever Auth0 connections and authentication methods you want to expose in Universal Login.

Required environment variables are listed in `.env.example`:

- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE` (must match the backend API identifier)
- `VITE_AUTH0_REDIRECT_URI`

The backend also needs to accept Auth0 JWTs on `/api/v1/trips`, album/image,
pricing, and analysis endpoints. Local username/password and custom Google
authentication endpoints are no longer used by this application.
