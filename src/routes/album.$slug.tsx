import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { AlbumGenerationLoader } from "@/components/album/AlbumGenerationLoader";
import { toImageMap } from "@/components/album/createAlbumPlan";
import { LuxuryNavbar } from "@/components/voyaloom/LuxuryNavbar";
import { requireAuth } from "@/lib/auth/guards";
import { seo } from "@/lib/seo/seo";
import { generateAlbumFn, getAlbumFn } from "@/services/album.functions";
import { listTripImagesFn } from "@/services/trip-image.functions";
import { AlbumFilm } from "@/components/album/AlbumFilm";

export const Route = createFileRoute("/album/$slug")({
  beforeLoad: ({ context, location }) => requireAuth(context, location.pathname),
  validateSearch: z.object({ regenerate: z.string().optional().catch(undefined) }),
  head: () =>
    seo({
      title: "Your travel album",
      description: "Your VoyaLoom travel album built from your uploaded photographs.",
      robots: "private",
    }),
  component: Album,
});

function Album() {
  const { slug: tripId } = Route.useParams();
  const { regenerate } = Route.useSearch();
  const shouldRegenerate = regenerate === "1";
  const [album, setAlbum] = useState<{
    plan: import("@/interface/album").AlbumPlan;
    images: Record<string, string>;
    sourceImages: import("@/interface/trip-image").TripImage[];
  } | null>(null);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    console.info("[VoyaLoom][Album] generate clicked", { tripId });
    setGenerating(true);
    setGenerationError(null);
    const startedAt = Date.now();

    try {
      const [plan, images] = await Promise.all([
        generateAlbumFn({ data: { tripId } }),
        listTripImagesFn({ data: { tripId } }),
      ]);
      const remaining = 1400 - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      console.info("[VoyaLoom][Album] generation succeeded", {
        tripId,
        chapters: plan.chapters.length,
        imageCount: images.length,
        durationMs: Date.now() - startedAt,
      });
      setAlbum({ plan, images: toImageMap(images), sourceImages: images });
      setError(false);
    } catch (reason) {
      console.error("[VoyaLoom][Album] generation failed", { tripId, reason });
      setGenerationError(
        reason instanceof Error ? reason.message : "Could not generate your album.",
      );
    } finally {
      setGenerating(false);
    }
  }, [tripId]);

  useEffect(() => {
    let cancelled = false;

    if (shouldRegenerate) {
      console.info("[VoyaLoom][Album] regenerate requested, skipping existing album", { tripId });
      void handleGenerate();
      return () => {
        cancelled = true;
      };
    }

    console.info("[VoyaLoom][Album] loading album", { tripId });
    Promise.all([getAlbumFn({ data: { tripId } }), listTripImagesFn({ data: { tripId } })])
      .then(([plan, images]) => {
        if (cancelled) return;
        console.info("[VoyaLoom][Album] loaded album", {
          tripId,
          chapters: plan.chapters.length,
          imageCount: images.length,
        });
        setAlbum({
          plan,
          images: toImageMap(images),
          sourceImages: images,
        });
      })
      .catch((reason) => {
        console.error("[VoyaLoom][Album] failed to load album", { tripId, reason });
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [tripId, shouldRegenerate, handleGenerate]);

  if (error) {
    return (
      <AlbumShell>
        {generating && <AlbumGenerationLoader />}
        <main className="mx-auto max-w-xl px-6 pb-32 pt-48 text-center">
          <p className="text-[10px] uppercase tracking-ultra text-gold">Your album is waiting</p>
          <h1 className="mt-5 font-serif text-4xl">Compose this journey.</h1>
          <p className="mt-4 text-sm text-sand/50">
            Your photographs are ready. Generate the cinematic album to organize them into a story.
          </p>
          {generationError && <p className="mt-4 text-sm text-red-300">{generationError}</p>}
          <button
            type="button"
            data-testid="generate-album-button"
            onClick={() => void handleGenerate()}
            disabled={generating}
            aria-busy={generating}
            className="mt-8 inline-flex border border-gold/60 bg-gold px-6 py-3 text-[10px] font-semibold uppercase tracking-luxury text-midnight transition-colors hover:bg-sand disabled:cursor-wait disabled:opacity-70"
          >
            {generating ? "Composing album" : "Generate album"}
          </button>
          <Link
            to="/dashboard"
            className="ml-3 mt-8 inline-flex border border-white/20 px-6 py-3 text-[10px] uppercase tracking-luxury hover:border-gold hover:text-gold"
          >
            Back to dashboard
          </Link>
        </main>
      </AlbumShell>
    );
  }

  if (!album) {
    return (
      <AlbumShell>
        {generating && <AlbumGenerationLoader />}
        <main className="flex min-h-[70vh] items-center justify-center px-6 pt-32">
          {generationError ? (
            <div className="text-center">
              <p className="text-sm text-red-300">{generationError}</p>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex border border-white/20 px-6 py-3 text-[10px] uppercase tracking-luxury hover:border-gold hover:text-gold"
              >
                Back to dashboard
              </Link>
            </div>
          ) : !generating ? (
            <p className="text-[10px] uppercase tracking-luxury text-sand/50">Opening your album</p>
          ) : null}
        </main>
      </AlbumShell>
    );
  }

  return (
    <AlbumShell>
      {generating && <AlbumGenerationLoader />}
      {generationError && (
        <p className="relative z-10 mx-auto mt-4 max-w-xl px-6 text-center text-sm text-red-300">
          {generationError}
        </p>
      )}
      <button
        type="button"
        data-testid="regenerate-album-button"
        onClick={() => void handleGenerate()}
        disabled={generating}
        aria-busy={generating}
        className="glass-strong fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-3 text-[9px] uppercase tracking-luxury text-gold transition-colors hover:bg-gold hover:text-midnight disabled:cursor-wait disabled:opacity-60"
      >
        Regenerate album
      </button>
      <AlbumFilm images={album.sourceImages} plan={album.plan} />
    </AlbumShell>
  );
}

function AlbumShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-midnight text-sand">
      <LuxuryNavbar />
      {children}
    </div>
  );
}
