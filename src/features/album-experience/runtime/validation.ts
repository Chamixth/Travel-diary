import type { ExperienceSpec } from "../schemas/experience-spec";
import {
  effectRegistry,
  motionRegistry,
  sceneRegistry,
  transitionRegistry,
} from "./default-registries";

export interface RuntimeDiagnostic {
  severity: "error" | "warning";
  path: string;
  message: string;
}

export function validateRuntimeReferences(
  spec: ExperienceSpec,
  availableAssetIds: ReadonlySet<string>,
): RuntimeDiagnostic[] {
  const diagnostics: RuntimeDiagnostic[] = [];
  for (const scene of spec.scenes) {
    if (!sceneRegistry.has(scene.layout) && !sceneRegistry.has(scene.fallback.layout)) {
      diagnostics.push({
        severity: "error",
        path: `scenes.${scene.id}.layout`,
        message: `No renderer is registered for ${scene.layout} or its fallback.`,
      });
    } else if (!sceneRegistry.has(scene.layout)) {
      diagnostics.push({
        severity: "warning",
        path: `scenes.${scene.id}.layout`,
        message: `Using fallback renderer for unknown layout ${scene.layout}.`,
      });
    }
    if (!motionRegistry.has(scene.motion) && !motionRegistry.has(scene.fallback.motion)) {
      diagnostics.push({
        severity: "error",
        path: `scenes.${scene.id}.motion`,
        message: `No motion renderer is registered for ${scene.motion} or its fallback.`,
      });
    }
    for (const placement of scene.assets) {
      if (!availableAssetIds.has(placement.assetId)) {
        diagnostics.push({
          severity: "error",
          path: `scenes.${scene.id}.assets.${placement.assetId}`,
          message: "The scene references a missing media asset.",
        });
      }
    }
    for (const effect of scene.effects) {
      if (!effectRegistry.has(effect.id) && !effectRegistry.has(effect.fallback)) {
        diagnostics.push({
          severity: "warning",
          path: `scenes.${scene.id}.effects.${effect.id}`,
          message: `Effect ${effect.id} and fallback ${effect.fallback} are unavailable.`,
        });
      }
    }
  }
  for (const transition of spec.transitions) {
    if (!transitionRegistry.has(transition.type)) {
      diagnostics.push({
        severity: "warning",
        path: `transitions.${transition.fromSceneId}.${transition.toSceneId}`,
        message: `Transition ${transition.type} is unavailable; the runtime will use a cut.`,
      });
    }
  }
  return diagnostics;
}
