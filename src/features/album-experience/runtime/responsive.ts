import { useSyncExternalStore } from "react";
import type { ExperienceScene, ResponsiveRule } from "../schemas/experience-spec";

export type RuntimeBreakpoint = "mobile" | "tablet" | "desktop";

export interface RuntimePresentation {
  breakpoint: RuntimeBreakpoint;
  reducedMotion: boolean;
}

export function resolveResponsiveScene(
  scene: ExperienceScene,
  rules: ResponsiveRule[],
  presentation: RuntimePresentation,
): ExperienceScene {
  if (presentation.reducedMotion) {
    return { ...scene, layout: scene.fallback.layout, motion: scene.fallback.motion };
  }
  const rule = rules.find(
    (candidate) =>
      candidate.target === scene.id && candidate.breakpoint === presentation.breakpoint,
  );
  if (!rule) return scene;
  return { ...scene, layout: rule.layout, motion: rule.motion };
}

export function useRuntimePresentation(): RuntimePresentation {
  return decodeSnapshot(useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot));
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("resize", onChange, { passive: true });
  reducedMotion.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    reducedMotion.removeEventListener("change", onChange);
  };
}

function browserSnapshot(): string {
  if (typeof window === "undefined") return serverSnapshot();
  const breakpoint: RuntimeBreakpoint =
    window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "1" : "0";
  return `${breakpoint}:${reduced}`;
}

function serverSnapshot(): string {
  return "desktop:0";
}

function decodeSnapshot(snapshot: string): RuntimePresentation {
  const [breakpoint, reduced] = snapshot.split(":");
  return {
    breakpoint: (breakpoint as RuntimeBreakpoint) || "desktop",
    reducedMotion: reduced === "1",
  };
}
