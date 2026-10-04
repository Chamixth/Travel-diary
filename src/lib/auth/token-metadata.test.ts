import { describe, expect, it } from "vitest";

import { accessTokenNeedsRefresh, readAccessTokenMetadata } from "./token-metadata";

function tokenWithPayload(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}

describe("readAccessTokenMetadata", () => {
  it("converts JWT timing claims to epoch milliseconds", () => {
    expect(
      readAccessTokenMetadata(tokenWithPayload({ iat: 1_700_000_000, exp: 1_700_003_600 })),
    ).toEqual({
      issuedAt: 1_700_000_000_000,
      expiresAt: 1_700_003_600_000,
    });
  });

  it("accepts a missing issued-at claim", () => {
    expect(readAccessTokenMetadata(tokenWithPayload({ exp: 1_700_003_600 }))).toEqual({
      issuedAt: null,
      expiresAt: 1_700_003_600_000,
    });
  });

  it("rejects malformed tokens and unusable expiry claims", () => {
    expect(readAccessTokenMetadata("opaque-token")).toBeNull();
    expect(readAccessTokenMetadata("header.not-json.signature")).toBeNull();
    expect(readAccessTokenMetadata(tokenWithPayload({ exp: "tomorrow" }))).toBeNull();
    expect(readAccessTokenMetadata(tokenWithPayload({ exp: -1 }))).toBeNull();
  });
});

describe("accessTokenNeedsRefresh", () => {
  it("reserves a safety window for work about to start", () => {
    const now = 1_700_000_000_000;

    expect(accessTokenNeedsRefresh(now + 29_999, now)).toBe(true);
    expect(accessTokenNeedsRefresh(now + 30_000, now)).toBe(true);
    expect(accessTokenNeedsRefresh(now + 30_001, now)).toBe(false);
  });
});
