import type { ExperienceSpec } from "../schemas/experience-spec";

interface FixtureDirection {
  id: string;
  title: string;
  thesis: string;
  metaphor: string;
  opening: string;
  climax: string;
  ending: string;
  personality: string;
  atmosphere: string;
  palette: string;
  motion: string;
  navigation: string;
  signature: string;
  layouts: [FixtureLayout, FixtureLayout];
  motions: [FixtureMotion, FixtureMotion];
  transition: FixtureTransition;
}

type FixtureLayout =
  | "cinematic-fullscreen"
  | "editorial-split"
  | "minimal-gallery"
  | "film-strip"
  | "contact-sheet"
  | "scattered-prints"
  | "timeline"
  | "layered-depth"
  | "horizontal-travel";

type FixtureMotion =
  | "gentle-reveal"
  | "slow-zoom"
  | "blur-to-focus"
  | "depth-reveal"
  | "horizontal-drift"
  | "camera-flash"
  | "exposure-reveal"
  | "clip-reveal"
  | "rise-and-settle";

type FixtureTransition =
  "crossfade" | "dip-to-black" | "wipe" | "dissolve" | "slide-over" | "flash" | "page-turn";

function createFixture(direction: FixtureDirection): ExperienceSpec {
  const openingAsset = `${direction.id}-opening`;
  const climaxAsset = `${direction.id}-climax`;
  return {
    schemaVersion: "1.0",
    generatorVersion: "fixture-author-v1",
    id: direction.id,
    dna: {
      title: direction.title,
      creativeThesis: direction.thesis,
      interactionMetaphor: direction.metaphor,
      emotionalArc: {
        opening: direction.opening,
        development: "The journey gathers detail and rhythm.",
        climax: direction.climax,
        ending: direction.ending,
      },
      visualLanguage: {
        personality: [direction.personality],
        atmosphere: [direction.atmosphere],
        paletteStrategy: direction.palette,
        typographyStrategy: direction.personality,
        imageTreatment: "photography-led",
      },
      motionLanguage: {
        personality: direction.motion,
        intensity: direction.motion === "quiet" ? 0.2 : 0.55,
        pacing: direction.motion === "urgent" ? "fast" : "measured",
        physics: "natural",
        scrollBehavior: "vertical",
      },
      navigationConcept: direction.navigation,
      signatureMoment: {
        concept: direction.signature,
        sceneId: `${direction.id}-climax-scene`,
        assetIds: [climaxAsset],
        memoryTest: direction.signature,
      },
      constraints: {
        avoid: ["generic card grid", "decorative motion without narrative purpose"],
        accessibilityNotes: ["The signature image remains visible without motion."],
        performanceNotes: ["Tier A uses the same photographic composition."],
      },
    },
    scenes: [
      {
        id: `${direction.id}-opening-scene`,
        chapterId: "opening",
        layout: direction.layouts[0],
        motion: direction.motions[0],
        assets: [
          {
            assetId: openingAsset,
            role: "establishing",
            alt: `Synthetic establishing photograph for ${direction.title}`,
            focalX: 0.5,
            focalY: 0.5,
          },
        ],
        content: { eyebrow: direction.opening, title: direction.title, body: direction.thesis },
        effects: [],
        loadPriority: "eager",
        fallback: { layout: "cinematic-fullscreen", motion: "none" },
      },
      {
        id: `${direction.id}-climax-scene`,
        chapterId: "climax",
        layout: direction.layouts[1],
        motion: direction.motions[1],
        assets: [
          {
            assetId: climaxAsset,
            role: "climax",
            alt: `Synthetic climax photograph for ${direction.title}`,
            focalX: 0.5,
            focalY: 0.45,
          },
        ],
        content: { eyebrow: direction.climax, title: direction.signature, body: direction.ending },
        effects: [{ id: "grain", version: "1", fallback: "none" }],
        loadPriority: "nearby",
        fallback: { layout: "editorial-split", motion: "none" },
      },
    ],
    transitions: [
      {
        fromSceneId: `${direction.id}-opening-scene`,
        toSceneId: `${direction.id}-climax-scene`,
        type: direction.transition,
        durationMs: 700,
      },
    ],
    globalEffects: [],
    typography: {
      personality: direction.personality,
      displayScale: "expressive",
      bodyMeasure: "readable",
    },
    navigation: {
      type: "chapter-marks",
      showProgress: true,
      keyboard: true,
      label: `${direction.title} chapters`,
    },
    responsiveRules: [
      ...[`${direction.id}-opening-scene`, `${direction.id}-climax-scene`].map((target) => ({
        target,
        breakpoint: "mobile" as const,
        layout: "minimal-gallery",
        motion: "gentle-reveal",
        effectTier: "A" as const,
      })),
    ],
  };
}

