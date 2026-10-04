/**
 * Auth domain types shared across the app.
 *
 * These describe the contract with the backend auth API (`/api/v1/auth/*`) and
 * the shape of the data the client is allowed to see. Tokens never appear in
 * any client-facing type on purpose — they live only inside the encrypted
 * session cookie handled by the server (see `src/services/session.server.ts`).
 */

/** A user as exposed to the browser. Never carries tokens. */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: AuthProvider;
}

export type AuthProvider = "local" | "google";

/** Access + refresh pair returned by the backend. Server-side only. */
export interface AuthTokens {
  accessToken: string;
  /** Local auth may provide this; Auth0 refresh is managed by the browser SDK. */
  refreshToken?: string;
  /** Timing metadata is derived from the JWT and is never used to authenticate it. */
  accessTokenIssuedAt: number | null;
  accessTokenExpiresAt: number;
  accessTokenSyncedAt: number;
}

/** Token material accepted when creating or refreshing a sealed session. */
export interface AuthTokenInput {
  accessToken: string;
  refreshToken?: string;
}

/** What we persist inside the sealed session cookie. Server-side only. */
export interface SessionPayload {
  user: User;
  tokens: AuthTokens;
  sessionCreatedAt: number;
  sessionExpiresAt: number;
}

/* ------------------------------------------------------------------ */
/* Request payloads                                                     */
/* ------------------------------------------------------------------ */

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface GoogleCallbackInput {
  code: string;
  state: string;
}

/* ------------------------------------------------------------------ */
/* Backend response shapes (defensive — the API is not fully typed)     */
/* ------------------------------------------------------------------ */

/** Raw user object as it may arrive from the backend. */
export interface RawUser {
  id?: string | number;
  _id?: string | number;
  userId?: string | number;
  username?: string;
  email?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string;
  avatar?: string;
  picture?: string;
  provider?: string;
}

/**
 * Raw auth response. Different endpoints nest things differently, so every
 * field is optional and normalised by `normalizeAuthResponse`.
 */
export interface RawAuthResponse {
  user?: RawUser;
  data?: { user?: RawUser; tokens?: RawTokens } & RawTokens;
  tokens?: RawTokens;
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  accessTokenExpiresAt?: string | number;
}

export interface RawTokens {
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  accessTokenExpiresAt?: string | number;
}

/** Normalised successful auth result. Server-side only. */
export interface AuthResult {
  user: User;
  tokens: AuthTokenInput;
}

export interface HealthStatus {
  ok: boolean;
  detail: string;
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

/**
 * Normalised error for anything that goes wrong talking to the auth API.
 * `status` is 0 for network / transport failures.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Plain, serialisable error shape sent to the client from server functions. */
export interface AuthErrorShape {
  message: string;
  status: number;
}
