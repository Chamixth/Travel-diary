import { describe, expect, it } from "vitest";
import { experienceSpecSchema } from "../schemas/experience-spec";
import { validateRuntimeReferences } from "../runtime/validation";
import { fixtureExperienceSpecs } from "./fixture-specs";

describe("synthetic experience fixtures", () => {
  it("keeps six radically different fixtures schema-valid", () => {
    expect(fixtureExperienceSpecs).toHaveLength(6);
    for (const fixture of fixtureExperienceSpecs) {
      expect(experienceSpecSchema.safeParse(fixture).success, fixture.id).toBe(true);
    }
  });

  it("does not repeat the interaction metaphor", () => {
    const metaphors = fixtureExperienceSpecs.map((fixture) => fixture.dna.interactionMetaphor);
    expect(new Set(metaphors).size).toBe(fixtureExperienceSpecs.length);
  });

  it("uses only registered runtime primitives and valid responsive targets", () => {
    for (const fixture of fixtureExperienceSpecs) {
      const assetIds = new Set(
        fixture.scenes.flatMap((scene) => scene.assets.map((asset) => asset.assetId)),
      );
      expect(validateRuntimeReferences(fixture, assetIds), fixture.id).toEqual([]);
      const sceneIds = new Set(fixture.scenes.map((scene) => scene.id));
      expect(
        fixture.responsiveRules.every((rule) => sceneIds.has(rule.target)),
        fixture.id,
      ).toBe(true);
    }
  });
});
