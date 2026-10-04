export interface AccessTokenMetadata {
  issuedAt: number | null;
  expiresAt: number;
}

/**
 * Read the timing claims from a JWT without treating them as authentication.
 * The Go API still verifies the signature, issuer, and audience. This metadata
 * only prevents the BFF from forwarding a token that is already stale.
 */
export function readAccessTokenMetadata(token: string): AccessTokenMetadata | null {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as {
      exp?: unknown;
      iat?: unknown;
    };
    if (!isPositiveInteger(payload.exp)) return null;

    return {
      issuedAt: isPositiveInteger(payload.iat) ? payload.iat * 1_000 : null,
      expiresAt: payload.exp * 1_000,
    };
  } catch {
    return null;
  }
}

export function accessTokenNeedsRefresh(
  expiresAt: number,
  now = Date.now(),
  minimumValidityMs = 30_000,
): boolean {
  return !Number.isFinite(expiresAt) || expiresAt <= now + minimumValidityMs;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
