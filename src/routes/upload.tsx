import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { LuxuryNavbar } from "@/components/voyaloom/LuxuryNavbar";
import { CinematicFooter } from "@/components/voyaloom/CinematicFooter";
import { UploadDropzone } from "@/components/voyaloom/UploadDropzone";
import { requireAuth } from "@/lib/auth/guards";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/interface/trip-image";
import { uploadTripImages } from "@/services/trip-image-upload";
import { seo } from "@/lib/seo/seo";

export const Route = createFileRoute("/upload")({
  validateSearch: z.object({ trip: z.string().optional().catch(undefined) }),
  beforeLoad: ({ context, location }) => requireAuth(context, location.pathname),
  head: () =>
    seo({
      title: "Upload photos",
      description: "Upload your travel photos and let VoyaLoom build your album.",
      robots: "private",
    }),
  component: Upload,
});

const acceptedTypes = new Set<string>(ACCEPTED_IMAGE_TYPES);

interface Picked {
  file: File;
  url: string;
}

type UploadStatus = "queued" | "uploading" | "processing" | "uploaded" | "failed";

interface UploadItem extends Picked {
  status: UploadStatus;
  error?: string;
  /** 0-100. Real byte-level progress from the direct-to-S3 PUT. */
  percent?: number;
}

function Upload() {
  const { trip: tripId } = Route.useSearch();
  const [stage, setStage] = useState<"upload" | "processing">("upload");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // Release every object URL we created, once, on unmount.
  const pickedRef = useRef<Picked[]>([]);
  pickedRef.current = picked;
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function clearPicked() {
    setPicked((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }

  function addFiles(list: FileList) {
    const incoming = Array.from(list);
    const valid: Picked[] = [];
    let skipped = 0;

    for (const file of incoming) {
      const typeOk = file.type ? acceptedTypes.has(file.type) : true;
      const sizeOk = file.size > 0 && file.size <= MAX_IMAGE_BYTES;
      const dup = picked.some((p) => p.file.name === file.name && p.file.size === file.size);
      if (typeOk && sizeOk && !dup) {
        valid.push({ file, url: URL.createObjectURL(file) });
      } else if (!dup) {
        skipped += 1;
      }
    }

    if (skipped > 0) {
      toast.warning(
        `${skipped} file${skipped > 1 ? "s were" : " was"} skipped (JPEG, PNG, GIF or HEIC up to 15 MB).`,
      );
    }
    if (valid.length > 0) setPicked((prev) => [...prev, ...valid]);
  }

  function removeAt(index: number) {
    setPicked((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function handleUpload() {
    if (!tripId) {
      toast.error("Create a trip before uploading memories.");
      return;
    }
    if (picked.length === 0) {
      toast.error("Choose at least one image.");
      return;
    }

    const items = picked.map((item) => ({ ...item, status: "queued" as const }));
    setUploads(items);
    setStage("processing");
    await runUploadQueue(items);
  }

  async function runUploadQueue(target: UploadItem[]) {
    setUploads((current) =>
      current.map((entry) =>
        target.some((item) => item.url === entry.url)
          ? { ...entry, status: "uploading", error: undefined, percent: 0 }
          : entry,
      ),
    );

    const { uploaded, failed } = await uploadTripImages(
      tripId!,
      target.map((item) => ({ clientId: item.url, file: item.file })),
      {
        onProgress: ({ clientId, loaded, total }) => {
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          setUploads((current) =>
            current.map((entry) =>
              entry.url === clientId
                ? { ...entry, percent, status: percent >= 100 ? "processing" : entry.status }
                : entry,
            ),
          );
        },
      },
    );

    const succeededIds = new Set(uploaded.map((entry) => entry.clientId));
    const failedById = new Map(failed.map((entry) => [entry.clientId, entry.error]));
    setUploads((current) =>
      current.map((entry) => {
        if (succeededIds.has(entry.url)) return { ...entry, status: "uploaded", percent: 100 };
        if (failedById.has(entry.url)) {
          return { ...entry, status: "failed", error: failedById.get(entry.url) };
        }
        return entry;
      }),
    );

    if (failed.length === 0) {
      toast.success(`${uploaded.length} memor${uploaded.length === 1 ? "y" : "ies"} uploaded.`);
    } else {
      toast.warning(
        `${failed.length} upload${failed.length === 1 ? "" : "s"} failed. You can retry ${failed.length === 1 ? "it" : "them"}.`,
      );
    }
  }

  async function retryFailed() {
    const failed = uploads.filter((item) => item.status === "failed");
    if (failed.length === 0) return;
    await runUploadQueue(failed);
  }

  return (
    <div className="bg-midnight text-sand min-h-screen">
      <LuxuryNavbar />

      <section className="pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-ultra text-gold mb-4 block">
            {tripId ? "Add to your trip" : "New Trip"}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] mb-6">
            {stage === "upload"
              ? "Bring us your moments."
              : stage === "processing"
                ? "Uploading your memories"
                : "Your memories are in."}
          </h1>
          <p className="font-serif italic text-xl text-sand/60 max-w-xl mx-auto">
            {stage === "upload"
              ? "We'll take it from here."
              : stage === "processing"
                ? "Sit back. This takes a moment of stillness."
                : "Step inside your story."}
          </p>
        </motion.div>

        {stage === "upload" && !tripId && (
          <div className="glass-strong rounded-sm p-10 text-center">
            <h3 className="font-serif text-3xl mb-3">No trip selected</h3>
            <p className="text-sand/60 text-sm mb-8">
              Memories are attached to a trip. Start one first.
            </p>
            <Link
              to="/create-trip"
              className="inline-block bg-gold text-midnight px-10 py-4 text-[11px] uppercase tracking-luxury font-semibold hover:bg-sand transition-colors shadow-gold"
            >
              Create a trip
            </Link>
          </div>
        )}

        {stage === "upload" && tripId && (
          <>
            <UploadDropzone onFiles={addFiles} />

            {picked.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-luxury text-sand/50">
                    {picked.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={clearPicked}
                    className="text-[10px] uppercase tracking-luxury text-sand/40 hover:text-gold transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {picked.map((p, i) => (
                    <div
                      key={p.url}
                      className="group relative aspect-square overflow-hidden rounded-sm"
                    >
                      <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAt(i)}
                        aria-label={`Remove ${p.file.name}`}
                        className="absolute top-1 right-1 size-6 rounded-full bg-midnight/80 text-sand/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={handleUpload}
                disabled={picked.length === 0}
                className="inline-flex items-center gap-3 bg-gold text-midnight px-12 py-4 text-[11px] uppercase tracking-luxury font-semibold hover:bg-sand transition-colors shadow-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ImagePlus className="size-4" />
                {picked.length > 0 ? `Upload ${picked.length}` : "Upload memories"}
              </button>
            </div>
          </>
        )}

        {stage === "processing" && (
          <UploadProgressPanel uploads={uploads} tripId={tripId!} onRetry={retryFailed} />
        )}
      </section>

      <CinematicFooter />
    </div>
  );
}

function UploadProgressPanel({
  uploads,
  tripId,
  onRetry,
}: {
  uploads: UploadItem[];
  tripId: string;
  onRetry: () => void;
}) {
  const uploaded = uploads.filter((item) => item.status === "uploaded").length;
  const failed = uploads.filter((item) => item.status === "failed").length;
  const complete = uploaded + failed;
  // Counts a file the moment its own PUT to S3 finishes (not just once the
  // whole batch's completion request comes back) so this climbs steadily
  // per-file instead of sitting at 0 until every file lands at once.
  const landed = uploads.filter(
    (item) => item.status !== "queued" && item.status !== "uploading",
  ).length;
  const isDone = complete === uploads.length;

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-ultra text-gold">Upload progress</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Your memories are arriving.</h2>
          </div>
          <p className="shrink-0 font-serif text-2xl text-gold">
            {landed} <span className="text-sand/35">of {uploads.length}</span>
          </p>
        </div>
        <div className="mb-8 h-1 overflow-hidden bg-white/10">
          <div
            className="h-full bg-gold transition-[width] duration-500"
            style={{ width: `${uploads.length ? (landed / uploads.length) * 100 : 0}%` }}
          />
        </div>
        <div className="max-h-[min(58vh,560px)] overflow-y-auto overscroll-contain border border-white/10 bg-charcoal/20 p-2 pr-3 [scrollbar-color:rgba(216,177,104,0.55)_rgba(255,255,255,0.06)] [scrollbar-width:thin]">
          <div className="space-y-2">
            {uploads.map((item) => (
              <div key={item.url} className="border border-white/10 bg-charcoal/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={item.url} alt="" className="size-11 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-sand/80">{item.file.name}</p>
                    <div className="mt-2 h-px bg-white/10">
                      <div
                        className={`h-full transition-[width] duration-300 ${item.status === "failed" ? "bg-ember" : "bg-gold"}`}
                        style={{
                          width:
                            item.status === "uploaded" || item.status === "processing"
                              ? "100%"
                              : item.status === "queued"
                                ? "0%"
                                : `${item.percent ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] uppercase tracking-luxury text-sand/45">
                    {item.status === "uploading"
                      ? `Uploading ${item.percent ?? 0}%`
                      : item.status === "processing"
                        ? "Processing"
                        : item.status === "uploaded"
                          ? "Uploaded"
                          : item.status === "failed"
                            ? "Failed"
                            : "Queued"}
                  </span>
                </div>
                {item.error && <p className="mt-2 pl-14 text-[10px] text-ember">{item.error}</p>}
              </div>
            ))}
          </div>
        </div>
        {isDone && uploaded > 0 && (
          <Link
            to="/trip/$slug/images"
            params={{ slug: tripId }}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-gold px-6 py-4 text-[10px] font-semibold uppercase tracking-luxury text-midnight transition-colors hover:bg-sand"
          >
            View your photos
          </Link>
        )}
        {failed > 0 && (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-gold/50 px-6 py-4 text-[10px] uppercase tracking-luxury text-gold transition-colors hover:bg-gold hover:text-midnight"
          >
            <Loader2 className="size-3" />
            Retry failed uploads
          </button>
        )}
        {!isDone && (
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-luxury text-sand/40">
            <Loader2 className="size-3 animate-spin" />
            Uploading securely. You can keep this screen open.
          </p>
        )}
      </div>
    </div>
  );
}
