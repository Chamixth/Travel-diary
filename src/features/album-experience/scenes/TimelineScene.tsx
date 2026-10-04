import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function TimelineScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);

  return (
    <Motion className="bg-[#f5f3ed] px-5 py-24 text-[#20201e] md:px-12 md:py-32">
      <header className="mx-auto mb-16 max-w-3xl text-center md:mb-24">
        <p className="text-xs uppercase tracking-[0.35em] text-black/45">{scene.content.eyebrow}</p>
        <h2 className="mt-5 text-balance text-5xl font-light leading-none md:text-7xl">
          {scene.content.title}
        </h2>
        {scene.content.body && (
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-black/60">
            {scene.content.body}
          </p>
        )}
      </header>
      <ol className="relative mx-auto max-w-5xl before:absolute before:bottom-0 before:left-[11px] before:top-0 before:w-px before:bg-black/20 md:before:left-1/2">
        {resolved.map(({ asset, placement }, index) => (
          <li
            key={`${scene.id}-${asset.id}`}
            className="relative mb-16 grid pl-10 last:mb-0 md:grid-cols-2 md:gap-20 md:pl-0"
          >
            <span className="absolute left-[5px] top-4 size-3 rounded-full border-2 border-[#f5f3ed] bg-neutral-800 ring-1 ring-black/30 md:left-1/2 md:-translate-x-1/2" />
            <figure className={index % 2 === 0 ? "md:pr-0" : "md:col-start-2"}>
              <img
                src={asset.src}
                alt={placement.alt}
                width={asset.width}
                height={asset.height}
                loading={imageLoading(scene.loadPriority, index)}
                decoding="async"
                className="aspect-[3/2] w-full object-cover shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
                style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
              />
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">
                {String(index + 1).padStart(2, "0")} · {placement.role}
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </Motion>
  );
}
