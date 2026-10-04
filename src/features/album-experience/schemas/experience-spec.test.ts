import { describe, expect, it } from "vitest";
import { experienceSpecSchema, experienceVersionSchema } from "./experience-spec";

const validSpec = {
  schemaVersion: "1.0",
  generatorVersion: "experience-planner-v1",
  id: "fixture-minimal-weekend",
  dna: {
    title: "Sunday, Slowly",
    creativeThesis: "A small weekend told through pauses.",
    interactionMetaphor: "a quiet contact sheet",
    emotionalArc: {
      opening: "arrival",
      development: "wandering",
      climax: "sunset",
      ending: "home",
    },
    visualLanguage: {
      personality: ["quiet"],
      atmosphere: ["warm"],
      paletteStrategy: "photo-derived",
      typographyStrategy: "quiet",
      imageTreatment: "natural",
    },
    motionLanguage: {
      personality: "restrained",
      intensity: 0.2,
      pacing: "slow",
      physics: "soft",
      scrollBehavior: "vertical",
    },
    navigationConcept: "chapter marks",
    signatureMoment: {
      concept: "sunset pause",
      sceneId: "sunset",
      assetIds: ["asset-1"],
      memoryTest: "The page becomes still for the sunset.",
    },
    constraints: {
      avoid: ["cards"],
      accessibilityNotes: ["retain still image"],
      performanceNotes: [],
    },
  },
  scenes: [
    {
      id: "sunset",
      chapterId: "day-one",
      layout: "cinematic-fullscreen",
      motion: "slow-zoom",
      assets: [
        {
          assetId: "asset-1",
          role: "hero",
          alt: "Sunset over a quiet road",
          focalX: 0.5,
          focalY: 0.5,
        },
      ],
      content: { title: "The long way home" },
      effects: [],
      loadPriority: "eager",
      fallback: { layout: "cinematic-fullscreen", motion: "none" },
    },
  ],
  transitions: [],
  globalEffects: [],
  typography: { personality: "quiet", displayScale: "large", bodyMeasure: "narrow" },
  navigation: {
    type: "chapter-marks",
    showProgress: true,
    keyboard: true,
    label: "Journey chapters",
  },
  responsiveRules: [],
};

describe("ExperienceSpec v1", () => {
  it("accepts a valid versioned specification", () => {
    expect(experienceSpecSchema.safeParse(validSpec).success).toBe(true);
  });

  it("rejects an unversioned specification", () => {
    expect(experienceSpecSchema.safeParse({ ...validSpec, schemaVersion: undefined }).success).toBe(
      false,
    );
  });

  it("rejects a signature moment pointing to an unknown scene", () => {
    const invalid = structuredClone(validSpec);
    invalid.dna.signatureMoment.sceneId = "missing";
    expect(experienceSpecSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates an immutable experience version envelope", () => {
    expect(
      experienceVersionSchema.safeParse({
        id: "version-1",
        tripId: "trip-1",
        version: 1,
        schemaVersion: "1.0",
        generatorVersion: "legacy-album-adapter-v1",
        sourceType: "legacy-album-plan",
        sourceId: "plan-1:1",
        spec: validSpec,
        createdAt: "2026-09-21T00:00:00Z",
      }).success,
    ).toBe(true);
  });
});
