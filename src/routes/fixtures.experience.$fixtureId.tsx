import { createFileRoute, notFound } from "@tanstack/react-router";
import { ExperienceRuntime } from "@/features/album-experience/runtime/ExperienceRuntime";
import { fixtureMediaAssets } from "@/features/album-experience/fixtures/fixture-media";
import { fixtureExperienceSpecs } from "@/features/album-experience/fixtures/fixture-specs";
import { seo } from "@/lib/seo/seo";

export const Route = createFileRoute("/fixtures/experience/$fixtureId")({
  beforeLoad: ({ params }) => {
    if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_EXPERIENCE_FIXTURES !== "true") {
      throw notFound();
    }
    if (!fixtureExperienceSpecs.some((fixture) => fixture.id === params.fixtureId)) {
      throw notFound();
    }
  },
  head: () => seo({ title: "Experience fixture", robots: "private" }),
  component: ExperienceFixture,
});

function ExperienceFixture() {
  const { fixtureId } = Route.useParams();
  const fixture = fixtureExperienceSpecs.find((candidate) => candidate.id === fixtureId);
  if (!fixture) return null;

  return (
    <div data-testid="experience-fixture" data-fixture-id={fixture.id}>
      <ExperienceRuntime spec={fixture} assets={fixtureMediaAssets(fixture.id)} />
    </div>
  );
}
