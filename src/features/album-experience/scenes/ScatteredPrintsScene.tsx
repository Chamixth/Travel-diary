import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

const DESKTOP_PLACEMENTS = [
  "md:-rotate-3 md:translate-y-10",
  "md:rotate-2 md:-translate-y-8",
  "md:-rotate-1 md:translate-y-20",
  "md:rotate-3 md:translate-y-2",
];

export function ScatteredPrintsScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);

  return (
    <Motion className="relative min-h-[100svh] overflow-hidden bg-[#d9cfbc] px-6 py-24 text-[#2a2119] md:px-[7vw] md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#6d5b45_0.6px,transparent_0.6px)] [background-size:8px_8px]" />
      <header className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-black/50">{scene.content.eyebrow}</p>
        <h2 className="mt-5 text-balance font-serif text-5xl italic leading-none md:text-7xl">
          {scene.content.title}
        </h2>
      </header>
      <div className="relative z-10 mx-auto mt-14 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-3">
        {resolved.map(({ asset, placement }, index) => (
          <figure
            key={`${scene.id}-${asset.id}`}
            className={`bg-[#f6f0e4] p-3 pb-10 shadow-[0_22px_55px_rgba(50,35,20,0.2)] ${DESKTOP_PLACEMENTS[index % DESKTOP_PLACEMENTS.length]}`}
          >
            <img
              src={asset.src}
              alt={placement.alt}
              width={asset.width}
              height={asset.height}
              loading={imageLoading(scene.loadPriority, index)}
              decoding="async"
              className="aspect-[4/5] w-full bg-black/10 object-cover"
              style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
            />
            <figcaption className="mt-3 truncate font-serif text-sm italic text-black/55">
              {placement.role}
            </figcaption>
          </figure>
        ))}
      </div>
      {scene.content.body && (
        <p className="relative z-10 mx-auto mt-24 max-w-xl text-center text-base leading-7 text-black/60">
          {scene.content.body}
        </p>
      )}
    </Motion>
  );
}
