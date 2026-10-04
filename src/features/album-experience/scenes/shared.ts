import type { ExperienceMediaAsset, ExperienceScene } from "../schemas/experience-spec";

export function resolveSceneAssets(
  scene: ExperienceScene,
  assets: ReadonlyMap<string, ExperienceMediaAsset>,
) {
  return scene.assets
    .map((placement) => {
      const asset = assets.get(placement.assetId);
      return asset ? { asset, placement } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export function objectPosition(focalX: number, focalY: number): string {
  return `${Math.round(focalX * 100)}% ${Math.round(focalY * 100)}%`;
}

export function imageLoading(
  priority: ExperienceScene["loadPriority"],
  assetIndex = 0,
): "eager" | "lazy" {
  // The opening asset of a nearby scene should begin decoding before the user
  // reaches it. Supporting frames and distant scenes remain lazy.
  return priority === "eager" || (priority === "nearby" && assetIndex === 0) ? "eager" : "lazy";
}
