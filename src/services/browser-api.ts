import { ApiError } from "@/interface/auth";
import { getBrowserAccessToken } from "@/lib/auth/access-token";

export async function browserApiRequest<T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined;
  const isPublicPricing = path === "/api/v1/pricing";
  const directApiUrl = import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? "") : "";
  const requestUrl = directApiUrl ? `${directApiUrl.replace(/\/$/, "")}${path}` : path;
  const accessToken = !isPublicPricing ? await getBrowserAccessToken() : null;

  async function send(token: string | null): Promise<Response> {
    return fetch(requestUrl, {
      method: options.method ?? "GET",
      credentials: directApiUrl ? "omit" : "same-origin",
      headers: {
        Accept: "application/json",
        ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isFormData
        ? (options.body as FormData)
        : hasBody
          ? JSON.stringify(options.body)
          : undefined,
    });
  }

  let response = await send(accessToken);
  if (response.status === 401 && !isPublicPricing) {
    if (import.meta.env.DEV) {
      console.warn("[API] received 401; requesting a fresh Auth0 access token", { path });
    }
    try {
      response = await send(await getBrowserAccessToken(true));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      throw error;
    }

    // A still-401 with a genuinely fresh token means the server has decided
    // the session is over, not that the token was momentarily stale.
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
  }

  const raw = await response.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : undefined;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${response.status}).`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
