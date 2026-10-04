import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function HorizontalTravelScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);

  return (
    <Motion className="overflow-hidden bg-[#101619] py-20 text-[#eef2ee] md:py-28">
      <header className="mx-auto mb-12 max-w-7xl px-6 md:px-12">
        <p className="text-xs uppercase tracking-[0.38em] text-white/45">{scene.content.eyebrow}</p>
        <div className="mt-5 grid items-end gap-6 md:grid-cols-[2fr_1fr]">
          <h2 className="text-balance text-5xl font-light leading-[0.92] md:text-8xl">
            {scene.content.title}
          </h2>
          {scene.content.body && (
            <p className="max-w-md text-sm leading-6 text-white/55 md:text-base">
              {scene.content.body}
            </p>
          )}
        </div>
      </header>
      <div className="flex snap-x gap-5 overflow-x-auto px-6 pb-8 md:gap-8 md:px-[calc((100vw-80rem)/2+3rem)]">
        {resolved.map(({ asset, placement }, index) => (
          <figure
            key={`${scene.id}-${asset.id}`}
            className="w-[82vw] shrink-0 snap-center md:w-[58vw] lg:w-[46vw]"
          >
            <img
              src={asset.src}
              alt={placement.alt}
              width={asset.width}
              height={asset.height}
              loading={imageLoading(scene.loadPriority, index)}
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
              style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
            />
            <figcaption className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/45">
              <span className="h-px w-8 bg-white/30" />
              {placement.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </Motion>
  );
}
