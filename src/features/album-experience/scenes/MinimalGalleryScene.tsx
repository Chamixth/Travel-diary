import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function MinimalGalleryScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);
  return (
    <Motion className="bg-white px-5 py-24 text-neutral-950 md:px-12 md:py-32">
      <header className="mx-auto mb-16 max-w-4xl md:mb-24">
        {scene.content.eyebrow && (
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">
            {scene.content.eyebrow}
          </p>
        )}
        {scene.content.title && (
          <h2 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-6xl">
            {scene.content.title}
          </h2>
        )}
      </header>
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-12 md:gap-8">
        {resolved.map(({ asset, placement }, index) => (
          <figure
            key={`${scene.id}-${asset.id}`}
            className={index % 3 === 0 ? "md:col-span-8" : "md:col-span-4"}
          >
            <img
              src={asset.src}
              alt={placement.alt}
              width={asset.width}
              height={asset.height}
              loading={imageLoading(scene.loadPriority, index)}
              decoding="async"
              className="aspect-[4/3] h-auto w-full bg-neutral-100 object-cover"
              style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
            />
          </figure>
        ))}
      </div>
      {scene.content.body && (
        <p className="mx-auto mt-14 max-w-2xl text-pretty text-lg leading-8 text-neutral-600">
          {scene.content.body}
        </p>
      )}
    </Motion>
  );
}