export const fixtureExperienceSpecs = [
  createFixture({
    id: "fixture-rainy-mountain",
    title: "After the Rain",
    thesis: "A mountain railway appears and disappears through weather.",
    metaphor: "a moving train window",
    opening: "Departure in rain",
    climax: "The cloud finally lifts",
    ending: "The rails continue beyond the last frame.",
    personality: "documentary",
    atmosphere: "mist",
    palette: "slate and moss sampled from the mountain photographs",
    motion: "measured",
    navigation: "railway stations",
    signature: "Fog clears from the window to reveal the summit.",
    layouts: ["horizontal-travel", "layered-depth"],
    motions: ["horizontal-drift", "depth-reveal"],
    transition: "wipe",
  }),
  createFixture({
    id: "fixture-tokyo-night",
    title: "11:47 PM",
    thesis: "One night assembled from flashes, reflections, and missed trains.",
    metaphor: "a last-train departure board",
    opening: "The city switches on",
    climax: "A crossing freezes under camera flash",
    ending: "The final platform empties.",
    personality: "contemporary",
    atmosphere: "electric",
    palette: "ink black with photograph-derived neon accents",
    motion: "urgent",
    navigation: "subway line",
    signature: "A camera flash freezes the busiest crossing into silence.",
    layouts: ["contact-sheet", "cinematic-fullscreen"],
    motions: ["camera-flash", "exposure-reveal"],
    transition: "flash",
  }),
  createFixture({
    id: "fixture-tropical-beach",
    title: "Seven Days Under the Sun",
    thesis: "Time stretches between water, light, and long empty horizons.",
    metaphor: "the changing tide",
    opening: "First light on water",
    climax: "The horizon fills the entire frame",
    ending: "A last footprint disappears.",
    personality: "quiet",
    atmosphere: "sun-washed",
    palette: "high-key sand with sea-derived blue",
    motion: "quiet",
    navigation: "tide marks",
    signature: "The interface recedes until only the horizon remains.",
    layouts: ["cinematic-fullscreen", "horizontal-travel"],
    motions: ["slow-zoom", "gentle-reveal"],
    transition: "dissolve",
  }),
  createFixture({
    id: "fixture-family-roadtrip",
    title: "Are We There Yet?",
    thesis: "A family journey remembered through roadside fragments and laughter.",
    metaphor: "a glovebox full of keepsakes",
    opening: "Everything gets packed",
    climax: "Everyone fits into one imperfect photograph",
    ending: "The map folds with new creases.",
    personality: "playful",
    atmosphere: "warm",
    palette: "postcard reds and faded road-map neutrals",
    motion: "measured",
    navigation: "road map",
    signature: "Scattered keepsakes align into the family portrait.",
    layouts: ["scattered-prints", "timeline"],
    motions: ["rise-and-settle", "gentle-reveal"],
    transition: "page-turn",
  }),
  createFixture({
    id: "fixture-minimal-weekend",
    title: "Sunday, Slowly",
    thesis: "A small weekend told through pauses and ordinary details.",
    metaphor: "an unfinished contact sheet",
    opening: "No itinerary",
    climax: "Late light reaches the kitchen table",
    ending: "The final frame is intentionally empty.",
    personality: "quiet",
    atmosphere: "still",
    palette: "paper white with one warm photographic accent",
    motion: "quiet",
    navigation: "frame numbers",
    signature: "The page holds still with the late light.",
    layouts: ["contact-sheet", "editorial-split"],
    motions: ["blur-to-focus", "gentle-reveal"],
    transition: "crossfade",
  }),
  createFixture({
    id: "fixture-hiking-adventure",
    title: "Above the Tree Line",
    thesis: "Effort, altitude, and scale build toward one exposed ridge.",
    metaphor: "an elevation profile",
    opening: "The path disappears into trees",
    climax: "The ridge arrives all at once",
    ending: "Boots return to the valley floor.",
    personality: "documentary",
    atmosphere: "exposed",
    palette: "rock neutrals with safety-orange wayfinding",
    motion: "measured",
    navigation: "elevation markers",
    signature: "The scroll climbs before the ridge opens edge to edge.",
    layouts: ["timeline", "layered-depth"],
    motions: ["clip-reveal", "depth-reveal"],
    transition: "slide-over",
  }),
] satisfies ExperienceSpec[];
