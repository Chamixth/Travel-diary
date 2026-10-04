import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function EditorialSplitScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const primary = resolveSceneAssets(scene, assets)[0];

  return (
    <Motion className="grid min-h-[85svh] bg-[#f1eee7] text-[#191816] md:grid-cols-2">
      <div className="flex items-center px-7 py-20 md:px-[10vw] md:py-24">
        <div className="max-w-lg">
          {scene.content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              {scene.content.eyebrow}
            </p>
          )}
          <h2 className="mt-6 text-balance font-serif text-5xl leading-none md:text-7xl">
            {scene.content.title}
          </h2>
          {scene.content.body && (
            <p className="mt-8 max-w-md text-base leading-7 text-black/65">{scene.content.body}</p>
          )}
        </div>
      </div>
      <figure className="relative min-h-[60svh] overflow-hidden md:min-h-full">
        {primary ? (
          <img
            src={primary.asset.src}
            alt={primary.placement.alt}
            width={primary.asset.width}
            height={primary.asset.height}
            loading={imageLoading(scene.loadPriority)}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: objectPosition(primary.placement.focalX, primary.placement.focalY),
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        )}
        {scene.content.caption && (
          <figcaption className="absolute bottom-5 right-5 bg-[#f1eee7] px-4 py-2 text-xs text-black/60">
            {scene.content.caption}
          </figcaption>
        )}
      </figure>
    </Motion>
  );
}
