import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function ContactSheetScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets);

  return (
    <Motion className="min-h-[90svh] bg-[#e8e3d7] px-5 py-20 text-[#191816] md:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 grid gap-5 border-b border-black/30 pb-7 md:grid-cols-[1fr_2fr] md:items-end">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/50">
            {scene.content.eyebrow || "Selected frames"}
          </p>
          <h2 className="text-balance text-4xl font-semibold uppercase leading-[0.9] tracking-[-0.04em] md:text-7xl">
            {scene.content.title}
          </h2>
        </header>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {resolved.map(({ asset, placement }, index) => (
            <figure key={`${scene.id}-${asset.id}`}>
              <img
                src={asset.src}
                alt={placement.alt}
                width={asset.width}
                height={asset.height}
                loading={imageLoading(scene.loadPriority, index)}
                decoding="async"
                className="aspect-[4/3] w-full bg-black/10 object-cover grayscale-[15%]"
                style={{ objectPosition: objectPosition(placement.focalX, placement.focalY) }}
              />
              <figcaption className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-black/50">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{placement.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        {scene.content.body && (
          <p className="ml-auto mt-12 max-w-xl border-l border-black/30 pl-5 text-base leading-7 text-black/65">
            {scene.content.body}
          </p>
        )}
      </div>
    </Motion>
  );
}
