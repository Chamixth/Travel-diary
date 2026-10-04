/**
 * Client-callable auth RPC layer (the BFF boundary).
 *
 * Components call these `createServerFn` handlers; the handler body runs
 * server-only, talks to the backend via `auth.service`, and manages the
 * sealed session cookie via `session.server`. Tokens and the backend URL
 * never reach the browser bundle.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { User } from "@/interface/auth";

import { createSession, destroySession, getAuthenticatedUser } from "./session.server";

const auth0SessionSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    username: z.string(),
    email: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<User | null> => {
    try {
      return await getAuthenticatedUser();
    } catch {
      // Never let a transient auth-service hiccup break page loads.
      return null;
    }
  },
);

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    await destroySession();
    return { ok: true };
  },
);

/** Store an Auth0 access token in the sealed server session. */
export const auth0SessionFn = createServerFn({ method: "POST" })
  .validator(auth0SessionSchema)
  .handler(async ({ data }): Promise<User> => {
    await createSession({
      user: { ...data.user, provider: "google" },
      tokens: { accessToken: data.accessToken },
    });
    return { ...data.user, provider: "google" };
  });
