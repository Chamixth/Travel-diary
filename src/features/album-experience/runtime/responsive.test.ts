import { describe, expect, it } from "vitest";
import { fixtureExperienceSpecs } from "../fixtures/fixture-specs";
import { resolveResponsiveScene } from "./responsive";

describe("responsive scene resolution", () => {
  it("uses an authored mobile alternative", () => {
    const spec = fixtureExperienceSpecs[0];
    const scene = spec.scenes[0];
    const resolved = resolveResponsiveScene(
      scene,
      [
        {
          target: scene.id,
          breakpoint: "mobile",
          layout: "minimal-gallery",
          motion: "gentle-reveal",
          effectTier: "A",
        },
      ],
      { breakpoint: "mobile", reducedMotion: false },
    );
    expect(resolved.layout).toBe("minimal-gallery");
    expect(resolved.motion).toBe("gentle-reveal");
  });

  it("gives reduced motion precedence over viewport choreography", () => {
    const spec = fixtureExperienceSpecs[0];
    const scene = spec.scenes[0];
    const resolved = resolveResponsiveScene(scene, [], {
      breakpoint: "desktop",
      reducedMotion: true,
    });
    expect(resolved.layout).toBe(scene.fallback.layout);
    expect(resolved.motion).toBe(scene.fallback.motion);
  });
});
