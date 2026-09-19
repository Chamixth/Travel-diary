import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auth0SessionFn } from "@/services/auth.functions";
import { seo } from "@/lib/seo/seo";

export const Route = createFileRoute("/auth/auth0/callback")({
  head: () => seo({ title: "Signing you in", robots: "noindex, nofollow" }),
  component: Auth0Callback,
});

function Auth0Callback() {
  const {
    error: auth0Error,
    isLoading,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (isLoading || started.current) return;

    if (auth0Error) {
      started.current = true;
      console.error("[Auth0] redirect callback failed", {
        error: auth0Error.error,
        errorDescription: auth0Error.error_description,
        message: auth0Error.message,
      });
      toast.error(auth0Error.message);
      void navigate({ to: "/login" });
      return;
    }

    // Auth0 may finish processing the callback one render after isLoading flips.
    if (!isAuthenticated || !user?.sub) return;
    started.current = true;

    async function complete() {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email offline_access",
          },
        });
        logAuth0TokenMetadata(accessToken);
        await auth0SessionFn({
          data: {
            accessToken,
            user: {
              id: user.sub,
              username: user.nickname ?? user.email ?? user.sub,
              email: user.email ?? "",
              name: user.name ?? user.nickname ?? user.email ?? "",
              avatarUrl: user.picture ?? null,
            },
          },
        });
        await router.invalidate();
        const returnTo = sessionStorage.getItem("auth0_return_to");
        sessionStorage.removeItem("auth0_return_to");
        const destination = returnTo?.startsWith("/") ? returnTo : "/dashboard";
        await navigate({ to: destination });
      } catch (error) {
        console.error("[Auth0] token exchange or session sync failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        toast.error(error instanceof Error ? error.message : "Could not finish signing you in.");
        await navigate({ to: "/login" });
      }
    }

    void complete();
  }, [auth0Error, getAccessTokenSilently, isAuthenticated, isLoading, navigate, router, user]);

  return (
    <div className="min-h-screen bg-midnight text-sand flex items-center justify-center">
      <Loader2 className="size-6 animate-spin text-gold" />
    </div>
  );
}

function logAuth0TokenMetadata(token: string): void {
  if (!import.meta.env.DEV) return;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      aud?: string | string[];
      iss?: string;
      exp?: number;
    };

    console.info("[Auth0] access token metadata", {
      audience: Array.isArray(decoded.aud) ? decoded.aud.join(", ") : decoded.aud,
      issuer: decoded.iss,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
      tokenLength: token.length,
    });
  } catch {
    console.warn("[Auth0] received an access token, but its metadata could not be decoded.", {
      tokenLength: token.length,
    });
  }
}
