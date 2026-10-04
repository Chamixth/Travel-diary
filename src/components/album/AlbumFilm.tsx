import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { TripImage } from "@/interface/trip-image";
import type { AlbumBlock, AlbumPlan } from "@/interface/album";

interface FilmPhoto {
  id: string;
  src: string;
  file: string;
  w: number;
  h: number;
  capturedAt: string | null;
  caption?: string;
}

interface FilmBlock {
  block: AlbumBlock;
  photos: FilmPhoto[];
}

export function AlbumFilm({ images, plan }: { images: TripImage[]; plan: AlbumPlan }) {
  const photos = useMemo<FilmPhoto[]>(
    () =>
      images
        .filter((image) => image.s3Url)
        .map((image) => ({
          id: image.id,
          src: image.s3Url,
          file: image.fileName,
          w: image.width,
          h: image.height,
          // EXIF is the moment the photo was taken; createdAt is only the upload fallback.
          capturedAt: image.exif?.capturedAt || image.createdAt || null,
        })),
    [images],
  );
  const coverPhoto = useMemo(() => {
    const coverId = plan.chapters
      .flatMap((chapter) => chapter.blocks)
      .find((block) => block.type === "album_cover")?.imageIds?.[0];
    return photos.find((photo) => photo.id === coverId) ?? photos[0];
  }, [photos, plan.chapters]);
  const coverPhotoId = coverPhoto?.id;
  const chapters = useMemo(() => {
    const byId = new Map(photos.map((photo) => [photo.id, photo]));
    return plan.chapters
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((chapter) => {
        const blocks: FilmBlock[] = chapter.blocks.map((block) => ({
          block,
          photos: (block.imageIds ?? [])
            .map((id) => {
              const photo = byId.get(id);
              return photo && block.caption ? { ...photo, caption: block.caption } : photo;
            })
            .filter(
              (photo): photo is FilmPhoto => photo !== undefined && photo.id !== coverPhotoId,
            ),
        }));
        const chapterPhotos = blocks.flatMap(({ photos }) => photos);
        const uniquePhotos = [...new Map(chapterPhotos.map((photo) => [photo.id, photo])).values()];
        const chapterCoverId = uniquePhotos[0]?.id;
        const displayedIds = new Set(chapterCoverId ? [chapterCoverId] : []);
        const visibleBlocks = blocks.map(({ block, photos }) => ({
          block,
          // The first chapter photo is already displayed as the chapter hero.
          photos: photos.filter((photo) => {
            if (displayedIds.has(photo.id)) return false;
            displayedIds.add(photo.id);
            return true;
          }),
        }));
        return {
          key: chapter.id,
          date: uniquePhotos[0]?.capturedAt ?? null,
          photos: uniquePhotos,
          blocks: visibleBlocks,
          eyebrow: chapter.eyebrow,
          title: chapter.title,
          quote: chapter.quote,
          description: chapter.description,
        };
      });
  }, [photos, plan.chapters, coverPhotoId]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const flat = useMemo(() => chapters.flatMap((chapter) => chapter.photos), [chapters]);
  const quoteMoments = useMemo(
    () => (plan.quotes ?? []).slice().sort((a, b) => a.order - b.order),
    [plan.quotes],
  );
  const finalChapter = chapters.at(-1);
  const closingBlock = plan.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .at(-1)
    ?.blocks.find((block) => block.type === "closing_frame");
  const closingQuote =
    closingBlock?.quote ||
    closingBlock?.text ||
    closingBlock?.caption ||
    quoteMoments.at(-1)?.text ||
    finalChapter?.quote ||
    plan.subtitle ||
    "The places we leave behind become part of who we are.";
  const closingAttribution = quoteMoments.at(-1)
    ? `${quoteMoments.at(-1)?.from} · ${quoteMoments.at(-1)?.to}`
    : "Until the next journey";

  return (
    <div className="relative overflow-hidden">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="grain relative flex min-h-[92vh] items-end overflow-hidden border-b border-white/10 px-6 py-16 md:px-16 md:py-24"
      >
        {coverPhoto && (
          <motion.img
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            src={coverPhoto.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(75,198,250,0.26),transparent_32%),linear-gradient(90deg,rgba(2,15,29,0.96)_0%,rgba(2,15,29,0.7)_42%,rgba(2,15,29,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,15,29,0.22)_0%,transparent_36%,rgba(2,15,29,0.96)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gold/60" />
        <div className="absolute right-6 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/60 to-transparent md:block" />
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-7xl"
        >
          <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-ultra text-gold">
            <span className="h-px w-12 bg-gold" />
            <span>
              {plan.tone ? `${plan.tone.replaceAll("_", " ")} · ` : ""}VoyaLoom film archive
            </span>
          </div>
          <h1 className="max-w-6xl font-serif text-[clamp(4.5rem,12vw,11rem)] leading-[0.78] tracking-[-0.055em] text-sand">
            {plan.title}
          </h1>
          {plan.subtitle && (
            <p className="mt-8 max-w-2xl font-serif text-2xl italic leading-snug text-sand/80 md:text-3xl">
              {plan.subtitle}
            </p>
          )}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-luxury text-sand/55">
            <span>{chapters.length} chapters</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span>{photos.length} frames</span>
            {coverPhoto?.capturedAt && (
              <>
                <span className="h-1 w-1 rounded-full bg-gold" />
                <span>{captureDate(coverPhoto.capturedAt)}</span>
              </>
            )}
          </div>
        </motion.div>
        <div className="absolute bottom-8 right-6 z-10 flex items-center gap-3 text-[9px] uppercase tracking-ultra text-sand/45 md:right-16">
          <span>Begin the journey</span>
          <span className="h-10 w-px bg-gold/70" />
        </div>
      </motion.header>

      {chapters.map((chapter, index) => (
        <div key={chapter.key}>
          <ChapterFilm
            chapter={chapter}
            index={index}
            onOpen={(photo) => setLightbox(flat.findIndex((item) => item.id === photo.id))}
          />
          {index < chapters.length - 1 && quoteMoments[index] && (
            <QuoteMoment quote={quoteMoments[index]} />
          )}
        </div>
      ))}

      <ClosingFrame quote={closingQuote} attribution={closingAttribution} />

      <Lightbox
        photos={flat}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </div>
  );
}

function ChapterFilm({
  chapter,
  index,
  onOpen,
}: {
  chapter: {
    date: string | null;
    photos: FilmPhoto[];
    blocks: FilmBlock[];
    eyebrow?: string;
    title: string;
    quote?: string;
    description?: string;
  };
  index: number;
  onOpen: (photo: FilmPhoto) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const [cover, ...rest] = chapter.photos;
  const dateLabel = chapter.date
    ? new Date(chapter.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date unknown";

  return (
    <section ref={ref} className="relative border-b border-white/10">
      <div className="grain relative flex h-[86vh] min-h-[620px] items-end overflow-hidden">
        {cover && (
          <motion.img
            style={{ y, scale }}
            src={cover.src}
            alt={`${chapter.title} cover`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/45 to-midnight/35" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-5xl px-6 pb-20 md:px-16 md:pb-28"
        >
          <span className="mb-6 block text-[10px] uppercase tracking-ultra text-gold">
            {chapter.eyebrow || `Chapter ${toRoman(index + 1)}`} · {dateLabel} ·{" "}
            {chapter.photos.length} frames
          </span>
          <h2 className="font-serif text-6xl leading-[0.88] md:text-[8rem]">{chapter.title}</h2>
          {chapter.quote && (
            <p className="mt-8 max-w-2xl font-serif text-2xl italic leading-snug text-sand/75 md:text-3xl">
              “{chapter.quote}”
            </p>
          )}
          {chapter.description && (
            <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-sand/45">
              {chapter.description}
            </p>
          )}
        </motion.div>
      </div>
      <div className="px-4 py-16 md:px-12 md:py-24">
        <CinematicBlocks blocks={chapter.blocks} fallbackPhotos={rest} onOpen={onOpen} />
      </div>
    </section>
  );
}

function CinematicBlocks({
  blocks,
  fallbackPhotos,
  onOpen,
}: {
  blocks: FilmBlock[];
  fallbackPhotos: FilmPhoto[];
  onOpen: (photo: FilmPhoto) => void;
}) {
  const renderable = blocks.filter(({ block }) => block.type !== "album_cover");
  if (renderable.length === 0) return <EditorialGrid photos={fallbackPhotos} onOpen={onOpen} />;

  return (
    <div className="mx-auto max-w-7xl space-y-20 md:space-y-32">
      {renderable.map(({ block, photos }, index) => (
        <motion.div
          key={`${block.type}-${index}-${photos.map((photo) => photo.id).join("-")}`}
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <CinematicBlock block={block} photos={photos} onOpen={onOpen} />
        </motion.div>
      ))}
    </div>
  );
}

function CinematicBlock({
  block,
  photos,
  onOpen,
}: {
  block: AlbumBlock;
  photos: FilmPhoto[];
  onOpen: (photo: FilmPhoto) => void;
}) {
  if (block.type === "story_text" || block.type === "chapter_transition") {
    return (
      <div className="mx-auto max-w-3xl py-4 text-center md:py-12">
        {block.eyebrow && (
          <p className="text-[10px] uppercase tracking-ultra text-gold">{block.eyebrow}</p>
        )}
        {block.title && <h3 className="mt-4 font-serif text-4xl md:text-6xl">{block.title}</h3>}
        <p className="mt-6 font-serif text-3xl italic leading-tight text-sand/75 md:text-5xl">
          {block.text || block.description}
        </p>
      </div>
    );
  }

  if (block.type === "full_bleed_quote") {
    const photo = photos[0];
    return photo ? (
      <div className="relative flex min-h-[60vh] items-center overflow-hidden bg-charcoal">
        <img
          src={photo.src}
          alt={block.title || "Travel moment"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-midnight/60" />
        <div className="relative z-10 max-w-3xl px-8 py-20 md:px-16">
          {block.eyebrow && (
            <p className="mb-5 text-[10px] uppercase tracking-ultra text-gold">{block.eyebrow}</p>
          )}
          <p className="font-serif text-4xl italic leading-tight md:text-7xl">“{block.quote}”</p>
        </div>
      </div>
    ) : (
      <QuoteMoment
        quote={{ from: block.eyebrow || "A moment", to: "The journey", text: block.quote || "" }}
      />
    );
  }

  if (block.type === "portrait_pair" || block.type === "landscape_pair") {
    return (
      <div className="grid grid-cols-2 items-end gap-4 md:gap-8">
        {photos.slice(0, 2).map((photo, index) => (
          <Frame key={photo.id} photo={photo} onOpen={onOpen} offset={index === 1} />
        ))}
      </div>
    );
  }

  if (block.type === "film_strip") {
    return (
      <div className="overflow-hidden">
        {(block.title || block.caption) && (
          <div className="mb-6 flex items-end justify-between gap-6">
            {block.title && <h3 className="font-serif text-4xl md:text-5xl">{block.title}</h3>}
            {block.caption && (
              <p className="max-w-sm text-right text-sm text-sand/55">{block.caption}</p>
            )}
          </div>
        )}
        <div className="flex snap-x gap-4 overflow-x-auto pb-5">
          {photos.slice(0, 5).map((photo) => (
            <div key={photo.id} className="w-[78vw] shrink-0 snap-start sm:w-[45vw] md:w-[28vw]">
              <Frame photo={photo} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "editorial_grid") {
    return <EditorialGrid photos={photos} onOpen={onOpen} />;
  }

  if (
    block.type === "full_bleed_image" ||
    block.type === "panorama" ||
    block.type === "closing_frame"
  ) {
    const photo = photos[0];
    if (!photo) return null;
    return (
      <figure className="group relative overflow-hidden bg-charcoal">
        <img
          src={photo.src}
          alt={block.title || "Travel moment"}
          className={`${block.type === "panorama" ? "aspect-[2/1] md:aspect-[3/1]" : "h-[70vh] min-h-[420px]"} w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]`}
        />
        {(block.title || block.caption) && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/90 to-transparent p-6 pt-24 md:p-12 md:pt-32">
            {block.title && <h3 className="font-serif text-4xl md:text-6xl">{block.title}</h3>}
            {block.caption && <p className="mt-3 max-w-lg text-sm text-sand/65">{block.caption}</p>}
          </figcaption>
        )}
      </figure>
    );
  }

  const photo = photos[0];
  return photo ? <Frame photo={photo} onOpen={onOpen} tall /> : null;
}

function EditorialGrid({
  photos,
  onOpen,
}: {
  photos: FilmPhoto[];
  onOpen: (photo: FilmPhoto) => void;
}) {
  const blocks: FilmPhoto[][] = [];
  const pattern = [1, 2, 3, 2];
  for (let i = 0, k = 0; i < photos.length; k += 1) {
    const block = photos.slice(i, i + pattern[k % pattern.length]);
    blocks.push(block);
    i += block.length;
  }
  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-8">
      {blocks.map((block, blockIndex) => (
        <div
          key={blockIndex}
          className={
            block.length === 1
              ? "grid grid-cols-1"
              : block.length === 2
                ? "grid grid-cols-2 items-end gap-4 md:gap-8"
                : "grid grid-cols-2 items-start gap-4 md:grid-cols-3 md:gap-8"
          }
        >
          {block.map((photo, photoIndex) => (
            <Frame
              key={photo.id}
              photo={photo}
              onOpen={onOpen}
              tall={block.length === 1}
              offset={block.length === 2 && photoIndex === 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Frame({
  photo,
  onOpen,
  tall,
  offset,
}: {
  photo: FilmPhoto;
  onOpen: (photo: FilmPhoto) => void;
  tall?: boolean;
  offset?: boolean;
}) {
  const portrait = photo.h > photo.w;
  return (
    <motion.figure
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(photo)}
      className={`group relative cursor-pointer overflow-hidden border border-white/10 bg-charcoal shadow-cinematic ${offset ? "md:translate-y-12" : ""}`}
    >
      <div
        className={
          tall
            ? portrait
              ? "aspect-[4/5] md:aspect-[16/10]"
              : "aspect-[16/9]"
            : portrait
              ? "aspect-[3/4]"
              : "aspect-[4/3]"
        }
      >
        <img
          src={photo.src}
          alt={photo.caption || "Travel frame"}
          loading="lazy"
          className="h-full w-full object-cover grayscale-[0.18] contrast-[1.05] transition-all duration-[1.4s] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-95" />
      <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-4 transition-transform duration-700 group-hover:translate-y-0 md:p-6">
        <p className="text-[9px] uppercase tracking-ultra text-gold">
          {captureDate(photo.capturedAt)}
        </p>
        <p className="mt-1 text-[9px] uppercase tracking-luxury text-sand/40 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          {photo.caption || `${photo.w} × ${photo.h} · ${photo.file}`}
        </p>
      </figcaption>
    </motion.figure>
  );
}

function QuoteMoment({ quote }: { quote: { from: string; to: string; text: string } }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/10 bg-charcoal/60 px-6 py-24 text-center md:px-16 md:py-36"
    >
      <p className="text-[10px] uppercase tracking-ultra text-gold">
        {quote.from} · {quote.to}
      </p>
      <p className="mx-auto mt-7 max-w-4xl font-serif text-4xl italic leading-tight text-sand/80 md:text-6xl">
        “{quote.text}”
      </p>
    </motion.section>
  );
}

function ClosingFrame({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 1.5 }}
      className="grain relative flex min-h-[70vh] items-center justify-center overflow-hidden border-t border-white/10 bg-midnight px-6 py-28 text-center md:px-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(216,177,104,0.14),transparent_35%),linear-gradient(180deg,var(--charcoal),var(--midnight))]" />
      <motion.div
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-5xl"
      >
        <span className="text-[10px] uppercase tracking-ultra text-gold">The final frame</span>
        <p className="mt-8 font-serif text-5xl italic leading-[0.96] text-sand md:text-8xl">
          “{quote}”
        </p>
        <div className="mx-auto mt-12 h-px w-16 bg-gold/60" />
        <p className="mt-6 text-[10px] uppercase tracking-luxury text-sand/45">{attribution}</p>
      </motion.div>
    </motion.footer>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: FilmPhoto[];
  index: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % photos.length);
      if (event.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onIndex, photos.length]);
  const photo = index === null ? null : photos[index];
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-midnight/97 p-6 backdrop-blur-xl"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="glass-strong absolute right-6 top-6 flex size-11 items-center justify-center rounded-full"
            aria-label="Close"
          >
            <X className="size-4 text-sand/70" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index! - 1 + photos.length) % photos.length);
            }}
            className="glass-strong absolute left-4 flex size-11 items-center justify-center rounded-full md:left-8"
            aria-label="Previous frame"
          >
            <ChevronLeft className="size-4 text-sand/70" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index! + 1) % photos.length);
            }}
            className="glass-strong absolute right-4 flex size-11 items-center justify-center rounded-full md:right-8"
            aria-label="Next frame"
          >
            <ChevronRight className="size-4 text-sand/70" />
          </button>
          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex max-h-full flex-col items-center gap-5"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={photo.src}
              alt={photo.caption || "Travel frame, full view"}
              className="max-h-[74vh] w-auto object-contain shadow-cinematic"
            />
            <figcaption className="text-center">
              <p className="text-[10px] uppercase tracking-ultra text-gold">
                {captureDate(photo.capturedAt)}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-luxury text-sand/35">
                Frame {index! + 1} of {photos.length}
              </p>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function captureDate(iso: string | null) {
  if (!iso) return "Capture time unavailable";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toRoman(value: number) {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][value - 1] ?? String(value);
}
