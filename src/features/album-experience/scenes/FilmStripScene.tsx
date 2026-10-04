import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function FilmStripScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);

  return (
    <Motion className="min-h-[85svh] overflow-hidden bg-[#12110f] py-20 text-[#f4eedf] md:py-28">
      <header className="mx-auto mb-10 max-w-6xl px-6 md:px-12">
        {scene.content.eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-amber-100/55">
            {scene.content.eyebrow}
          </p>
        )}
        {scene.content.title && (
          <h2 className="mt-4 max-w-4xl text-4xl font-light tracking-tight md:text-6xl">
            {scene.content.title}
          </h2>
        )}
      </header>
      <div className="border-y-[10px] border-dashed border-[#d9cda8]/45 bg-black px-6 py-7 md:px-[8vw]">
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 md:gap-7">
          {resolved.map(({ asset, placement }, index) => (
            <figure
              key={`${scene.id}-${asset.id}`}
              className="w-[78vw] max-w-2xl shrink-0 snap-center bg-[#ece3cf] p-2 text-neutral-900 shadow-2xl md:w-[48vw]"
            >
              <img
                src={asset.src}
                alt={placement.alt}
                width={asset.width}
                height={asset.height}
                loading={imageLoading(scene.loadPriority, index)}
                decoding="async"
                className="aspect-[3/2] w-full object-cover"
                style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
              />
              <figcaption className="flex justify-between px-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black/55">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{placement.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {scene.content.body && (
        <p className="mx-auto mt-10 max-w-2xl px-6 text-pretty text-base leading-7 text-[#f4eedf]/65 md:px-12">
          {scene.content.body}
        </p>
      )}
    </Motion>
  );
}
