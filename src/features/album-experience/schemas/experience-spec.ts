import { z } from "zod";

export const EXPERIENCE_SCHEMA_VERSION = "1.0" as const;

const emotionalArcSchema = z
  .object({
    opening: z.string(),
    development: z.string(),
    climax: z.string(),
    ending: z.string(),
  })
  .strict();

const experienceDnaSchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    creativeThesis: z.string().min(1),
    interactionMetaphor: z.string().min(1),
    emotionalArc: emotionalArcSchema,
    visualLanguage: z
      .object({
        personality: z.array(z.string()),
        atmosphere: z.array(z.string()),
        paletteStrategy: z.string(),
        textureStrategy: z.string().optional(),
        typographyStrategy: z.string(),
        imageTreatment: z.string(),
      })
      .strict(),
    motionLanguage: z
      .object({
        personality: z.string(),
        intensity: z.number().min(0).max(1),
        pacing: z.string(),
        physics: z.string(),
        scrollBehavior: z.string(),
      })
      .strict(),
    navigationConcept: z.string(),
    signatureMoment: z
      .object({
        concept: z.string().min(1),
        sceneId: z.string().optional(),
        assetIds: z.array(z.string()),
        memoryTest: z.string().min(1),
      })
      .strict(),
    constraints: z
      .object({
        avoid: z.array(z.string()),
        accessibilityNotes: z.array(z.string()),
        performanceNotes: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

const effectSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    params: z.record(z.unknown()).optional(),
    fallback: z.string(),
  })
  .strict();

const sceneSchema = z
  .object({
    id: z.string().min(1),
    chapterId: z.string().min(1),
    layout: z.string().min(1),
    motion: z.string().min(1),
    assets: z.array(
      z
        .object({
          assetId: z.string().min(1),
          role: z.string().min(1),
          alt: z.string().min(1),
          focalX: z.number().min(0).max(1),
          focalY: z.number().min(0).max(1),
        })
        .strict(),
    ),
    content: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        body: z.string().optional(),
        caption: z.string().optional(),
      })
      .strict(),
    effects: z.array(effectSchema),
    loadPriority: z.enum(["eager", "nearby", "lazy"]),
    fallback: z
      .object({
        layout: z.string().min(1),
        motion: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const experienceSpecSchema = z
  .object({
    schemaVersion: z.literal(EXPERIENCE_SCHEMA_VERSION),
    generatorVersion: z.string().min(1),
    id: z.string().min(1),
    dna: experienceDnaSchema,
    scenes: z.array(sceneSchema).min(1),
    transitions: z.array(
      z
        .object({
          fromSceneId: z.string().min(1),
          toSceneId: z.string().min(1),
          type: z.string().min(1),
          durationMs: z.number().int().min(0).max(10_000),
        })
        .strict(),
    ),
    globalEffects: z.array(effectSchema),
    typography: z
      .object({
        personality: z.string().min(1),
        displayScale: z.string().min(1),
        bodyMeasure: z.string().min(1),
      })
      .strict(),
    navigation: z
      .object({
        type: z.string().min(1),
        showProgress: z.boolean(),
        keyboard: z.boolean(),
        label: z.string().min(1),
      })
      .strict(),
    responsiveRules: z.array(
      z
        .object({
          target: z.string().min(1),
          breakpoint: z.enum(["mobile", "tablet", "desktop"]),
          layout: z.string().min(1),
          motion: z.string().min(1),
          effectTier: z.enum(["A", "B", "C"]),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((spec, context) => {
    const sceneIds = new Set<string>();
    for (const scene of spec.scenes) {
      if (sceneIds.has(scene.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate scene id: ${scene.id}`,
        });
      }
      sceneIds.add(scene.id);
    }
    if (spec.dna.signatureMoment.sceneId && !sceneIds.has(spec.dna.signatureMoment.sceneId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The signature moment references an unknown scene.",
      });
    }
    for (const transition of spec.transitions) {
      if (!sceneIds.has(transition.fromSceneId) || !sceneIds.has(transition.toSceneId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A transition references an unknown scene.",
        });
      }
    }
  });

export type ExperienceSpec = z.infer<typeof experienceSpecSchema>;
export type ExperienceScene = ExperienceSpec["scenes"][number];
export type EffectSpec = ExperienceSpec["globalEffects"][number];
export type ResponsiveRule = ExperienceSpec["responsiveRules"][number];

export const experienceVersionSchema = z
  .object({
    id: z.string().min(1),
    tripId: z.string().min(1),
    version: z.number().int().positive(),
    schemaVersion: z.literal(EXPERIENCE_SCHEMA_VERSION),
    generatorVersion: z.string().min(1),
    sourceType: z.string().min(1),
    sourceId: z.string().optional(),
    spec: experienceSpecSchema,
    provenance: z
      .object({
        agentId: z.string().min(1),
        promptVersion: z.string().min(1),
        provider: z.string().min(1),
        model: z.string().optional(),
        providerRequestId: z.string().optional(),
        inputTokens: z.number().int().nonnegative().optional(),
        outputTokens: z.number().int().nonnegative().optional(),
        latencyMs: z.number().int().nonnegative().optional(),
        fallbackReason: z.string().optional(),
      })
      .strict()
      .optional(),
    createdAt: z.string().min(1),
  })
  .strict();

export type ExperienceVersion = z.infer<typeof experienceVersionSchema>;

export interface ExperienceMediaAsset {
  id: string;
  src: string;
  thumbnailSrc?: string;
  width: number;
  height: number;
}
