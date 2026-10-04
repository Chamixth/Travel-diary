import type { ComponentType, ReactNode } from "react";
import type { EffectSpec, ExperienceMediaAsset, ExperienceScene } from "../schemas/experience-spec";

export interface SceneRendererProps {
  scene: ExperienceScene;
  assets: ReadonlyMap<string, ExperienceMediaAsset>;
  motion: MotionRenderer;
}

export type SceneRenderer = ComponentType<SceneRendererProps>;

export interface MotionRendererProps {
  children: ReactNode;
  className?: string;
}

export type MotionRenderer = ComponentType<MotionRendererProps>;

export interface EffectRendererProps {
  effect: EffectSpec;
  children: ReactNode;
}

export type EffectRenderer = ComponentType<EffectRendererProps>;

export interface TransitionRendererProps {
  children: ReactNode;
  durationMs: number;
  reducedMotion: boolean;
}

export type TransitionRenderer = ComponentType<TransitionRendererProps>;
