import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function CinematicFullscreenScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const primary = resolveSceneAssets(scene, assets)[0];

  return (
    <Motion className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      {primary ? (
        <img
          src={primary.asset.src}
          alt={primary.placement.alt}
          width={primary.asset.width}
          height={primary.asset.height}
          loading={imageLoading(scene.loadPriority)}
          fetchPriority={scene.loadPriority === "eager" ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: objectPosition(primary.placement.focalX, primary.placement.focalY),
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
      <div className="relative z-10 flex min-h-[100svh] max-w-5xl flex-col justify-end px-6 pb-[12vh] md:px-12 lg:px-20">
        {scene.content.eyebrow && (
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/70">
            {scene.content.eyebrow}
          </p>
        )}
        {scene.content.title && (
          <h2 className="max-w-4xl text-balance text-5xl font-light leading-[0.95] md:text-8xl">
            {scene.content.title}
          </h2>
        )}
        {scene.content.body && (
          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-white/75 md:text-lg">
            {scene.content.body}
          </p>
        )}
      </div>
    </Motion>
  );
}
