import { createFileRoute, Link } from "@tanstack/react-router";
import { LuxuryNavbar } from "@/components/voyaloom/LuxuryNavbar";
import { CinematicFooter } from "@/components/voyaloom/CinematicFooter";
import { ldJson, seo } from "@/lib/seo/seo";
import { breadcrumbLd } from "@/lib/seo/structured-data";
import { useAuth } from "@/lib/auth/use-auth";

export const Route = createFileRoute("/how-it-works")({
  head: () => {
    const base = seo({
      title: "How it works",
      description:
        "How VoyaLoom turns your travel photos into a cinematic album: create a trip, upload your photos, and AI analyzes the images, organizes the moments, curates the best shots, writes descriptions, and builds a scrollable story.",
      path: "/how-it-works",
    });
    return {
      ...base,
      meta: [
        ...base.meta,
        ldJson(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ),
      ],
    };
  },
  component: HowItWorks,
});

const STEPS = [
  {
    n: "01",
    title: "Create a trip",
    body: "Every album belongs to a trip. Give it a name and a destination so VoyaLoom knows what it's building.",
  },
  {
    n: "02",
    title: "Upload your travel photos",
    body: "Add the photos you took — landscapes, streets, food, people, moments. VoyaLoom accepts JPEG, PNG, GIF, and HEIC images (including straight from an iPhone). You don't need to sort, rename, or pre-select anything.",
  },
  {
    n: "03",
    title: "AI analyzes the images",
    body: "VoyaLoom looks at each photo to understand the scene, the setting, and what's happening — the raw material for the story.",
  },
  {
    n: "04",
    title: "Moments are organized and curated",
    body: "Related photos are grouped into moments, the strongest images are surfaced, and the meaningful parts of the trip are identified so the album has a shape instead of being a flat grid.",
  },
  {
    n: "05",
    title: "Descriptions and quotes are added",
    body: "VoyaLoom writes contextual descriptions for the moments in your trip and adds fitting quotes where they belong, so the album reads like a story.",
  },
  {
    n: "06",
    title: "Your cinematic album is built",
    body: "Everything is laid out as a scrollable visual story you can revisit and share. Your full upload stays available in the album archive.",
  },
];

function HowItWorks() {
  const { isAuthenticated } = useAuth();
  const ctaPath = isAuthenticated ? "/dashboard" : "/get-started";

  return (
    <div className="bg-midnight text-sand min-h-screen">
      <LuxuryNavbar />

      <article className="pt-40 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
        <span className="text-[10px] uppercase tracking-ultra text-gold mb-6 block">
          How it works
        </span>
        <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] mb-8">
          From your camera roll to a cinematic travel album.
        </h1>
        <p className="text-lg text-sand/60 font-light leading-relaxed mb-6">
          VoyaLoom is an AI travel album generator. You upload the photos from a trip and VoyaLoom
          uses AI to analyze, organize, curate, and describe them, then arranges everything into a
          scrollable cinematic story. It does the work you'd otherwise do by hand — sorting hundreds
          of photos, choosing the best ones, writing captions, and designing a layout.
        </p>
        <p className="text-lg text-sand/60 font-light leading-relaxed">
          VoyaLoom works only with the photos you upload. It does not generate AI images or replace
          your travel photos with artificial ones.
        </p>

        <div className="mt-16 space-y-12">
          {STEPS.map((step) => (
            <section key={step.n}>
              <div className="flex items-baseline gap-5">
                <span className="font-serif italic text-gold/40 text-4xl">{step.n}</span>
                <h2 className="font-serif text-3xl leading-tight">{step.title}</h2>
              </div>
              <p className="mt-3 text-sand/60 font-light leading-relaxed">{step.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-20">
          <h2 className="font-serif text-3xl mb-4">How long does it take?</h2>
          <p className="text-sand/60 font-light leading-relaxed">
            Uploading depends on how many photos you add and your connection speed. Once your photos
            are in, VoyaLoom handles the analysis and layout so you don't have to.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl mb-4">Is it free?</h2>
          <p className="text-sand/60 font-light leading-relaxed">
            Yes. VoyaLoom is currently free, with limits of up to 100 images and up to 2 trips per
            account.
          </p>
        </section>

        <div className="mt-20 flex flex-wrap gap-4">
          <Link
            to={ctaPath}
            className="inline-block bg-gold text-midnight px-10 py-4 text-[11px] uppercase tracking-luxury font-semibold hover:bg-sand transition-colors shadow-gold"
          >
            Create your album — free
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center px-10 py-4 border border-white/20 text-[11px] uppercase tracking-luxury hover:bg-white/5 transition-colors"
          >
            Read the FAQ
          </Link>
        </div>
      </article>

      <CinematicFooter />
    </div>
  );
}
