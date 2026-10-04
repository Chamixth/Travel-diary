import type { SceneRendererProps } from "../runtime/types";
import { imageLoading, objectPosition, resolveSceneAssets } from "./shared";

export function LayeredDepthScene({ scene, assets, motion: Motion }: SceneRendererProps) {
  const resolved = resolveSceneAssets(scene, assets).slice(0, 3);
  const primary = resolved[0];

  return (
    <Motion className="relative min-h-[110svh] overflow-hidden bg-[#0b1012] text-white">
      {primary && (
        <img
          src={primary.asset.src}
          alt={primary.placement.alt}
          width={primary.asset.width}
          height={primary.asset.height}
          loading={imageLoading(scene.loadPriority)}
          fetchPriority={scene.loadPriority === "eager" ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-55 blur-[1px]"
          style={{
            objectPosition: objectPosition(primary.placement.focalX, primary.placement.focalY),
          }}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,8,10,0.9),rgba(4,8,10,0.15)_58%,rgba(4,8,10,0.7))]" />
      {resolved[1] && (
        <img
          src={resolved[1].asset.src}
          alt={resolved[1].placement.alt}
          width={resolved[1].asset.width}
          height={resolved[1].asset.height}
          loading={imageLoading(scene.loadPriority, 1)}
          decoding="async"
          className="absolute right-[5vw] top-[12vh] hidden h-[44vh] w-[30vw] rotate-2 object-cover shadow-2xl ring-1 ring-white/20 md:block"
          style={{
            objectPosition: objectPosition(
              resolved[1].placement.focalX,
              resolved[1].placement.focalY,
            ),
          }}
        />
      )}
      {resolved[2] && (
        <img
          src={resolved[2].asset.src}
          alt={resolved[2].placement.alt}
          width={resolved[2].asset.width}
          height={resolved[2].asset.height}
          loading={imageLoading(scene.loadPriority, 2)}
          decoding="async"
          className="absolute bottom-[8vh] right-[18vw] hidden h-[32vh] w-[24vw] -rotate-2 object-cover shadow-2xl ring-1 ring-white/20 lg:block"
          style={{
            objectPosition: objectPosition(
              resolved[2].placement.focalX,
              resolved[2].placement.focalY,
            ),
          }}
        />
      )}
      <div className="relative z-10 flex min-h-[110svh] max-w-[52rem] flex-col justify-center px-7 py-24 md:px-[9vw]">
        <p className="text-xs uppercase tracking-[0.4em] text-white/55">{scene.content.eyebrow}</p>
        <h2 className="mt-6 text-balance text-5xl font-light leading-[0.9] md:text-8xl">
          {scene.content.title}
        </h2>
        {scene.content.body && (
          <p className="mt-8 max-w-md text-pretty text-base leading-7 text-white/65">
            {scene.content.body}
          </p>
        )}
      </div>
    </Motion>
  );
}
