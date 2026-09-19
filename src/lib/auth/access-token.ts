type AccessTokenGetter = ((forceRefresh?: boolean) => Promise<string>) | null;

let getAccessToken: AccessTokenGetter = null;

export function setAccessTokenGetter(getter: AccessTokenGetter): void {
  getAccessToken = getter;
}

export async function getBrowserAccessToken(forceRefresh = false): Promise<string> {
  // Auth0 and the dashboard mount together. Give the provider bridge time to
  // register its getter before treating initialization as an auth failure.
  // A hard refresh can require Auth0 to restore its SSO session before the
  // first protected route is mounted.
  for (let attempt = 0; !getAccessToken && attempt < 300; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!getAccessToken) {
    throw new Error("Auth0 is still initializing. Please try again.");
  }
  return getAccessToken(forceRefresh);
}
