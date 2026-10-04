import { createElement, type ReactNode } from "react";
import { NoEffect } from "../effects/effects";
import {
  experienceSpecSchema,
  type EffectSpec,
  type ExperienceMediaAsset,
  type ExperienceSpec,
} from "../schemas/experience-spec";
import { resolveTypography } from "../typography/typography";
import {
  effectRegistry,
  motionRegistry,
  sceneRegistry,
  transitionRegistry,
} from "./default-registries";
import {
  resolveResponsiveScene,
  useRuntimePresentation,
  type RuntimePresentation,
} from "./responsive";
import { validateRuntimeReferences } from "./validation";

interface ExperienceRuntimeProps {
  spec: ExperienceSpec | unknown;
  assets: ExperienceMediaAsset[];
  onDiagnostic?: (message: string) => void;
}

export function ExperienceRuntime({ spec: input, assets, onDiagnostic }: ExperienceRuntimeProps) {
  const parsed = experienceSpecSchema.safeParse(input);
  if (!parsed.success) {
    onDiagnostic?.(`Invalid ExperienceSpec: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
    return <InvalidExperience />;
  }

  const spec = parsed.data;
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const diagnostics = validateRuntimeReferences(spec, new Set(assetMap.keys()));
  for (const diagnostic of diagnostics) onDiagnostic?.(`${diagnostic.path}: ${diagnostic.message}`);

  const content = (
    <main
      id="experience-start"
      className={`${resolveTypography(spec.typography.personality)} w-full overflow-x-clip`}
      data-experience-id={spec.id}
      data-schema-version={spec.schemaVersion}
    >
      <ExperienceNavigation spec={spec} />
      <RuntimeScenes spec={spec} assets={assetMap} />
    </main>
  );

  return applyEffects(content, spec.globalEffects);
}

function RuntimeScenes({
  spec,
  assets,
}: {
  spec: ExperienceSpec;
  assets: ReadonlyMap<string, ExperienceMediaAsset>;
}) {
  const presentation = useRuntimePresentation();
  return spec.scenes.map((scene) => {
    const incomingTransition = spec.transitions.find(
      (transition) => transition.toSceneId === scene.id,
    );
    return (
      <RuntimeScene
        key={scene.id}
        scene={scene}
        responsiveRules={spec.responsiveRules}
        assets={assets}
        presentation={presentation}
        incomingTransition={incomingTransition}
      />
    );
  });
}

function RuntimeScene({
  scene,
  responsiveRules,
  assets,
  presentation,
  incomingTransition,
}: {
  scene: ExperienceSpec["scenes"][number];
  responsiveRules: ExperienceSpec["responsiveRules"];
  assets: ReadonlyMap<string, ExperienceMediaAsset>;
  presentation: RuntimePresentation;
  incomingTransition?: ExperienceSpec["transitions"][number];
}) {
  const resolvedScene = resolveResponsiveScene(scene, responsiveRules, presentation);
  const Scene =
    sceneRegistry.resolve(resolvedScene.layout) ?? sceneRegistry.resolve(scene.fallback.layout);
  const Motion =
    motionRegistry.resolve(resolvedScene.motion) ?? motionRegistry.resolve(scene.fallback.motion);
  if (!Scene || !Motion) return <UnknownScene title={scene.content.title} />;
  const rendered = <Scene scene={resolvedScene} assets={assets} motion={Motion} />;
  const Transition =
    transitionRegistry.resolve(incomingTransition?.type ?? "cut") ??
    transitionRegistry.resolve("cut");
  const section = (
    <section
      id={scene.id}
      aria-label={scene.content.title || scene.content.eyebrow}
      data-layout={resolvedScene.layout}
      data-motion={resolvedScene.motion}
      data-reduced-motion={presentation.reducedMotion}
    >
      {applyEffects(rendered, scene.effects)}
    </section>
  );
  if (!Transition) return section;
  return (
    <Transition
      durationMs={incomingTransition?.durationMs ?? 0}
      reducedMotion={presentation.reducedMotion}
    >
      {section}
    </Transition>
  );
}

function applyEffects(children: ReactNode, effects: EffectSpec[]): ReactNode {
  return effects.reduceRight<ReactNode>((current, effect) => {
    const Effect =
      effectRegistry.resolve(effect.id) ?? effectRegistry.resolve(effect.fallback) ?? NoEffect;
    return createElement(Effect, { effect, children: current });
  }, children);
}

function ExperienceNavigation({ spec }: { spec: ExperienceSpec }) {
  if (!spec.navigation.showProgress) return null;

  if (spec.navigation.type === "scene-progress") {
    return (
      <nav
        aria-label={spec.navigation.label}
        className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 rounded-full bg-black/55 px-2.5 py-4 backdrop-blur-md md:flex"
      >
        {spec.scenes.map((scene, index) => (
          <a
            key={scene.id}
            href={`#${scene.id}`}
            className="group relative block size-3 rounded-full border border-white/60 transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label={sceneNavigationLabel(scene.content.title, index)}
          >
            <span className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 whitespace-nowrap bg-black/75 px-2 py-1 text-[10px] uppercase tracking-wider text-white group-hover:block group-focus-visible:block">
              {scene.content.title || `Scene ${index + 1}`}
            </span>
          </a>
        ))}
      </nav>
    );
  }

  if (spec.navigation.type === "minimal-progress") {
    return (
      <nav
        aria-label={spec.navigation.label}
        className="fixed inset-x-0 top-0 z-50 flex h-1 bg-black/20"
      >
        {spec.scenes.map((scene, index) => (
          <a
            key={scene.id}
            href={`#${scene.id}`}
            className="h-full flex-1 border-r border-white/30 bg-white/45 transition-[height,background-color] hover:h-2 hover:bg-white focus-visible:h-2 focus-visible:bg-white focus-visible:outline-none"
            aria-label={sceneNavigationLabel(scene.content.title, index)}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label={spec.navigation.label}
      className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/70 px-3 py-2 text-white backdrop-blur-md"
    >
      {spec.scenes.map((scene, index) => (
        <a
          key={scene.id}
          href={`#${scene.id}`}
          className="grid size-8 shrink-0 place-items-center rounded-full text-xs hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={sceneNavigationLabel(scene.content.title, index)}
        >
          {index + 1}
        </a>
      ))}
    </nav>
  );
}

function sceneNavigationLabel(title: string | undefined, index: number): string {
  return `Go to ${title || `scene ${index + 1}`}`;
}

function InvalidExperience() {
  return (
    <main className="grid min-h-[70svh] place-items-center bg-neutral-950 px-6 text-center text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          This memory needs attention
        </p>
        <h1 className="mt-5 text-3xl">We couldn&apos;t open this experience.</h1>
        <p className="mt-3 text-white/60">Your photographs are safe. Please try again shortly.</p>
      </div>
    </main>
  );
}

function UnknownScene({ title }: { title?: string }) {
  return (
    <div className="grid min-h-[50svh] place-items-center bg-neutral-950 px-6 text-center text-white">
      <div>
        <h2 className="text-3xl">{title || "A moment from the journey"}</h2>
        <p className="mt-3 text-white/60">This scene is available in a newer experience player.</p>
      </div>
    </div>
  );
}
