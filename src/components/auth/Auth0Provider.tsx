import { Auth0Provider as Provider, useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useState } from "react";
import { setAccessTokenGetter } from "@/lib/auth/access-token";

const domain = import.meta.env.VITE_AUTH0_DOMAIN ?? "";
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "";
const audience = import.meta.env.VITE_AUTH0_AUDIENCE ?? "";
// offline_access is what makes Auth0 issue a (rotating) refresh token, which
// is what lets getAccessTokenSilently() restore a session after a hard
// refresh via a direct token-endpoint call — no third-party cookie or
// hidden iframe involved, unlike the default SSO-cookie silent-auth path.
const AUTH_SCOPE = "openid profile email offline_access";

function Auth0TokenBridge({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated, isLoading, logout } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  async function getToken(forceRefresh = false): Promise<string> {
    const token = await getAccessTokenSilently({
      cacheMode: forceRefresh ? "off" : "on",
      authorizationParams: { audience, scope: AUTH_SCOPE },
    });
    logTokenMetadata(token, forceRefresh ? "forced-refresh" : "silent");
    setAccessToken(token);
    return token;
  }

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    // Memory has nothing after a hard refresh, but the rotating refresh
    // token (persisted via cacheLocation="localstorage") lets this succeed
    // with a direct call to Auth0's token endpoint.
    void getAccessTokenSilently({
      authorizationParams: { audience, scope: AUTH_SCOPE },
    }).catch((error) => {
      console.warn("[Auth0] silent session restoration did not complete", error);
    });
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setAccessTokenGetter(null);
      return;
    }

    setAccessTokenGetter(getToken);

    return () => setAccessTokenGetter(null);
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void getToken().catch((error) => {
        console.warn("[Auth0] could not refresh the in-memory access token", error);
      });
    } else if (!isAuthenticated) {
      setAccessToken(null);
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // A second consecutive 401 from browser-api.ts (fresh token still
  // rejected) means the session is truly gone server-side. Sign out
  // cleanly rather than looping forever on API calls with a dead token.
  useEffect(() => {
    function handleSessionExpired() {
      void logout({ logoutParams: { returnTo: window.location.origin } });
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [logout]);

  return <AuthTokenContext.Provider value={accessToken}>{children}</AuthTokenContext.Provider>;
}

function logTokenMetadata(token: string, source: string): void {
  if (!import.meta.env.DEV) return;
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) throw new Error("missing payload");
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      aud?: string | string[];
      iss?: string;
      exp?: number;
    };
    console.info("[Auth0] token ready", {
      source,
      audience: Array.isArray(payload.aud) ? payload.aud.join(", ") : payload.aud,
      issuer: payload.iss,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    });
  } catch {
    console.warn("[Auth0] received a token with unreadable metadata.");
  }
}

const AuthTokenContext = createContext<string | null>(null);

export function useAuthToken(): string | null {
  return useContext(AuthTokenContext);
}

export function Auth0Provider({ children }: { children: React.ReactNode }) {
  const redirectUri =
    import.meta.env.VITE_AUTH0_REDIRECT_URI ??
    (typeof window !== "undefined" ? `${window.location.origin}/auth/auth0/callback` : "");

  return (
    <Provider
      domain={domain}
      clientId={clientId}
      // Rotating refresh tokens (offline_access scope below) let the bridge
      // restore a session after a hard refresh via a direct token-endpoint
      // call, instead of the SSO-cookie iframe check that modern browsers'
      // third-party-cookie blocking breaks. The refresh token itself needs
      // to survive the refresh, so it's cached in localStorage; rotation on
      // every use is what keeps a leaked one from being replayable for long.
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={(appState) => {
        const returnTo = appState?.returnTo;
        if (typeof returnTo === "string" && returnTo.startsWith("/")) {
          sessionStorage.setItem("auth0_return_to", returnTo);
        }
      }}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: AUTH_SCOPE,
      }}
    >
      <Auth0TokenBridge>{children}</Auth0TokenBridge>
    </Provider>
  );
}
