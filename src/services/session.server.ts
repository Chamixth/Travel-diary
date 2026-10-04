/**
 * Session management. Server-only.
 *
 * The Auth0 access token never reaches application JavaScript after the
 * callback. It is stored with the user record inside an AES-encrypted,
 * signed, httpOnly cookie
 * ("sealed session") managed by TanStack Start's `useSession`.
 *
 * The browser only ever sees the opaque sealed blob; JS on the page cannot
 * read it (httpOnly), and it cannot be tampered with (signed).
 */
import { useSession } from "@tanstack/react-start/server";

import {
  ApiError,
  type AuthResult,
  type AuthTokens,
  type SessionPayload,
  type User,
} from "@/interface/auth";
import { accessTokenNeedsRefresh, readAccessTokenMetadata } from "@/lib/auth/token-metadata";

import { getAuthEnv } from "./env.server";

const SESSION_NAME = "voyaloom_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1_000;
function authSession() {
  const { sessionSecret, isProduction } = getAuthEnv();
  // `useSession` is TanStack Start's server-side request helper, not a React
  // hook — the naming just collides with the rules-of-hooks lint.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSession<SessionPayload>({
    name: SESSION_NAME,
    password: sessionSecret,
    maxAge: SESSION_MAX_AGE,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    },
  });
}

/** Persist a fresh login/registration result in the session cookie. */
export async function createSession(result: AuthResult): Promise<void> {
  const now = Date.now();
  const metadata = readAccessTokenMetadata(result.tokens.accessToken);
  if (!metadata || accessTokenNeedsRefresh(metadata.expiresAt, now)) {
    throw new ApiError("The access token is expired or has no usable expiry.", 401, {
      code: "session_token_expired",
    });
  }

  const session = await authSession();
  const existingCreatedAt = session.data?.sessionCreatedAt;
  await session.update({
    user: result.user,
    tokens: {
      ...result.tokens,
      accessTokenIssuedAt: metadata.issuedAt,
      accessTokenExpiresAt: metadata.expiresAt,
      accessTokenSyncedAt: now,
    },
    sessionCreatedAt:
      typeof existingCreatedAt === "number" && existingCreatedAt > 0 ? existingCreatedAt : now,
    sessionExpiresAt: now + SESSION_MAX_AGE_MS,
  });
}

/** Destroy the session cookie. */
export async function destroySession(): Promise<void> {
  const session = await authSession();
  await session.clear();
}

/**
 * Return the Auth0-signed-in user, or `null`.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const session = await authSession();
  const payload = session.data;

  if (
    !payload?.user ||
    !payload.tokens?.accessToken ||
    (typeof payload.sessionExpiresAt === "number" && payload.sessionExpiresAt <= Date.now())
  ) {
    return null;
  }

  return payload.user;
}

/**
 * Return a currently-valid backend access token for the signed-in user, or
 * throw. Use this from server functions that need to call the backend on the
 * user's behalf.
 */
export async function requireAccessToken(): Promise<string> {
  const session = await authSession();
  const payload = session.data;

  if (!payload?.tokens?.accessToken) {
    throw new ApiError("Not authenticated.", 401);
  }

  if (typeof payload.sessionExpiresAt === "number" && payload.sessionExpiresAt <= Date.now()) {
    throw new ApiError("Your session has expired. Please sign in again.", 401, {
      code: "session_expired",
    });
  }

  // Older sealed sessions did not persist timing metadata. Reading exp from
  // their JWT gives them a safe migration path without accepting stale tokens.
  const expiresAt =
    payload.tokens.accessTokenExpiresAt ??
    readAccessTokenMetadata(payload.tokens.accessToken)?.expiresAt ??
    Number.NaN;
  if (accessTokenNeedsRefresh(expiresAt)) {
    throw new ApiError("Your access token needs to be refreshed.", 401, {
      code: "session_token_expired",
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    });
  }

  return payload.tokens.accessToken;
}
